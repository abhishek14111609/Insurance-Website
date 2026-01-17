import express from 'express';
import {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicyPayment,
    getPendingPolicies,
    uploadPolicyPhotos
} from '../controllers/policy.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { uploadPolicyPhotos as uploadPolicyPhotosMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

// Customer routes
router.post('/upload-photos', authenticate, authorize('customer', 'agent'), uploadPolicyPhotosMiddleware.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 }
]), uploadPolicyPhotos);
router.post('/', authenticate, authorize('customer', 'agent'), createPolicy);
router.get('/', authenticate, getPolicies);
router.get('/:id', authenticate, getPolicyById);
router.patch('/:id/payment-complete', authenticate, updatePolicyPayment);

// Admin routes - only pending policies list (approval/rejection handled in admin routes)
router.get('/admin/pending', authenticate, authorize('admin'), getPendingPolicies);

export default router;
