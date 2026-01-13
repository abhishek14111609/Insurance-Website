import { Agent, User, Policy, Commission, Withdrawal } from '../models/index.js';
import sequelize from '../config/database.js';
import { getAgentCommissionSummary } from '../utils/commission.util.js';
import { notifyAgentApproval } from '../utils/notification.util.js';
import { Op } from 'sequelize';
import crypto from 'crypto';

// @desc    Register as agent
// @route   POST /api/agents/register
// @access  Private (authenticated user)
export const registerAgent = async (req, res) => {
    try {
        const {
            parentAgentCode,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            panNumber,
            aadharNumber
        } = req.body;

        // Check if user already has an agent profile
        const existingAgent = await Agent.findOne({ where: { userId: req.user.id } });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered as an agent'
            });
        }

        // Generate unique agent code
        const agentCode = `AG${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Find parent agent if code provided
        let parentAgentId = null;
        let level = 1;

        if (parentAgentCode) {
            const parentAgent = await Agent.findOne({ where: { agentCode: parentAgentCode } });
            if (parentAgent) {
                parentAgentId = parentAgent.id;
                level = parentAgent.level + 1;
            }
        }

        // Create agent profile
        const agent = await Agent.create({
            userId: req.user.id,
            agentCode,
            parentAgentId,
            level,
            status: 'pending',
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            panNumber,
            aadharNumber,
            walletBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0
        });

        res.status(201).json({
            success: true,
            message: 'Agent registration submitted successfully. Pending admin approval.',
            data: { agent }
        });
    } catch (error) {
        console.error('Register agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering agent',
            error: error.message
        });
    }
};

// @desc    Get agent profile
// @route   GET /api/agents/profile
// @access  Private (agent)
export const getAgentProfile = async (req, res) => {
    try {
        const agent = await Agent.findOne({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'user' },
                { model: Agent, as: 'parentAgent', include: [{ model: User, as: 'user' }] }
            ]
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        res.json({
            success: true,
            data: { agent }
        });
    } catch (error) {
        console.error('Get agent profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agent profile',
            error: error.message
        });
    }
};

// @desc    Update agent profile
// @route   PUT /api/agents/profile
// @access  Private (agent)
export const updateAgentProfile = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const agent = await Agent.findOne({
            where: { userId: req.user.id },
            include: [{ model: User, as: 'user' }],
            transaction
        });

        if (!agent) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const {
            fullName,
            phone,
            address,
            city,
            state,
            pincode,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            panNumber,
            aadharNumber
        } = req.body;

        // Update User fields
        if (agent.user) {
            await agent.user.update({
                fullName: fullName || agent.user.fullName,
                phone: phone || agent.user.phone,
                address: address || agent.user.address,
                city: city || agent.user.city,
                state: state || agent.user.state,
                pincode: pincode || agent.user.pincode
            }, { transaction });
        }

        // Update Agent fields
        await agent.update({
            bankName: bankName || agent.bankName,
            accountNumber: accountNumber || agent.accountNumber,
            ifscCode: ifscCode || agent.ifscCode,
            accountHolderName: accountHolderName || agent.accountHolderName,
            panNumber: panNumber || agent.panNumber,
            aadharNumber: aadharNumber || agent.aadharNumber
        }, { transaction });

        await transaction.commit();

        // Refetch to get updated data
        const updatedAgent = await Agent.findOne({
            where: { id: agent.id },
            include: [{ model: User, as: 'user' }]
        });

        res.json({
            success: true,
            message: 'Agent profile updated successfully',
            data: { agent: updatedAgent }
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Update agent profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating agent profile',
            error: error.message
        });
    }
};

// @desc    Get agent hierarchy (tree structure)
// @route   GET /api/agents/hierarchy
// @access  Private (agent)
export const getAgentHierarchy = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get all sub-agents recursively
        const buildHierarchy = async (agentId) => {
            const subAgents = await Agent.findAll({
                where: { parentAgentId: agentId },
                include: [{ model: User, as: 'user' }]
            });

            const hierarchy = [];
            for (const subAgent of subAgents) {
                const node = {
                    ...subAgent.toJSON(),
                    subAgents: await buildHierarchy(subAgent.id)
                };
                hierarchy.push(node);
            }
            return hierarchy;
        };

        const hierarchy = await buildHierarchy(agent.id);

        res.json({
            success: true,
            data: { hierarchy }
        });
    } catch (error) {
        console.error('Get agent hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agent hierarchy',
            error: error.message
        });
    }
};

// @desc    Get all downline agents (team)
// @route   GET /api/agents/team
// @access  Private (agent)
export const getTeam = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Logic to get all downline agents (recursively or iterative)
        // Level 1: Direct sub-agents
        const level1 = await Agent.findAll({
            where: { parentAgentId: agent.id },
            include: [{ model: User, as: 'user' }]
        });

        let team = level1.map(a => ({ ...a.toJSON(), relativeLevel: 1 }));

        // Level 2: Sub-agents of Level 1
        if (level1.length > 0) {
            const level1Ids = level1.map(a => a.id);
            const level2 = await Agent.findAll({
                where: { parentAgentId: level1Ids },
                include: [{ model: User, as: 'user' }]
            });
            team = [...team, ...level2.map(a => ({ ...a.toJSON(), relativeLevel: 2 }))];

            // Level 3: Sub-agents of Level 2
            if (level2.length > 0) {
                const level2Ids = level2.map(a => a.id);
                const level3 = await Agent.findAll({
                    where: { parentAgentId: level2Ids },
                    include: [{ model: User, as: 'user' }]
                });
                team = [...team, ...level3.map(a => ({ ...a.toJSON(), relativeLevel: 3 }))];
            }
        }

        res.json({
            success: true,
            count: team.length,
            data: { team }
        });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team',
            error: error.message
        });
    }
};

// @desc    Get agent statistics
// @route   GET /api/agents/stats
// @access  Private (agent)
export const getAgentStats = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get policies sold
        const policiesCount = await Policy.count({ where: { agentId: agent.id } });

        // Get team size
        const teamSize = await Agent.count({ where: { parentAgentId: agent.id } });

        // This month stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthPolicies = await Policy.count({
            where: {
                agentId: agent.id,
                createdAt: { [Op.gte]: startOfMonth }
            }
        });

        const thisMonthCommissions = await Commission.sum('amount', {
            where: {
                agentId: agent.id,
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        const thisMonthNewMembers = await Agent.count({
            where: {
                parentAgentId: agent.id,
                createdAt: { [Op.gte]: startOfMonth }
            }
        });

        // Recent commissions
        const recentCommissions = await Commission.findAll({
            where: { agentId: agent.id },
            include: [{ model: Policy, as: 'policy' }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Upcoming Renewals (Expiring in next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcomingRenewalsCount = await Policy.count({
            where: {
                agentId: agent.id,
                status: 'APPROVED',
                endDate: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            }
        });

        // Top Performing Sub-agents (Direct only)
        const topPerformers = await Agent.findAll({
            where: { parentAgentId: agent.id },
            include: [{ model: User, as: 'user', attributes: ['fullName', 'email'] }],
            order: [['totalEarnings', 'DESC']],
            limit: 3
        });

        const stats = {
            totalEarnings: parseFloat(agent.totalEarnings),
            totalPolicies: policiesCount,
            teamSize: teamSize,
            walletBalance: parseFloat(agent.walletBalance),
            recentCommissions,
            upcomingRenewalsCount,
            topPerformers: topPerformers.map(a => ({
                name: a.user?.fullName,
                agentCode: a.agentCode,
                totalEarnings: parseFloat(a.totalEarnings),
                policiesSold: 0 // We'd need an extra count if we want this exact value per performer
            })),
            thisMonth: {
                policies: thisMonthPolicies,
                commissions: parseFloat(thisMonthCommissions),
                newMembers: thisMonthNewMembers
            }
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get agent stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agent statistics',
            error: error.message
        });
    }
};

// @desc    Get wallet information
// @route   GET /api/agents/wallet
// @access  Private (agent)
export const getWallet = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Stats for wallet
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthEarnings = await Commission.sum('amount', {
            where: {
                agentId: agent.id,
                createdAt: { [Op.gte]: startOfMonth },
                status: 'approved'
            }
        }) || 0;

        const pendingWithdrawalsAmount = await Withdrawal.sum('amount', {
            where: {
                agentId: agent.id,
                status: 'pending'
            }
        }) || 0;

        // Get recent transactions (commissions and withdrawals)
        const commissions = await Commission.findAll({
            where: { agentId: agent.id },
            include: [{
                model: Policy,
                as: 'policy',
                attributes: ['id', 'policyNumber', 'status'] // Only need basic info
            }],
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        const withdrawals = await Withdrawal.findAll({
            where: { agentId: agent.id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        // Combine into transactions for frontend
        const transactions = [
            ...commissions.map(c => ({
                id: `comm_${c.id}`,
                type: 'commission',
                amount: parseFloat(c.amount),
                description: `Commission for Policy #${c.policy?.policyNumber || 'N/A'}`,
                status: c.status,
                createdAt: c.createdAt
            })),
            ...withdrawals.map(w => ({
                id: `with_${w.id}`,
                type: 'withdrawal',
                amount: parseFloat(w.amount),
                description: 'Withdrawal Request',
                status: w.status,
                createdAt: w.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const walletData = {
            balance: parseFloat(agent.walletBalance),
            totalEarnings: parseFloat(agent.totalEarnings),
            totalWithdrawn: parseFloat(agent.totalWithdrawals),
            pendingWithdrawals: parseFloat(pendingWithdrawalsAmount),
            thisMonthEarnings: parseFloat(thisMonthEarnings),
            bankDetails: {
                bankName: agent.bankName,
                accountNumber: agent.accountNumber,
                accountHolderName: agent.accountHolderName
            }
        };

        res.json({
            success: true,
            data: {
                wallet: walletData,
                transactions
            }
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet information',
            error: error.message
        });
    }
};

// @desc    Request withdrawal
// @route   POST /api/agents/withdraw
// @access  Private (agent)
export const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;

        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid withdrawal amount'
            });
        }

        // Check if sufficient balance
        if (parseFloat(amount) > parseFloat(agent.walletBalance)) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance'
            });
        }

        // Check minimum withdrawal amount (e.g., ₹100)
        const minWithdrawal = 100;
        if (parseFloat(amount) < minWithdrawal) {
            return res.status(400).json({
                success: false,
                message: `Minimum withdrawal amount is ₹${minWithdrawal}`
            });
        }

        // Create withdrawal request
        const withdrawal = await Withdrawal.create({
            agentId: agent.id,
            amount,
            status: 'pending',
            bankDetails: {
                bankName: agent.bankName,
                accountNumber: agent.accountNumber,
                ifscCode: agent.ifscCode,
                accountHolderName: agent.accountHolderName
            }
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: { withdrawal }
        });
    } catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting withdrawal',
            error: error.message
        });
    }
};

