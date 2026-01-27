import express from 'express';
import {
    register,
    registerAgent,
    login,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyAgentCode,
    logout,
    verifyEmailOTP,
    resendVerification,
    refreshSession
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/register-agent', registerAgent);
router.get('/verify-code/:code', verifyAgentCode);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyEmailOTP);
router.post('/resend-verification', resendVerification);
router.post('/refresh', refreshSession);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
