import { User, Agent, RefreshToken } from '../models/index.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import { sendEmail } from '../utils/email.util.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Cookie options helper (dev-friendly defaults)
const isProd = process.env.NODE_ENV === 'production';
// Unified cookie settings for all roles: one access cookie `token`, one refresh cookie `refresh_token`
const cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' ? true : isProd,
    sameSite: process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax'),
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for refresh token
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const saveRefreshToken = async (userId, token) => {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const tokenHash = hashToken(token);
    await RefreshToken.create({ userId, tokenHash, expiresAt });
};

const clearUserRefreshTokens = async (userId) => {
    await RefreshToken.deleteMany({ userId });
};

// Generate numeric OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (user, otp) => {
    // Log OTP for debugging purposes
    console.log(`Sending OTP to ${user.email} (Name: ${user.fullName}): ${otp}`);

    if (!otp) {
        console.error('CRITICAL ERROR: OTP is missing in sendOtpEmail');
        return; // Prevent sending broken email
    }

    await sendEmail({
        to: user.email,
        subject: `${otp} is your verification code - Pashudhan Suraksha`,
        text: `Your verification code is: ${otp}\n\nUse this code to verify your email address. It expires in 10 minutes.`,
        html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
                <h2 style="color: #333333; text-align: center; margin-bottom: 20px;">Verification Code</h2>
                <p style="font-size: 16px; color: #555555; text-align: center;">Hello ${user.fullName},</p>
                <p style="font-size: 16px; color: #555555; text-align: center;">Please use the following One Time Password (OTP) to verify your email address:</p>
                
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 30px 0; text-align: center;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2d3748; font-family: monospace;">${otp}</span>
                </div>
                
                <p style="font-size: 14px; color: #777777; text-align: center;">This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999999; text-align: center;">If you did not request this code, please ignore this email.</p>
            </div>
        `
    });
};

// Generate a 6-character agent code: prefix 'AG' + 4-digit number
const generateAgentCodeV2 = async () => {
    let code;
    let exists = true;

    while (exists) {
        const num = Math.floor(Math.random() * 10000); // 0000 - 9999
        code = `AG${num.toString().padStart(4, '0')}`;
        // Ensure uniqueness before returning
        exists = await Agent.exists({ agentCode: code });
    }

    return code;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        console.log('Register endpoint called. Body:', req.body);
        const { email, password, fullName, phone, address, city, state, pincode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // SECURITY: Force role to be customer for public registration
        const targetRole = 'customer';
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const user = await User.create({
            email,
            password, // Will be hashed automatically by model hook
            fullName,
            phone,
            address,
            city,
            state,
            pincode,
            role: targetRole,
            status: 'active',
            emailVerified: targetRole === 'admin' ? true : false, // Admin auto-verified
            otpCode: targetRole === 'admin' ? null : otp,
            otpExpires: targetRole === 'admin' ? null : otpExpires
        });

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        await saveRefreshToken(user._id, refreshToken);

        // Set unified cookies
        res.cookie('token', token, cookieOptions);
        res.cookie('refresh_token', refreshToken, refreshCookieOptions);

        if (targetRole !== 'admin') {
            // Send OTP email
            sendOtpEmail(user, otp).catch((err) => {
                console.error('Send OTP email failed:', err);
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email with the OTP sent.',
            data: {
                user: user.toJSON()
                // Token NOT included in response body - only in HTTP-only cookie
                // This prevents XSS attacks from stealing tokens
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// @desc    Register as agent (Public)
// @route   POST /api/auth/register-agent
// @access  Public
export const registerAgent = async (req, res) => {
    const session = await User.startSession();
    session.startTransaction();
    try {
        const { email, password, fullName, phone, address, city, state, pincode, referredByCode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const [user] = await User.create([{
            email,
            password,
            fullName,
            phone,
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            role: 'agent',
            status: 'active',
            emailVerified: false,
            otpCode: otp,
            otpExpires: otpExpires
        }], { session });

        // Generate unique agent code (AG + 4 digits)
        const agentCode = await generateAgentCodeV2();

        // Find parent agent if code provided
        let parentAgentId = null;
        let level = 1;

        const normalizedRefCode = referredByCode ? referredByCode.toUpperCase() : null;
        if (normalizedRefCode) {
            const parentAgent = await Agent.findOne({ agentCode: normalizedRefCode }).session(session);
            if (parentAgent) {
                parentAgentId = parentAgent._id;
                level = parentAgent.level + 1;
            }
        }

        // Create agent profile
        const [agent] = await Agent.create([{
            userId: user._id,
            agentCode,
            parentAgentId,
            level,
            status: 'pending',
            walletBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Send OTP email
        sendOtpEmail(user, otp).catch((err) => {
            console.error('Send OTP email failed:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Agent registered successfully. Please verify your email with the OTP sent.',
            data: {
                user: user.toJSON(),
                agentCode: agent.agentCode
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Register agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering agent',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, hasPassword: !!password });

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or blocked. Please contact support.'
            });
        }

        if (user.role !== 'admin' && !user.emailVerified) {
            // If unverified, we want to prompt them to enter OTP. 
            // We can check if their OTP is expired and send a new one automatically or just ask them to request one.
            // For simplicity, we just tell them to verify.
            return res.status(403).json({
                success: false,
                message: 'Please verify your email.',
                isUnverified: true // Frontend can use this to redirect to verify page
            });
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        await clearUserRefreshTokens(user._id);
        await saveRefreshToken(user._id, refreshToken);

        // Set unified cookies
        res.cookie('token', token, cookieOptions);
        res.cookie('refresh_token', refreshToken, refreshCookieOptions);
        // Set admin_token to avoid collisions with agent/customer cookies on admin routes
        if (user.role === 'admin') {
            res.cookie('admin_token', token, cookieOptions);
        }

        // If user is an agent, include agent profile
        let agentProfile = null;
        if (user.role === 'agent') {
            agentProfile = await Agent.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                agentProfile: agentProfile ? agentProfile.toJSON() : null
                // Token NOT included in response body - only in HTTP-only cookie
                // This prevents XSS attacks from stealing tokens
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
    try {
        if (req.user?._id) {
            await clearUserRefreshTokens(req.user._id);
        } else if (req.cookies?.refresh_token) {
            const decoded = jwt.decode(req.cookies.refresh_token);
            if (decoded?.id) {
                await clearUserRefreshTokens(decoded.id);
            }
        }
    } catch (e) {
        console.error('Logout clear refresh token error:', e);
    }
    // Clear cookies (legacy admin_token cleared for compatibility)
    res.clearCookie('token', cookieOptions);
    res.clearCookie('admin_token', cookieOptions);
    res.clearCookie('refresh_token', refreshCookieOptions);

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If user is an agent, include agent profile
        let agentProfile = null;
        if (user.role === 'agent') {
            agentProfile = await Agent.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            data: {
                user: user.toJSON(),
                agentProfile: agentProfile ? agentProfile.toJSON() : null
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, address, city, state, pincode } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user
        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.city = city || user.city;
        user.state = state || user.state;
        user.pincode = pincode || user.pincode;
        await user.save();

        // Fetch agent profile if user is an agent
        let agentProfile = null;
        if (user.role === 'agent') {
            agentProfile = await Agent.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: user.toJSON(),
                agentProfile: agentProfile ? agentProfile.toJSON() : null
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed automatically)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// @desc    Forgot password - send reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: true,
                message: 'If email exists, password reset link has been sent'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = hashToken(resetToken);
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || ''}/reset-password/${resetToken}`;
        await sendEmail({
            to: email,
            subject: 'Password Reset - Pashudhan Suraksha',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        });

        res.json({
            success: true,
            message: 'Password reset link sent to email'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing forgot password request',
            error: error.message
        });
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const hashed = hashToken(token);
        const user = await User.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        await clearUserRefreshTokens(user._id);

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }

        if (!user.otpCode || !user.otpExpires) {
            return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        user.emailVerified = true;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
    }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Security: Don't reveal if user exists
            return res.json({ success: true, message: 'If the account exists, a new OTP has been sent' });
        }

        if (user.emailVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOtpEmail(user, otp);

        res.json({ success: true, message: 'New OTP sent to your email' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (uses refresh token cookie)
export const refreshSession = async (req, res) => {
    try {
        const token = req.cookies?.refresh_token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tokenHash = hashToken(token);
        const stored = await RefreshToken.findOne({ userId: decoded.id, tokenHash });
        if (!stored || stored.expiresAt < new Date()) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.status !== 'active' || !user.emailVerified) {
            return res.status(401).json({ success: false, message: 'User not allowed' });
        }

        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await clearUserRefreshTokens(user._id);
        await saveRefreshToken(user._id, newRefreshToken);

        res.cookie('token', newAccessToken, cookieOptions);
        res.cookie('refresh_token', newRefreshToken, refreshCookieOptions);
        if (user.role === 'admin') {
            res.cookie('admin_token', newAccessToken, cookieOptions);
        }

        res.json({ success: true, message: 'Session refreshed' });
    } catch (error) {
        console.error('Refresh session error:', error);
        return res.status(401).json({ success: false, message: 'Unable to refresh session' });
    }
};

// @desc    Verify agent code (Public)
// @route   GET /api/auth/verify-code/:code
// @access  Public
export const verifyAgentCode = async (req, res) => {
    try {
        const { code } = req.params;

        const agent = await Agent.findOne({ agentCode: code.toUpperCase() })
            .populate({ path: 'userId', select: 'fullName' });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Invalid agent code'
            });
        }

        res.json({
            success: true,
            data: {
                id: agent._id?.toString() || agent.id,
                agentCode: agent.agentCode,
                fullName: agent.userId?.fullName,
                level: agent.level
            }
        });
    } catch (error) {
        console.error('Verify agent code error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying agent code'
        });
    }
};