// @desc    Get withdrawal history
// @route   GET /api/agents/withdrawals
// @access  Private (agent)
export const getWithdrawals = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const withdrawals = await Withdrawal.findAll({
            where: { agentId: agent.id },
            include: [{ model: User, as: 'processor' }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: withdrawals.length,
            data: { withdrawals }
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawals',
            error: error.message
        });
    }
};

// @desc    Get commissions
// @route   GET /api/agents/commissions
// @access  Private (agent)
export const getCommissions = async (req, res) => {
    try {
        const { status } = req.query;

        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const where = { agentId: agent.id };
        if (status) where.status = status;

        const commissions = await Commission.findAll({
            where,
            include: [{ model: Policy, as: 'policy' }],
            order: [['createdAt', 'DESC']]
        });

        // Calculate stats for frontend
        const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const pending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const paid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.amount), 0);
        const approved = commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + parseFloat(c.amount), 0);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonth = commissions
            .filter(c => new Date(c.createdAt) >= startOfMonth)
            .reduce((sum, c) => sum + parseFloat(c.amount), 0);

        res.json({
            success: true,
            count: commissions.length,
            data: {
                commissions,
                stats: {
                    totalEarned,
                    thisMonth,
                    pending,
                    paid: paid + approved // Count both paid and approved as 'paid' in stats if desired
                }
            }
        });
    } catch (error) {
        console.error('Get commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching commissions',
            error: error.message
        });
    }
};

