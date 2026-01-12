import express from 'express';
import {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
} from '../controllers/policyPlan.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPlans);
router.get('/:id', getPlanById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createPlan);
router.put('/:id', authenticate, authorize('admin'), updatePlan);
router.delete('/:id', authenticate, authorize('admin'), deletePlan);

export default router;
