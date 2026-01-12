import { User, Policy, Agent, Payment, Commission, Withdrawal, Claim, CommissionSettings } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { calculateAndDistributeCommissions, approveCommission as approveCommissionUtil } from '../utils/commission.util.js';
import {
    notifyPolicyApproval,
    notifyPolicyRejection,
    notifyAgentApproval,
    notifyAgentRejection,
    notifyWithdrawalApproved,
    notifyWithdrawalRejected
} from '../utils/notification.util.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
export const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalCustomers = await User.count({ where: { role: 'customer' } });
        const totalAgents = await Agent.count();
        const activeAgents = await Agent.count({ where: { status: 'active' } });
        const pendingAgents = await Agent.count({ where: { status: 'pending' } });

        const totalPolicies = await Policy.count();
        const activePolicies = await Policy.count({ where: { status: 'APPROVED' } });
        const pendingPolicies = await Policy.count({
            where: { status: { [Op.in]: ['PENDING', 'PENDING_APPROVAL'] } }
        });

        const totalClaims = await Claim.count();
        const pendingClaims = await Claim.count({ where: { status: 'pending' } });

        // Get financial stats
        const totalPremium = await Policy.sum('premium', { where: { status: 'APPROVED' } }) || 0;
        const totalCommissions = await Commission.sum('amount') || 0;
        const pendingCommissions = await Commission.sum('amount', { where: { status: 'pending' } }) || 0;
        const paidCommissions = await Commission.sum('amount', { where: { status: 'approved' } }) || 0;

        const pendingWithdrawals = await Withdrawal.sum('amount', { where: { status: 'pending' } }) || 0;
        const totalWithdrawals = await Withdrawal.sum('amount', { where: { status: 'approved' } }) || 0;

        // Recent activities
        const recentPolicies = await Policy.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'customer' }]
        });

        const recentClaims = await Claim.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'customer' }, { model: Policy, as: 'policy' }]
        });

        const stats = {
            customers: {
                total: totalCustomers
            },
            agents: {
                total: totalAgents,
                active: activeAgents,
                pending: pendingAgents
            },
            policies: {
                total: totalPolicies,
                active: activePolicies,
                pending: pendingPolicies
            },
            claims: {
                total: totalClaims,
                pending: pendingClaims
            },
            financial: {
                totalPremium: parseFloat(totalPremium),
                totalCommissions: parseFloat(totalCommissions),
                pendingCommissions: parseFloat(pendingCommissions),
                paidCommissions: parseFloat(paidCommissions),
                pendingWithdrawals: parseFloat(pendingWithdrawals),
                totalWithdrawals: parseFloat(totalWithdrawals)
            },
            recentActivities: {
                policies: recentPolicies,
                claims: recentClaims
            }
        };

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// @desc    Get all policies with filters
// @route   GET /api/admin/policies
// @access  Private (admin)
export const getAllPolicies = async (req, res) => {
    try {
        const { status, paymentStatus, page = 1, limit = 20, search } = req.query;

        const where = {};
        if (status) where.status = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (search) {
            where[Op.or] = [
                { policyNumber: { [Op.like]: `%${search}%` } },
                { ownerName: { [Op.like]: `%${search}%` } },
                { ownerEmail: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: policies } = await Policy.findAndCountAll({
            where,
            include: [
                { model: User, as: 'customer' },
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] },
                { model: Payment, as: 'payments' }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { policies }
        });
    } catch (error) {
        console.error('Get all policies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policies',
            error: error.message
        });
    }
};

// @desc    Get policy details
// @route   GET /api/admin/policies/:id
// @access  Private (admin)
export const getPolicyDetails = async (req, res) => {
    try {
        const policy = await Policy.findByPk(req.params.id, {
            include: [
                { model: User, as: 'customer' },
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] },
                { model: Payment, as: 'payments' },
                { model: Commission, as: 'commissions', include: [{ model: Agent, as: 'agent' }] },
                { model: Claim, as: 'claims' },
                { model: User, as: 'approver' },
                { model: User, as: 'rejecter' }
            ]
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        res.json({
            success: true,
            data: { policy }
        });
    } catch (error) {
        console.error('Get policy details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy details',
            error: error.message
        });
    }
};

// @desc    Approve policy (enhanced with commission calculation)
// @route   PATCH /api/admin/policies/:id/approve
// @access  Private (admin)
export const approvePolicy = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { adminNotes } = req.body;

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        // Update policy status
        await policy.update({
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: req.user.id,
            adminNotes
        }, { transaction });

        // Calculate and distribute commissions
        const commissions = await calculateAndDistributeCommissions(policy);

        // Send notification
        await notifyPolicyApproval(policy);

        await transaction.commit();

        res.json({
            success: true,
            message: 'Policy approved successfully',
            data: {
                policy,
                commissionsCreated: commissions.length
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Approve policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving policy',
            error: error.message
        });
    }
};

// @desc    Reject policy
// @route   PATCH /api/admin/policies/:id/reject
// @access  Private (admin)
export const rejectPolicy = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const policy = await Policy.findByPk(req.params.id);
        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        await policy.update({
            status: 'REJECTED',
            rejectedAt: new Date(),
            rejectedBy: req.user.id,
            rejectionReason
        });

        // Send notification
        await notifyPolicyRejection(policy);

        res.json({
            success: true,
            message: 'Policy rejected successfully',
            data: { policy }
        });
    } catch (error) {
        console.error('Reject policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting policy',
            error: error.message
        });
    }
};