// @desc    Get policies sold by agent
// @route   GET /api/agents/policies
// @access  Private (agent)
export const getPoliciesSold = async (req, res) => {
    try {
        const { status } = req.query;

        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const where = { agentId: agent.id };
        if (status) where.status = status;

        const policies = await Policy.findAll({
            where,
            attributes: {
                exclude: ['photos', 'ownerAddress', 'adminNotes', 'rejectionReason']
            },
            include: [{ model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: policies.length,
            data: { policies }
        });
    } catch (error) {
        console.error('Get policies sold error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policies',
            error: error.message
        });
    }
};

// @desc    Get customers of an agent
// @route   GET /api/agents/customers
// @access  Private (agent)
export const getAgentCustomers = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get all unique users who have a policy sold by this agent with policy count
        const customers = await User.findAll({
            include: [{
                model: Policy,
                as: 'policies',
                where: { agentId: agent.id },
                attributes: [] // Don't fetch policy fields in the select
            }],
            attributes: [
                'id',
                'fullName',
                'email',
                'phone',
                'city',
                'state',
                'followUpNotes',
                [sequelize.fn('COUNT', sequelize.col('policies.id')), 'policyCount'],
                [sequelize.fn('MAX', sequelize.col('policies.created_at')), 'lastPurchaseDate']
            ],
            group: ['User.id'],
            subQuery: false,
            raw: true
        });

        res.json({
            success: true,
            count: customers.length,
            data: { customers }
        });
    } catch (error) {
        console.error('Get agent customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

// @desc    Update customer follow-up notes
// @route   PATCH /api/agents/customers/:id/notes
// @access  Private (agent)
export const updateCustomerNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        // Verify customer belongs to this agent (has sold them a policy)
        const policy = await Policy.findOne({
            where: { agentId: agent.id, customerId: id }
        });

        if (!policy) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: This customer is not in your portfolio'
            });
        }

        await User.update({ followUpNotes: notes }, { where: { id } });

        res.json({
            success: true,
            message: 'Notes updated successfully'
        });
    } catch (error) {
        console.error('Update notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notes'
        });
    }
};

// @desc    Update sub-agent training progress
// @route   PATCH /api/agents/team/:id/training
// @access  Private (agent)
export const updateSubAgentTraining = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progress } = req.body;

        const parentAgent = await Agent.findOne({ where: { userId: req.user.id } });

        // Verify sub-agent is a direct downline
        const subAgent = await Agent.findOne({
            where: { id, parentAgentId: parentAgent.id }
        });

        if (!subAgent) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: This agent is not your direct sub-agent'
            });
        }

        await subAgent.update({
            trainingStatus: status || subAgent.trainingStatus,
            trainingProgress: progress !== undefined ? progress : subAgent.trainingProgress
        });

        res.json({
            success: true,
            message: 'Training progress updated successfully'
        });
    } catch (error) {
        console.error('Update training error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating training progress'
        });
    }
};
