import express from 'express';
import {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicyPayment,
    getPendingPolicies,
    approvePolicy,
    rejectPolicy
} from '../controllers/policy.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, authorize('customer', 'agent'), createPolicy);
router.get('/', authenticate, getPolicies);
router.get('/:id', authenticate, getPolicyById);
router.patch('/:id/payment-complete', authenticate, updatePolicyPayment);

// Admin routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingPolicies);
router.patch('/:id/approve', authenticate, authorize('admin'), approvePolicy);
router.patch('/:id/reject', authenticate, authorize('admin'), rejectPolicy);

export default router;
