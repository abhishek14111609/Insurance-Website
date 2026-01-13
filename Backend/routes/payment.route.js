import express from 'express';
import {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    handleWebhook
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/history', authenticate, getPaymentHistory);

// Webhook route (public - verified by Razorpay signature)
router.post('/webhook', handleWebhook);

export default router;
