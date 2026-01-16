import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
    try {
        // SECURITY: Prefer HTTP-only cookies over Authorization header
        // This ensures tokens are protected from XSS attacks
        // Authorization header support is maintained for API clients (non-browser)

        let token = null;

        // Check Origin/Referer to guess context (robust for localhost)
        const origin = req.headers.origin || req.headers.referer || '';
        const isAdminFrontend = origin.includes('5175') || origin.includes('admin');

        // Intelligent Token Selection
        if (isAdminFrontend) {
            // If accessing from Admin Frontend, prioritize admin_token
            if (req.cookies?.admin_token) {
                token = req.cookies.admin_token;
            } else if (req.cookies?.token) {
                // Fallback: mostly won't work for admin, but safely handled by role check later
                token = req.cookies.token;
            }
        } else {
            // If accessing from Customer Frontend, prioritize customer token
            if (req.cookies?.token) {
                token = req.cookies.token;
            } else if (req.cookies?.admin_token) {
                // Fallback
                token = req.cookies.admin_token;
            }
        }

        // Fallback to Authorization header only for API clients (non-browser)
        if (!token && req.header('Authorization')) {
            token = req.header('Authorization').replace('Bearer ', '');
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided. Please login again.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or blocked.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};
