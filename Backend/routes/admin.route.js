import express from 'express';
import {
    getDashboardStats,
    getAllPolicies,
    getPolicyDetails,
    approvePolicy,
    rejectPolicy,
    getAllAgents,
    approveAgent,
    rejectAgent,
    getAllCustomers,
    getWithdrawalRequests,
    processWithdrawal,
    getAllCommissions,
    getCommissionSettings,
    updateCommissionSettings,
    updateAgent,
    createAgent
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Policies
router.get('/policies', getAllPolicies);
router.get('/policies/:id', getPolicyDetails);
router.patch('/policies/:id/approve', approvePolicy);
router.patch('/policies/:id/reject', rejectPolicy);

// Agents
router.get('/agents', getAllAgents);
router.post('/agents', createAgent);
router.patch('/agents/:id/approve', approveAgent);
router.patch('/agents/:id/reject', rejectAgent);
router.put('/agents/:id', updateAgent);

// Customers
router.get('/customers', getAllCustomers);

// Withdrawals
router.get('/withdrawals', getWithdrawalRequests);
router.patch('/withdrawals/:id', processWithdrawal);

// Commissions
router.get('/commissions', getAllCommissions);
router.get('/commission-settings', getCommissionSettings);
router.put('/commission-settings', updateCommissionSettings);

export default router;
