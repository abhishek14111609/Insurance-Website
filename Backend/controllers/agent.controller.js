import { Agent, User, Policy, Commission, Withdrawal } from '../models/index.js';
import { getAgentCommissionSummary } from '../utils/commission.util.js';
import { notifyAgentApproval } from '../utils/notification.util.js';
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
    try {
        const agent = await Agent.findOne({ where: { userId: req.user.id } });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const {
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            panNumber,
            aadharNumber
        } = req.body;

        await agent.update({
            bankName: bankName || agent.bankName,
            accountNumber: accountNumber || agent.accountNumber,
            ifscCode: ifscCode || agent.ifscCode,
            accountHolderName: accountHolderName || agent.accountHolderName,
            panNumber: panNumber || agent.panNumber,
            aadharNumber: aadharNumber || agent.aadharNumber
        });

        res.json({
            success: true,
            message: 'Agent profile updated successfully',
            data: { agent }
        });
    } catch (error) {
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

// @desc    Get direct sub-agents (team)
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

        const team = await Agent.findAll({
            where: { parentAgentId: agent.id },
            include: [{ model: User, as: 'user' }],
            order: [['createdAt', 'DESC']]
        });

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
        const approvedPolicies = await Policy.count({
            where: { agentId: agent.id, status: 'APPROVED' }
        });

        // Get team size
        const teamSize = await Agent.count({ where: { parentAgentId: agent.id } });

        // Get commission summary
        const commissionSummary = await getAgentCommissionSummary(agent.id);

        const stats = {
            agentCode: agent.agentCode,
            status: agent.status,
            level: agent.level,
            walletBalance: agent.walletBalance,
            totalEarnings: agent.totalEarnings,
            totalWithdrawals: agent.totalWithdrawals,
            policiesSold: policiesCount,
            approvedPolicies: approvedPolicies,
            teamSize: teamSize,
            commissions: commissionSummary
        };

        res.json({
            success: true,
            data: { stats }
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

        // Get recent transactions (commissions and withdrawals)
        const commissions = await Commission.findAll({
            where: { agentId: agent.id },
            include: [{ model: Policy, as: 'policy' }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const withdrawals = await Withdrawal.findAll({
            where: { agentId: agent.id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const wallet = {
            balance: agent.walletBalance,
            totalEarnings: agent.totalEarnings,
            totalWithdrawals: agent.totalWithdrawals,
            recentCommissions: commissions,
            recentWithdrawals: withdrawals
        };

        res.json({
            success: true,
            data: { wallet }
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

        // Check minimum withdrawal amount (e.g., ₹500)
        const minWithdrawal = 500;
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

        res.json({
            success: true,
            count: commissions.length,
            data: { commissions }
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
            include: [{ model: User, as: 'customer' }],
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
