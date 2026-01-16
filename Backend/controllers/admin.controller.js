import { User, Policy, Agent, Payment, Commission, Withdrawal, Claim, CommissionSettings } from '../models/index.js';
import mongoose from 'mongoose';
import { calculateAndDistributeCommissions, approveCommission } from '../utils/commission.util.js';
import {
    notifyPolicyApproval,
    notifyPolicyRejection,
    notifyAgentApproval,
    notifyAgentRejection,
    notifyWithdrawalApproved,
    notifyWithdrawalRejected
} from '../utils/notification.util.js';
import { seedDatabase } from '../utils/seed.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin)
export const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalAgents = await Agent.countDocuments();
        const activeAgents = await Agent.countDocuments({ status: 'active' });
        const pendingAgents = await Agent.countDocuments({ status: 'pending' });

        const totalPolicies = await Policy.countDocuments();
        const activePolicies = await Policy.countDocuments({ status: 'APPROVED' });
        const pendingPolicies = await Policy.countDocuments({
            status: { $in: ['PENDING', 'PENDING_APPROVAL'] }
        });

        const totalClaims = await Claim.countDocuments();
        const pendingClaims = await Claim.countDocuments({ status: 'pending' });

        // Get financial stats
        const premiumResult = await Policy.aggregate([
            { $match: { status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$premium' } } }
        ]);
        const totalPremium = premiumResult[0]?.total || 0;

        const commissionsResult = await Commission.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalCommissions = commissionsResult[0]?.total || 0;

        const pendingCommissionsResult = await Commission.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingCommissions = pendingCommissionsResult[0]?.total || 0;

        const approvedCommissionsResult = await Commission.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const paidCommissions = approvedCommissionsResult[0]?.total || 0;

        const pendingWithdrawalsResult = await Withdrawal.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingWithdrawals = pendingWithdrawalsResult[0]?.total || 0;

        const approvedWithdrawalsResult = await Withdrawal.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawals = approvedWithdrawalsResult[0]?.total || 0;

        // Remove or optimize recent activities if they cause performance issues
        // The current frontend doesn't use these in the stats object
        /*
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
        */

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
            where.$or = [
                { policyNumber: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { ownerEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const offset = (page - 1) * limit;

        const count = await Policy.countDocuments(where);
        const policies = await Policy.find(where)
            .select('-photos -ownerAddress -adminNotes -rejectionReason')
            .populate({ path: 'customer', select: 'fullName email phone' })
            .populate({
                path: 'agent',
                populate: { path: 'user', select: 'fullName' }
            })
            .populate('payments')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(parseInt(limit));

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
        const policy = await Policy.findById(req.params.id)
            .populate('customer')
            .populate({
                path: 'agent',
                populate: { path: 'user' }
            })
            .populate('payments')
            .populate({
                path: 'commissions',
                populate: { path: 'agent' }
            })
            .populate('claims')
            .populate('approver')
            .populate('rejecter');

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
    console.log(`[ApprovePolicy] Starting approval for policy ID: ${req.params.id}`);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { adminNotes } = req.body;

        const policy = await Policy.findById(req.params.id)
            .populate('customer')
            .session(session);

        if (!policy) {
            console.log(`[ApprovePolicy] Policy ${req.params.id} not found`);
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        console.log(`[ApprovePolicy] Found policy ${policy.policyNumber}, current status: ${policy.status}`);

        // Prevent redundant approval
        if (policy.status === 'APPROVED') {
            console.log(`[ApprovePolicy] Policy ${policy._id} already approved`);
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Policy is already approved'
            });
        }

        // Update policy status
        console.log(`[ApprovePolicy] Updating policy status to APPROVED for ID: ${policy._id}`);
        const adminId = (req.user && req.user._id) ? req.user._id : null;

        policy.status = 'APPROVED';
        policy.approvedAt = new Date();
        policy.approvedBy = adminId;
        policy.adminNotes = adminNotes;
        await policy.save({ session });
        console.log(`[ApprovePolicy] Policy status updated successfully`);

        // Calculate and distribute commissions
        console.log(`[ApprovePolicy] Calculating commissions for agent: ${policy.agentId}`);
        const commissions = await calculateAndDistributeCommissions(policy, session);
        console.log(`[ApprovePolicy] Created ${commissions.length} commission records`);

        // Create notification (wrapped in try-catch to not fail the whole approval)
        try {
            console.log(`[ApprovePolicy] Sending approval notification to customer ${policy.customerId}`);
            await notifyPolicyApproval(policy);
        } catch (notifyError) {
            console.error('[ApprovePolicy] Notification Error (non-blocking):', notifyError);
        }

        await session.commitTransaction();
        await session.endSession();
        console.log(`[ApprovePolicy] Transaction committed successfully`);

        // Reload policy to get the full state including associations for response
        const updatedPolicy = await Policy.findById(policy._id)
            .populate('customer')
            .populate({
                path: 'agent',
                populate: { path: 'user' }
            })
            .populate('payments');

        res.json({
            success: true,
            message: 'Policy approved successfully',
            data: {
                policy: updatedPolicy,
                commissionsCreated: commissions.length
            }
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.error('[ApprovePolicy] FATAL ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving policy: ' + error.message,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Reject policy
// @route   PATCH /api/admin/policies/:id/reject
// @access  Private (admin)
export const rejectPolicy = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const policy = await Policy.findById(req.params.id).session(session);
        if (!policy) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        if (policy.status === 'REJECTED') {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Policy is already rejected'
            });
        }

        policy.status = 'REJECTED';
        policy.rejectedAt = new Date();
        policy.rejectedBy = req.user._id;
        policy.rejectionReason = rejectionReason;
        await policy.save({ session });

        // Create notification (wrapped in try-catch to not fail the whole rejection)
        try {
            await notifyPolicyRejection(policy);
        } catch (notifyError) {
            console.error('[RejectPolicy] Notification Error (non-blocking):', notifyError);
        }

        await session.commitTransaction();
        await session.endSession();

        const updatedPolicy = await Policy.findById(policy._id)
            .populate('customer');

        res.json({
            success: true,
            message: 'Policy rejected successfully',
            data: { policy: updatedPolicy }
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
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

        const count = await Agent.countDocuments(where);
        
        let query = Agent.find(where)
            .populate('user')
            .populate({
                path: 'parentAgent',
                populate: { path: 'user' }
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        if (search) {
            // Apply search filter on populated user data
            const agents = await Agent.find(where)
                .populate('user')
                .populate({
                    path: 'parentAgent',
                    populate: { path: 'user' }
                });
            const filtered = agents.filter(agent => {
                const user = agent.user;
                return (user?.fullName?.includes(search) || user?.email?.includes(search));
            });
            const sliced = filtered.slice((page - 1) * limit, page * limit);
            
            // Helper to clean paths
            const cleanPath = (path) => {
                if (!path) return null;
                const normalized = path.replace(/\\/g, '/');
                const uploadIndex = normalized.indexOf('uploads/');
                return uploadIndex !== -1 ? normalized.substring(uploadIndex) : normalized;
            };

            const cleanedAgents = sliced.map(agent => {
                const agentJSON = agent.toJSON();
                agentJSON.panPhoto = cleanPath(agentJSON.panPhoto);
                agentJSON.aadharPhotoFront = cleanPath(agentJSON.aadharPhotoFront);
                agentJSON.aadharPhotoBack = cleanPath(agentJSON.aadharPhotoBack);
                agentJSON.bankProofPhoto = cleanPath(agentJSON.bankProofPhoto);
                return agentJSON;
            });
            
            return res.json({
                success: true,
                count: filtered.length,
                totalPages: Math.ceil(filtered.length / limit),
                currentPage: parseInt(page),
                data: { agents: cleanedAgents }
            });
        }
        
        const agents = await query;
        
        // Helper to clean paths
        const cleanPath = (path) => {
            if (!path) return null;
            const normalized = path.replace(/\\/g, '/');
            const uploadIndex = normalized.indexOf('uploads/');
            return uploadIndex !== -1 ? normalized.substring(uploadIndex) : normalized;
        };

        const cleanedAgents = agents.map(agent => {
            const agentJSON = agent.toJSON();
            agentJSON.panPhoto = cleanPath(agentJSON.panPhoto);
            agentJSON.aadharPhotoFront = cleanPath(agentJSON.aadharPhotoFront);
            agentJSON.aadharPhotoBack = cleanPath(agentJSON.aadharPhotoBack);
            agentJSON.bankProofPhoto = cleanPath(agentJSON.bankProofPhoto);
            return agentJSON;
        });

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { agents: cleanedAgents }
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

// @desc    Create new agent
// @route   POST /api/admin/agents
// @access  Private (admin)
export const createAgent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fullName, email, phone, password, address, city, state, pincode, parentId, commissionRate, status, agentCode } = req.body;

        // Basic validation
        if (!fullName || !email || !password) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and password are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create User
        const user = await User.create([{
            fullName,
            email,
            phone,
            password,
            address,
            city,
            state,
            pincode,
            role: 'agent',
            status: status === 'active' ? 'active' : 'inactive'
        }], { session });

        // Calculate level if parentId exists
        let level = 1;
        if (parentId && parentId !== '') {
            const parent = await Agent.findById(parentId).session(session);
            if (parent) {
                level = parent.level + 1;
            }
        }

        // Generate Agent Code if not provided
        let finalAgentCode = agentCode;
        if (!finalAgentCode || finalAgentCode === 'generated automatically') {
            const count = await Agent.countDocuments().session(session);
            finalAgentCode = `AGT${1000 + count + 1}`;
        }

        // Create Agent Profile
        const agent = await Agent.create([{
            userId: user[0]._id,
            agentCode: finalAgentCode,
            parentAgentId: parentId || null,
            level,
            status: status || 'active',
            commissionRate: commissionRate || 15,
            walletBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0,
            approvedAt: status === 'active' ? new Date() : null,
            approvedBy: status === 'active' ? req.user._id : null
        }], { session });

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: {
                user: user[0].toJSON(),
                agent: agent[0]
            }
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.error('Create agent error detailed:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating agent',
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

        const agent = await Agent.findById(req.params.id)
            .populate('user');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        agent.status = 'active';
        agent.approvedAt = new Date();
        agent.approvedBy = req.user._id;
        agent.adminNotes = adminNotes;
        await agent.save();

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

        const agent = await Agent.findById(req.params.id)
            .populate('user');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        agent.status = 'rejected';
        agent.rejectedAt = new Date();
        agent.rejectedBy = req.user._id;
        agent.rejectionReason = rejectionReason;
        await agent.save();

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

// @desc    Update agent profile
// @route   PUT /api/admin/agents/:id
// @access  Private (admin)
export const updateAgent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fullName, phone, email, address, city, state, pincode, agentCode, status, commissionRate } = req.body;

        const agent = await Agent.findById(req.params.id)
            .populate('user')
            .session(session);

        if (!agent) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Update User details
        if (fullName || phone || email || address || city || state || pincode) {
            if (fullName) agent.user.fullName = fullName;
            if (phone) agent.user.phone = phone;
            if (address) agent.user.address = address;
            if (city) agent.user.city = city;
            if (state) agent.user.state = state;
            if (pincode) agent.user.pincode = pincode;
            // Handle email update carefully (uniqueness)
            if (email && email !== agent.user.email) {
                const existing = await User.findOne({ email }).session(session);
                if (existing) {
                    await session.abortTransaction();
                    await session.endSession();
                    return res.status(400).json({ success: false, message: 'Email already in use' });
                }
                agent.user.email = email;
            }
            await agent.user.save({ session });
        }

        // Update Agent details
        if (agentCode) agent.agentCode = agentCode;
        if (status) agent.status = status;
        if (commissionRate !== undefined) agent.commissionRate = commissionRate;

        await agent.save({ session });

        await session.commitTransaction();
        await session.endSession();

        // Reload agent with user
        const updatedAgent = await Agent.findById(req.params.id)
            .populate('user');

        res.json({
            success: true,
            message: 'Agent profile updated successfully',
            data: { agent: updatedAgent }
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.error('Update agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating agent',
            error: error.message
        });
    }
};

// @desc    Get agent by ID
// @route   GET /api/admin/agents/:id
// @access  Private (admin)
export const getAgentById = async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id)
            .populate('user')
            .populate({
                path: 'parentAgent',
                populate: { path: 'user' }
            })
            .populate({
                path: 'subAgents',
                populate: { path: 'user' }
            })
            .populate('policies', null, null, { limit: 10 })
            .populate('commissions', null, null, { limit: 10 })
            .populate('withdrawals', null, null, { limit: 10 });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Helper to clean paths
        const cleanPath = (path) => {
            if (!path) return null;
            const normalized = path.replace(/\\/g, '/');
            const uploadIndex = normalized.indexOf('uploads/');
            return uploadIndex !== -1 ? normalized.substring(uploadIndex) : normalized;
        };

        const agentJSON = agent.toJSON();
        agentJSON.panPhoto = cleanPath(agentJSON.panPhoto);
        agentJSON.aadharPhotoFront = cleanPath(agentJSON.aadharPhotoFront);
        agentJSON.aadharPhotoBack = cleanPath(agentJSON.aadharPhotoBack);
        agentJSON.bankProofPhoto = cleanPath(agentJSON.bankProofPhoto);

        res.json({
            success: true,
            data: { agent: agentJSON }
        });
    } catch (error) {
        console.error('Get agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agent details',
            error: error.message
        });
    }
};

// @desc    Verify agent KYC
// @route   PATCH /api/admin/agents/:id/verify-kyc
// @access  Private (admin)
export const verifyAgentKYC = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body; // 'verified' or 'rejected'

        const agent = await Agent.findById(id)
            .populate('user');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        agent.kycStatus = status;
        if (status === 'rejected') {
            agent.kycRejectionReason = reason;
        } else if (status === 'verified') {
            agent.kycRejectionReason = null;
            // Optionally auto-activate agent if KYC is verified and they were pending
            if (agent.status === 'pending') {
                agent.status = 'active';
                agent.approvedAt = new Date();
                agent.approvedBy = req.user._id;
            }
        }

        await agent.save();

        res.json({
            success: true,
            message: `KYC ${status} successfully`,
            data: { agent }
        });
    } catch (error) {
        console.error('Verify KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying KYC',
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
            where.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const offset = (page - 1) * limit;

        const count = await User.countDocuments(where);
        const customers = await User.find(where)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(parseInt(limit));

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

// @desc    Get customer by ID
// @route   GET /api/admin/customers/:id
// @access  Private (admin)
export const getCustomerById = async (req, res) => {
    try {
        const customer = await User.findOne({
            _id: req.params.id,
            role: 'customer'
        })
            .select('-password')
            .populate('policies')
            .populate('claims')
            .populate('payments')
            .populate('notifications');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: { customer }
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer details',
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

        const count = await Withdrawal.countDocuments(where);
        const withdrawals = await Withdrawal.find(where)
            .populate({
                path: 'agent',
                populate: { path: 'user' }
            })
            .populate('processor')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(parseInt(limit));

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { action, rejectionReason, transactionId, adminNotes } = req.body; // action: 'approve' or 'reject'

        if (!action || !['approve', 'reject'].includes(action)) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "approve" or "reject"'
            });
        }

        const withdrawal = await Withdrawal.findById(req.params.id)
            .populate('agent')
            .session(session);

        if (!withdrawal) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found'
            });
        }

        if (withdrawal.status !== 'pending') {
            await session.abortTransaction();
            await session.endSession();
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
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient wallet balance'
                });
            }

            agent.walletBalance = newBalance;
            agent.totalWithdrawals = parseFloat(agent.totalWithdrawals) + parseFloat(withdrawal.amount);
            await agent.save({ session });

            withdrawal.status = 'approved';
            withdrawal.processedAt = new Date();
            withdrawal.processedBy = req.user._id;
            withdrawal.transactionId = transactionId;
            withdrawal.adminNotes = adminNotes;
            await withdrawal.save({ session });

            // Send notification
            await notifyWithdrawalApproved(withdrawal, agent);

        } else {
            // Reject
            if (!rejectionReason) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }

            withdrawal.status = 'rejected';
            withdrawal.rejectionReason = rejectionReason;
            withdrawal.processedAt = new Date();
            withdrawal.processedBy = req.user._id;
            await withdrawal.save({ session });

            // Send notification
            await notifyWithdrawalRejected(withdrawal, withdrawal.agent);
        }

        await session.commitTransaction();
        await session.endSession();

        res.json({
            success: true,
            message: `Withdrawal ${action}d successfully`,
            data: { withdrawal }
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.error('Process withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal',
            error: error.message
        });
    }
};

