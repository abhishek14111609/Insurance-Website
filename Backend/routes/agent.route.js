import express from 'express';
import {
    registerAgent,
    getAgentProfile,
    updateAgentProfile,
    getAgentHierarchy,
    getTeam,
    getAgentStats,
    getWallet,
    requestWithdrawal,
    getWithdrawals,
    getCommissions,
    getPoliciesSold
} from '../controllers/agent.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Agent registration (any authenticated user can register as agent)
router.post('/register', registerAgent);

// Agent-only routes
router.get('/profile', authorize('agent', 'admin'), getAgentProfile);
router.put('/profile', authorize('agent'), updateAgentProfile);
router.get('/hierarchy', authorize('agent'), getAgentHierarchy);
router.get('/team', authorize('agent'), getTeam);
router.get('/stats', authorize('agent'), getAgentStats);
router.get('/wallet', authorize('agent'), getWallet);
router.post('/withdraw', authorize('agent'), requestWithdrawal);
router.get('/withdrawals', authorize('agent'), getWithdrawals);
router.get('/commissions', authorize('agent'), getCommissions);
router.get('/policies', authorize('agent'), getPoliciesSold);

export default router;
