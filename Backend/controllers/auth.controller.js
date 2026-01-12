import { User, Agent } from '../models/index.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import crypto from 'crypto';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { email, password, fullName, phone, address, city, state, pincode, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

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
            role: role || 'customer',
            status: 'active'
        });

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                token,
                refreshToken
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
    const transaction = await sequelize.transaction();
    try {
        const { email, password, fullName, phone, address, city, state, pincode, referredByCode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            fullName,
            phone,
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            role: 'agent',
            status: 'active'
        }, { transaction });

        // Generate unique agent code
        const agentCode = `AG${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Find parent agent if code provided
        let parentAgentId = null;
        let level = 1;

        if (referredByCode) {
            const parentAgent = await Agent.findOne({
                where: { agentCode: referredByCode },
                transaction
            });
            if (parentAgent) {
                parentAgentId = parentAgent.id;
                level = parentAgent.level + 1;
            }
        }

        // Create agent profile
        const agent = await Agent.create({
            userId: user.id,
            agentCode,
            parentAgentId,
            level,
            status: 'pending',
            walletBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0
        }, { transaction });

        await transaction.commit();

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            success: true,
            message: 'Agent registered successfully. Pending admin approval.',
            data: {
                user: user.toJSON(),
                agentCode: agent.agentCode,
                token,
                refreshToken
            }
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
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
            console.log('Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
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

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // If user is an agent, include agent profile
        let agentProfile = null;
        if (user.role === 'agent') {
            agentProfile = await Agent.findOne({ where: { userId: user.id } });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                agentProfile: agentProfile ? agentProfile.toJSON() : null,
                token,
                refreshToken
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

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If user is an agent, include agent profile
        let agentProfile = null;
        if (user.role === 'agent') {
            agentProfile = await Agent.findOne({ where: { userId: user.id } });
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

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user
        await user.update({
            fullName: fullName || user.fullName,
            phone: phone || user.phone,
            address: address || user.address,
            city: city || user.city,
            state: state || user.state,
            pincode: pincode || user.pincode
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: user.toJSON() }
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

        const user = await User.findByPk(req.user.id);
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
        await user.update({ password: newPassword });

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

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If email exists, password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpiry
        });

        // TODO: Send email with reset link
        // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // await sendEmail({ to: email, subject: 'Password Reset', resetUrl });

        res.json({
            success: true,
            message: 'Password reset link sent to email',
            // For testing only - remove in production
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
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

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password and clear reset token
        await user.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

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
