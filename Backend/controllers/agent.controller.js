import { Agent, User, Policy, Commission, Withdrawal } from '../models/index.js';
import mongoose from 'mongoose';
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
        const existingAgent = await Agent.findOne({ userId: req.user._id });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered as an agent'
            });
        }

        // Generate unique agent code
        const randomBytes = crypto.randomBytes(3).toString('hex').toUpperCase();
        const agentCode = `AG${randomBytes}`;

        // Find parent agent if code provided
        let parentAgentId = null;
        let level = 1;

        if (parentAgentCode) {
            const parentAgent = await Agent.findOne({ agentCode: parentAgentCode });
            if (parentAgent) {
                parentAgentId = parentAgent._id;
                level = parentAgent.level + 1;
            }
        }

        // Create agent profile
        const agent = await Agent.create({
            userId: req.user._id,
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
        const agent = await Agent.findOne({ userId: req.user._id })
            .populate('user')
            .populate({
                path: 'parentAgent',
                populate: { path: 'user' }
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const agent = await Agent.findOne({ userId: req.user._id })
            .populate('user')
            .session(session);

        if (!agent) {
            await session.abortTransaction();
            await session.endSession();
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
            agent.user.fullName = fullName || agent.user.fullName;
            agent.user.phone = phone || agent.user.phone;
            agent.user.address = address || agent.user.address;
            agent.user.city = city || agent.user.city;
            agent.user.state = state || agent.user.state;
            agent.user.pincode = pincode || agent.user.pincode;
            await agent.user.save({ session });
        }

        // Update Agent fields
        agent.bankName = bankName || agent.bankName;
        agent.accountNumber = accountNumber || agent.accountNumber;
        agent.ifscCode = ifscCode || agent.ifscCode;
        agent.accountHolderName = accountHolderName || agent.accountHolderName;
        agent.panNumber = panNumber || agent.panNumber;
        agent.aadharNumber = aadharNumber || agent.aadharNumber;
        await agent.save({ session });

        await session.commitTransaction();
        await session.endSession();

        // Refetch to get updated data
        const updatedAgent = await Agent.findById(agent._id)
            .populate('user');

        res.json({
            success: true,
            message: 'Agent profile updated successfully',
            data: { agent: updatedAgent }
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
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
        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get all sub-agents recursively
        const buildHierarchy = async (agentId) => {
            const subAgents = await Agent.find({ parentAgentId: agentId })
                .populate('user');

            const hierarchy = [];
            for (const subAgent of subAgents) {
                const node = {
                    ...subAgent.toJSON(),
                    subAgents: await buildHierarchy(subAgent._id)
                };
                hierarchy.push(node);
            }
            return hierarchy;
        };

        const hierarchy = await buildHierarchy(agent._id);

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
        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Logic to get all downline agents (recursively or iterative)
        // Level 1: Direct sub-agents
        const level1 = await Agent.find({ parentAgentId: agent._id })
            .populate('user');

        let team = level1.map(a => ({ ...a.toJSON(), relativeLevel: 1 }));

        // Level 2: Sub-agents of Level 1
        if (level1.length > 0) {
            const level1Ids = level1.map(a => a._id);
            const level2 = await Agent.find({ parentAgentId: { $in: level1Ids } })
                .populate('user');
            team = [...team, ...level2.map(a => ({ ...a.toJSON(), relativeLevel: 2 }))];

            // Level 3: Sub-agents of Level 2
            if (level2.length > 0) {
                const level2Ids = level2.map(a => a._id);
                const level3 = await Agent.find({ parentAgentId: { $in: level2Ids } })
                    .populate('user');
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
        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get policies sold
        const policiesCount = await Policy.countDocuments({ agentId: agent._id });

        // Get team size
        const teamSize = await Agent.countDocuments({ parentAgentId: agent._id });

        // This month stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthPolicies = await Policy.countDocuments({
            agentId: agent._id,
            createdAt: { $gte: startOfMonth }
        });

        const thisMonthCommissionsResult = await Commission.aggregate([
            { $match: { agentId: agent._id, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thisMonthCommissions = thisMonthCommissionsResult[0]?.total || 0;

        const thisMonthNewMembers = await Agent.countDocuments({
            parentAgentId: agent._id,
            createdAt: { $gte: startOfMonth }
        });

        // Recent commissions
        const recentCommissions = await Commission.find({ agentId: agent._id })
            .populate('policy')
            .sort({ createdAt: -1 })
            .limit(5);

        // Upcoming Renewals (Expiring in next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const upcomingRenewalsCount = await Policy.countDocuments({
            agentId: agent._id,
            status: 'APPROVED',
            endDate: {
                $gte: new Date(),
                $lte: thirtyDaysFromNow
            }
        });

        // Top Performing Sub-agents (Direct only)
        const topPerformers = await Agent.find({ parentAgentId: agent._id })
            .populate({ path: 'user', select: 'fullName email' })
            .sort({ totalEarnings: -1 })
            .limit(3);

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
        const agent = await Agent.findOne({ userId: req.user._id });

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

        const thisMonthEarningsResult = await Commission.aggregate([
            { $match: { agentId: agent._id, createdAt: { $gte: startOfMonth }, status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thisMonthEarnings = thisMonthEarningsResult[0]?.total || 0;

        const pendingWithdrawalsResult = await Withdrawal.aggregate([
            { $match: { agentId: agent._id, status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingWithdrawalsAmount = pendingWithdrawalsResult[0]?.total || 0;

        // Get recent transactions (commissions and withdrawals)
        const commissions = await Commission.find({ agentId: agent._id })
            .populate({ path: 'policy', select: 'policyNumber status' })
            .sort({ createdAt: -1 })
            .limit(20);

        const withdrawals = await Withdrawal.find({ agentId: agent._id })
            .sort({ createdAt: -1 })
            .limit(20);

        // Combine into transactions for frontend
        const transactions = [
            ...commissions.map(c => ({
                id: `comm_${c._id}`,
                type: 'commission',
                amount: parseFloat(c.amount),
                description: `Commission for Policy #${c.policy?.policyNumber || 'N/A'}`,
                status: c.status,
                createdAt: c.createdAt
            })),
            ...withdrawals.map(w => ({
                id: `with_${w._id}`,
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

        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Check KYC status
        if (agent.kycStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Withdrawals are restricted until your KYC is verified. Please complete your KYC in the profile section.'
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
            agentId: agent._id,
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
        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const withdrawals = await Withdrawal.find({ agentId: agent._id })
            .populate('processor')
            .sort({ createdAt: -1 });

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

        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const where = { agentId: agent._id };
        if (status) where.status = status;

        const commissions = await Commission.find(where)
            .populate('policy')
            .sort({ createdAt: -1 });

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

        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        const where = { agentId: agent._id };
        if (status) where.status = status;

        const policies = await Policy.find(where)
            .select('-photos -ownerAddress -adminNotes -rejectionReason')
            .populate({ path: 'customer', select: 'fullName email phone' })
            .sort({ createdAt: -1 });

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
        const agent = await Agent.findOne({ userId: req.user._id });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent profile not found'
            });
        }

        // Get all unique customers who have policies sold by this agent
        const policies = await Policy.find({ agentId: agent._id })
            .populate('customer')
            .sort({ createdAt: -1 });
        
        // Group by customer
        const customerMap = new Map();
        policies.forEach(policy => {
            if (policy.customer) {
                const customerId = policy.customer._id.toString();
                if (!customerMap.has(customerId)) {
                    customerMap.set(customerId, {
                        ...policy.customer.toObject(),
                        policyCount: 1,
                        lastPurchaseDate: policy.createdAt
                    });
                } else {
                    const existing = customerMap.get(customerId);
                    existing.policyCount++;
                    if (new Date(policy.createdAt) > new Date(existing.lastPurchaseDate)) {
                        existing.lastPurchaseDate = policy.createdAt;
                    }
                }
            }
        });
        
        const customers = Array.from(customerMap.values());

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

        const agent = await Agent.findOne({ userId: req.user._id });

        // Verify customer belongs to this agent (has sold them a policy)
        const policy = await Policy.findOne({
            agentId: agent._id, 
            customerId: id
        });

        if (!policy) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: This customer is not in your portfolio'
            });
        }

        await User.findByIdAndUpdate(id, { followUpNotes: notes });

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

        const parentAgent = await Agent.findOne({ userId: req.user._id });

        // Verify sub-agent is a direct downline
        const subAgent = await Agent.findOne({
            _id: id, 
            parentAgentId: parentAgent._id
        });

        if (!subAgent) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: This agent is not your direct sub-agent'
            });
        }

        subAgent.trainingStatus = status || subAgent.trainingStatus;
        subAgent.trainingProgress = progress !== undefined ? progress : subAgent.trainingProgress;
        await subAgent.save();

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
// @desc    Submit KYC documents
// @route   POST /api/agents/submit-kyc
// @access  Private (agent)
export const submitKYC = async (req, res) => {
    try {
        const agent = await Agent.findOne({ userId: req.user._id });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent profile not found' });
        }

        const { panNumber, aadharNumber, bankName, accountNumber, ifscCode, accountHolderName } = req.body;
        const files = req.files;

        // Validation
        if (panNumber && !/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(panNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid PAN Number format' });
        }
        if (aadharNumber && !/^[0-9]{12}$/.test(aadharNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid Aadhaar Number format' });
        }
        if (ifscCode && !/[A-Z]{4}0[A-Z0-9]{6}/.test(ifscCode)) {
            return res.status(400).json({ success: false, message: 'Invalid IFSC Code format' });
        }

        const updateData = {
            panNumber: panNumber || agent.panNumber,
            aadharNumber: aadharNumber || agent.aadharNumber,
            bankName: bankName || agent.bankName,
            accountNumber: accountNumber || agent.accountNumber,
            ifscCode: ifscCode || agent.ifscCode,
            accountHolderName: accountHolderName || agent.accountHolderName,
            kycStatus: 'pending'
        };

        if (files) {
            // Store relative paths for easier serving (remove absolute path part)
            const getRelativePath = (file) => {
                const fullPath = file.path.replace(/\\/g, '/');
                const uploadIndex = fullPath.indexOf('uploads/');
                return uploadIndex !== -1 ? fullPath.substring(uploadIndex) : fullPath;
            };

            if (files.panPhoto) updateData.panPhoto = getRelativePath(files.panPhoto[0]);
            if (files.aadharPhotoFront) updateData.aadharPhotoFront = getRelativePath(files.aadharPhotoFront[0]);
            if (files.aadharPhotoBack) updateData.aadharPhotoBack = getRelativePath(files.aadharPhotoBack[0]);
            if (files.bankProofPhoto) updateData.bankProofPhoto = getRelativePath(files.bankProofPhoto[0]);
        }

        Object.assign(agent, updateData);
        await agent.save();

        res.json({
            success: true,
            message: 'KYC documents submitted successfully. Pending verification.',
            data: { agent }
        });
    } catch (error) {
        console.error('Submit KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting KYC documents',
            error: error.message
        });
    }
};
