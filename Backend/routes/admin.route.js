import express from 'express';
import {
    getDashboardStats,
    getAllPolicies,
    getPolicySalesHistory,
    getPolicyDetails,
    approvePolicy,
    rejectPolicy,
    getAllAgents,
    approveAgent,
    rejectAgent,
    getAgentById,
    getAllCustomers,
    getCustomerById,
    getWithdrawalRequests,
    getWithdrawalHistory,
    processWithdrawal,
    getAllCommissions,
    approveCommissionController,
    getCommissionSettings,
    updateCommissionSettings,
    updateAgent,
    createAgent,
    setupDatabase,
    verifyAgentKYC
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
router.get('/policies/sales/history', getPolicySalesHistory);
router.get('/policies/:id', getPolicyDetails);
router.patch('/policies/:id/approve', approvePolicy);
router.patch('/policies/:id/reject', rejectPolicy);

// Agents
router.get('/agents', getAllAgents);
router.get('/agents/:id', getAgentById); // Added route
router.post('/agents', createAgent);
router.patch('/agents/:id/approve', approveAgent);
router.patch('/agents/:id/reject', rejectAgent);
router.patch('/agents/:id/verify-kyc', verifyAgentKYC);
router.put('/agents/:id', updateAgent);

// Customers
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById); // Added route   ,

// Withdrawals
router.get('/withdrawals/history', getWithdrawalHistory);
router.get('/withdrawals', getWithdrawalRequests);
router.patch('/withdrawals/:id', processWithdrawal);

// Commissions
router.get('/commissions', getAllCommissions);
router.patch('/commissions/:id/approve', approveCommissionController);
router.get('/commission-settings', getCommissionSettings);
router.put('/commission-settings', updateCommissionSettings);

// System
router.post('/setup-db', setupDatabase);

export default router;