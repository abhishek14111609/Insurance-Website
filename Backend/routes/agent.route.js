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
    getPoliciesSold,
    getAgentCustomers,
    updateCustomerNotes,
    updateSubAgentTraining,
    submitKYC,
    searchCustomer,
    agentAddPolicy
} from '../controllers/agent.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { uploadAgentDocs } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Agent registration (any authenticated user can register as agent)
router.post('/register', registerAgent);

// Agent-only routes
router.get('/profile', authorize('agent', 'admin'), getAgentProfile);
router.put('/profile', authorize('agent'), updateAgentProfile);

// KYC Submission
router.post('/submit-kyc', authorize('agent'), uploadAgentDocs.fields([
    { name: 'panPhoto', maxCount: 1 },
    { name: 'aadharPhotoFront', maxCount: 1 },
    { name: 'aadharPhotoBack', maxCount: 1 },
    { name: 'bankProofPhoto', maxCount: 1 }
]), submitKYC);
router.get('/hierarchy', authorize('agent'), getAgentHierarchy);
router.get('/team', authorize('agent'), getTeam);
router.get('/stats', authorize('agent'), getAgentStats);
router.get('/wallet', authorize('agent'), getWallet);
router.post('/withdraw', authorize('agent'), requestWithdrawal);
router.get('/withdrawals', authorize('agent'), getWithdrawals);
router.get('/commissions', authorize('agent'), getCommissions);
router.get('/policies', authorize('agent'), getPoliciesSold);
router.get('/customers', authorize('agent'), getAgentCustomers);
router.get('/customers/search/:phone', authorize('agent'), searchCustomer);
router.post('/policies/add', authorize('agent'), agentAddPolicy);
router.patch('/customers/:id/notes', authorize('agent'), updateCustomerNotes);
router.patch('/team/:id/training', authorize('agent'), updateSubAgentTraining);

export default router;