// @desc    Get all agents
// @route   GET /api/admin/agents
// @access  Private (admin)
export const getAllAgents = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;

        const where = {};
        if (status) where.status = status;

        const include = [{ model: User, as: 'user' }];
        if (search) {
            include[0].where = {
                [Op.or]: [
                    { fullName: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows: agents } = await Agent.findAndCountAll({
            where,
            include,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { agents }
        });
    } catch (error) {
        console.error('Get all agents error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agents',
            error: error.message
        });
    }
};

// @desc    Approve agent
// @route   PATCH /api/admin/agents/:id/approve
// @access  Private (admin)
export const approveAgent = async (req, res) => {
    try {
        const { adminNotes } = req.body;

        const agent = await Agent.findByPk(req.params.id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        await agent.update({
            status: 'active',
            approvedAt: new Date(),
            approvedBy: req.user.id,
            adminNotes
        });

        // Send notification
        await notifyAgentApproval(agent);

        res.json({
            success: true,
            message: 'Agent approved successfully',
            data: { agent }
        });
    } catch (error) {
        console.error('Approve agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving agent',
            error: error.message
        });
    }
};

// @desc    Reject agent
// @route   PATCH /api/admin/agents/:id/reject
// @access  Private (admin)
export const rejectAgent = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const agent = await Agent.findByPk(req.params.id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        await agent.update({
            status: 'rejected',
            rejectedAt: new Date(),
            rejectedBy: req.user.id,
            rejectionReason
        });

        // Send notification
        await notifyAgentRejection(agent);

        res.json({
            success: true,
            message: 'Agent rejected successfully',
            data: { agent }
        });
    } catch (error) {
        console.error('Reject agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting agent',
            error: error.message
        });
    }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (admin)
export const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const where = { role: 'customer' };
        if (search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: customers } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { customers }
        });
    } catch (error) {
        console.error('Get all customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

// @desc    Get withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private (admin)
export const getWithdrawalRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
            where,
            include: [
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] },
                { model: User, as: 'processor' }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { withdrawals }
        });
    } catch (error) {
        console.error('Get withdrawal requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal requests',
            error: error.message
        });
    }
};

// @desc    Process withdrawal (approve/reject)
// @route   PATCH /api/admin/withdrawals/:id
// @access  Private (admin)
export const processWithdrawal = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

        if (!action || !['approve', 'reject'].includes(action)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "approve" or "reject"'
            });
        }

        const withdrawal = await Withdrawal.findByPk(req.params.id, {
            include: [{ model: Agent, as: 'agent' }]
        });

        if (!withdrawal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found'
            });
        }

        if (withdrawal.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Withdrawal request is not in pending status'
            });
        }

        if (action === 'approve') {
            // Deduct from agent wallet
            const agent = withdrawal.agent;
            const newBalance = parseFloat(agent.walletBalance) - parseFloat(withdrawal.amount);

            if (newBalance < 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient wallet balance'
                });
            }

            await agent.update({
                walletBalance: newBalance,
                totalWithdrawals: parseFloat(agent.totalWithdrawals) + parseFloat(withdrawal.amount)
            }, { transaction });

            await withdrawal.update({
                status: 'approved',
                processedAt: new Date(),
                processedBy: req.user.id
            }, { transaction });

            // Send notification
            await notifyWithdrawalApproved(withdrawal, agent);

        } else {
            // Reject
            if (!rejectionReason) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }

            await withdrawal.update({
                status: 'rejected',
                rejectionReason,
                processedAt: new Date(),
                processedBy: req.user.id
            }, { transaction });

            // Send notification
            await notifyWithdrawalRejected(withdrawal, withdrawal.agent);
        }

        await transaction.commit();

        res.json({
            success: true,
            message: `Withdrawal ${action}d successfully`,
            data: { withdrawal }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Process withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal',
            error: error.message
        });
    }
};

// @desc    Get all commissions
// @route   GET /api/admin/commissions
// @access  Private (admin)
export const getAllCommissions = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: commissions } = await Commission.findAndCountAll({
            where,
            include: [
                { model: Agent, as: 'agent', include: [{ model: User, as: 'user' }] },
                { model: Policy, as: 'policy' }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { commissions }
        });
    } catch (error) {
        console.error('Get all commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching commissions',
            error: error.message
        });
    }
};

// @desc    Get commission settings
// @route   GET /api/admin/commission-settings
// @access  Private (admin)
export const getCommissionSettings = async (req, res) => {
    try {
        const settings = await CommissionSettings.findAll({
            order: [['level', 'ASC']]
        });

        res.json({
            success: true,
            data: { settings }
        });
    } catch (error) {
        console.error('Get commission settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching commission settings',
            error: error.message
        });
    }
};

// @desc    Update commission settings
// @route   PUT /api/admin/commission-settings
// @access  Private (admin)
export const updateCommissionSettings = async (req, res) => {
    try {
        const { settings } = req.body; // Array of settings

        if (!Array.isArray(settings)) {
            return res.status(400).json({
                success: false,
                message: 'Settings must be an array'
            });
        }

        const updatedSettings = [];

        for (const setting of settings) {
            const { id, level, percentage, description, isActive } = setting;

            if (id) {
                // Update existing
                const existing = await CommissionSettings.findByPk(id);
                if (existing) {
                    await existing.update({
                        percentage,
                        description,
                        isActive,
                        updatedBy: req.user.id
                    });
                    updatedSettings.push(existing);
                }
            } else if (level) {
                // Create new
                const newSetting = await CommissionSettings.create({
                    level,
                    percentage,
                    description,
                    isActive,
                    updatedBy: req.user.id
                });
                updatedSettings.push(newSetting);
            }
        }

        res.json({
            success: true,
            message: 'Commission settings updated successfully',
            data: { settings: updatedSettings }
        });
    } catch (error) {
        console.error('Update commission settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating commission settings',
            error: error.message
        });
    }
};