// @desc    Approve commission (credit to wallet)
// @route   PATCH /api/admin/commissions/:id/approve
// @access  Private (admin)
export const approveCommissionController = async (req, res) => {
    try {
        const commission = await approveCommission(req.params.id, req.user.id);

        res.json({
            success: true,
            message: 'Commission approved and credited to agent wallet',
            data: { commission }
        });
    } catch (error) {
        console.error('Approve commission error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error approving commission'
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

        const count = await Commission.countDocuments(where);
        const commissions = await Commission.find(where)
            .populate({
                path: 'agent',
                populate: { path: 'user' }
            })
            .populate('policy')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(parseInt(limit));

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
        const settings = await CommissionSettings.find()
            .sort({ level: 1 });

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
                const existing = await CommissionSettings.findById(id);
                if (existing) {
                    existing.percentage = percentage;
                    existing.description = description;
                    existing.isActive = isActive;
                    existing.updatedBy = req.user._id;
                    await existing.save();
                    updatedSettings.push(existing);
                }
            } else if (level) {
                // Create new
                const newSetting = await CommissionSettings.create({
                    level,
                    percentage,
                    description,
                    isActive,
                    updatedBy: req.user._id
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

// @desc    Setup/Seed database
// @route   POST /api/admin/setup-db
// @access  Private (admin)
export const setupDatabase = async (req, res) => {
    try {
        const { force } = req.body;

        // This is a dangerous operation, so we only allow it if explicitly confirmed
        // or in development environment.
        const result = await seedDatabase(force === true);

        res.json(result);
    } catch (error) {
        console.error('Setup database error:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting up database',
            error: error.message
        });
    }
};
