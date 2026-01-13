import express from 'express';
import {
    createClaim,
    getClaims,
    getClaimById,
    getAllClaims,
    updateClaimStatus,
    uploadClaimDocuments
} from '../controllers/claim.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createClaim);
router.get('/', getClaims);
router.get('/:id', getClaimById);
router.post('/:id/documents', uploadClaimDocuments);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllClaims);
router.patch('/:id/status', authorize('admin'), updateClaimStatus);

export default router;
