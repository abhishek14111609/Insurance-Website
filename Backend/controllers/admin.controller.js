import { User, Policy, Agent, Payment, Commission, Withdrawal, Claim, CommissionSettings } from '../models/index.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { sendEmail } from '../utils/email.util.js';
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

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sendVerificationEmail = async (user, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL || ''}/verify-email?token=${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify your email - Pashudhan Suraksha',
        html: `
            <h1>Verify your email</h1>
            <p>Hi ${user.fullName}, please verify your email to activate your agent account.</p>
            <a href="${verifyUrl}" clicktracking=off>Verify Email</a>
            <p>If you did not request this, you can ignore this email.</p>
        `
    });
};

const ensureDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const toAbsoluteUploadPath = (maybeRelative) => {
    if (!maybeRelative) return null;
    const normalized = String(maybeRelative).replace(/\\/g, '/');
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
        return null;
    }
    const trimmed = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    const prefixed = trimmed.startsWith('uploads/') ? trimmed : path.join('uploads', trimmed);
    return path.join(process.cwd(), prefixed);
};

const formatCurrency = (value) => {
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(numeric)) return 'N/A';
    return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const generatePolicyPdf = async (policy) => {
    const docsDir = path.join(process.cwd(), 'uploads', 'policy_docs');
    ensureDirectory(docsDir);

    const pdfPath = path.join(docsDir, `Policy-${policy.policyNumber}.pdf`);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    doc.fontSize(18).text('Policy Approval Certificate', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Policy Number: ${policy.policyNumber}`);
    doc.text(`Policy Plan: ${policy.planId?.name || 'Custom Plan'}`);
    doc.text(`Coverage Amount: ${formatCurrency(policy.coverageAmount)}`);
    doc.text(`Premium: ${formatCurrency(policy.premium)}`);
    doc.text(`Duration: ${policy.duration || 'N/A'}`);
    doc.text(`Start Date: ${policy.startDate ? new Date(policy.startDate).toDateString() : 'N/A'}`);
    doc.text(`End Date: ${policy.endDate ? new Date(policy.endDate).toDateString() : 'N/A'}`);

    doc.moveDown();
    doc.text('Livestock Details', { underline: true });
    doc.text(`Type: ${policy.cattleType || 'N/A'}`);
    doc.text(`Tag ID: ${policy.tagId || 'N/A'}`);
    doc.text(`Breed: ${policy.breed || 'N/A'}`);
    doc.text(`Gender: ${policy.gender || 'N/A'}`);
    doc.text(`Health: ${policy.healthStatus || 'N/A'}`);

    doc.moveDown();
    doc.text('Owner', { underline: true });
    doc.text(`Name: ${policy.ownerName || policy.customerId?.fullName || 'Customer'}`);
    doc.text(`Email: ${policy.ownerEmail || policy.customerId?.email || 'N/A'}`);
    doc.text(`Phone: ${policy.ownerPhone || 'N/A'}`);
    doc.text(`Address: ${policy.ownerAddress || 'N/A'}`);
    if (policy.ownerCity || policy.ownerState || policy.ownerPincode) {
        doc.text(`City/State/Pincode: ${[policy.ownerCity, policy.ownerState, policy.ownerPincode].filter(Boolean).join(', ')}`);
    }

    if (policy.agentId) {
        doc.moveDown();
        doc.text('Agent', { underline: true });
        doc.text(`Code: ${policy.agentId.agentCode || policy.agentCode || 'N/A'}`);
        const agentName = policy.agentId.userId?.fullName || 'N/A';
        doc.text(`Name: ${agentName}`);
    }

    doc.moveDown();
    doc.text('Status: APPROVED');
    doc.text(`Approved At: ${policy.approvedAt ? new Date(policy.approvedAt).toLocaleString() : new Date().toLocaleString()}`);

    doc.end();

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });

    return pdfPath;
};

const buildPolicyEmailAttachments = async (policy) => {
    const attachments = [];

    try {
        const pdfPath = await generatePolicyPdf(policy);
        if (pdfPath && fs.existsSync(pdfPath)) {
            attachments.push({ filename: path.basename(pdfPath), path: pdfPath });
        }
    } catch (pdfError) {
        console.error('[PolicyEmail] Failed to generate policy PDF:', pdfError);
    }

    const photoFields = ['front', 'back', 'left', 'right'];
    photoFields.forEach((field) => {
        const relPath = policy?.photos?.[field];
        if (!relPath) return;
        const absPath = toAbsoluteUploadPath(relPath);
        if (absPath && fs.existsSync(absPath)) {
            const ext = path.extname(absPath) || '';
            attachments.push({
                filename: `${policy.policyNumber}-${field}${ext}`,
                path: absPath
            });
        }
    });

    return attachments;
};

const sendPolicyDocumentsEmail = async (policy) => {
    if (!policy) return false;

    const recipient = policy.ownerEmail || policy.customerId?.email;
    if (!recipient) return false;

    const attachments = await buildPolicyEmailAttachments(policy);
    const customerName = policy.ownerName || policy.customerId?.fullName || 'Customer';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Policy Approved</h2>
            <p>Hi ${customerName},</p>
            <p>Your livestock insurance policy <strong>${policy.policyNumber}</strong> has been approved. Please find the policy PDF and photos attached for your records.</p>
            <p><strong>Coverage:</strong> ${formatCurrency(policy.coverageAmount)} | <strong>Premium:</strong> ${formatCurrency(policy.premium)} | <strong>Duration:</strong> ${policy.duration || 'N/A'}</p>
            <p><strong>Policy Period:</strong> ${policy.startDate ? new Date(policy.startDate).toDateString() : 'N/A'} to ${policy.endDate ? new Date(policy.endDate).toDateString() : 'N/A'}</p>
            <p>If you have questions, reply to this email and we will assist you.</p>
            <p>Thank you for choosing Pashudhan Suraksha.</p>
        </div>
    `;

    await sendEmail({
        to: recipient,
        subject: `Policy ${policy.policyNumber} Approved – Documents Attached`,
        html,
        attachments
    });

    return true;
};

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
            .select('-ownerAddress -adminNotes -rejectionReason')
            .populate({ path: 'customerId', select: 'fullName email phone' })
            .populate({
                path: 'agentId',
                populate: { path: 'userId', select: 'fullName' }
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

// @desc    Policy sales history for admin (approved or filtered)
// @route   GET /api/admin/policies/sales/history
// @access  Private (admin)
export const getPolicySalesHistory = async (req, res) => {
    try {
        const { status = 'APPROVED', page = 1, limit = 20, from, to } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (from || to) {
            filters.approvedAt = {};
            if (from) filters.approvedAt.$gte = new Date(from);
            if (to) filters.approvedAt.$lte = new Date(to);
        }

        const numericLimit = parseInt(limit);
        const offset = (page - 1) * numericLimit;

        const [count, policies] = await Promise.all([
            Policy.countDocuments(filters),
            Policy.find(filters)
                .populate('customerId', 'fullName email phone')
                .populate({
                    path: 'agentId',
                    populate: { path: 'userId', select: 'fullName email phone' }
                })
                .populate('planId')
                .sort({ approvedAt: -1, createdAt: -1 })
                .skip(offset)
                .limit(numericLimit)
        ]);

        const soldSummary = await Policy.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalPremium: { $sum: { $toDouble: '$premium' } },
                    totalCoverage: { $sum: { $toDouble: '$coverageAmount' } }
                }
            }
        ]);

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / numericLimit),
            currentPage: parseInt(page),
            data: {
                policies,
                summary: {
                    totalSold: soldSummary[0]?.total || 0,
                    totalPremium: soldSummary[0]?.totalPremium || 0,
                    totalCoverage: soldSummary[0]?.totalCoverage || 0
                }
            }
        });
    } catch (error) {
        console.error('Get policy sales history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy sales history',
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
            .populate('customerId')
            .populate({
                path: 'agentId',
                populate: { path: 'userId' }
            })
            .populate('payments')
            .populate({
                path: 'commissions',
                populate: { path: 'agentId' }
            })
            .populate('claims')
            .populate('approvedBy')
            .populate('rejectedBy');

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
            .populate('customerId')
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
            .populate('customerId')
            .populate({
                path: 'agentId',
                populate: { path: 'userId' }
            })
            .populate('payments')
            .populate('planId');

        let documentsEmailSent = false;
        try {
            documentsEmailSent = await sendPolicyDocumentsEmail(updatedPolicy);
        } catch (mailError) {
            console.error('[ApprovePolicy] Policy email send failed (non-blocking):', mailError);
        }

        res.json({
            success: true,
            message: 'Policy approved successfully',
            data: {
                policy: updatedPolicy,
                commissionsCreated: commissions.length,
                documentsEmailSent
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
            .populate('customerId');

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

// @desc    Get all agents with metrics and robust search/filter support
// @route   GET /api/admin/agents
// @access  Private (admin)
export const getAllAgents = async (req, res) => {
    try {
        const { status, level, page = 1, limit = 20, search } = req.query;

        const numericPage = Math.max(parseInt(page, 10) || 1, 1);
        const numericLimit = Math.max(parseInt(limit, 10) || 20, 1);

        const where = {};
        if (status && status !== 'all') where.status = status.toLowerCase();
        if (level && level !== 'all') where.level = parseInt(level, 10);

        // Helper to clean upload paths for safer UI rendering
        const cleanPath = (filePath) => {
            if (!filePath) return null;
            const normalized = String(filePath).replace(/\\/g, '/');
            const uploadIndex = normalized.indexOf('uploads/');
            return uploadIndex !== -1 ? normalized.substring(uploadIndex) : normalized;
        };

        // Fetch agents (with populate) and apply search on the populated fields if provided
        const baseQuery = Agent.find(where)
            .populate({ path: 'userId', select: 'fullName email phone city state address createdAt' })
            .populate({
                path: 'parentAgentId',
                select: 'agentCode level userId',
                populate: { path: 'userId', select: 'fullName' }
            })
            .sort({ createdAt: -1 })
            .lean();

        let agents = [];
        let totalCount = 0;

        if (search) {
            const allAgents = await baseQuery;
            const lowerSearch = search.toLowerCase();
            const filtered = allAgents.filter((agent) => {
                const user = agent.userId || {};
                const parent = agent.parentAgentId || {};
                return (
                    (agent.agentCode || '').toLowerCase().includes(lowerSearch) ||
                    (user.fullName || '').toLowerCase().includes(lowerSearch) ||
                    (user.email || '').toLowerCase().includes(lowerSearch) ||
                    (user.phone || '').toLowerCase().includes(lowerSearch) ||
                    (user.city || '').toLowerCase().includes(lowerSearch) ||
                    (parent.agentCode || '').toLowerCase().includes(lowerSearch)
                );
            });
            totalCount = filtered.length;
            agents = filtered.slice((numericPage - 1) * numericLimit, numericPage * numericLimit);
        } else {
            totalCount = await Agent.countDocuments(where);
            agents = await baseQuery.skip((numericPage - 1) * numericLimit).limit(numericLimit);
        }

        const agentIds = agents.map((a) => a._id);

        // Aggregate policy stats for the current page of agents
        let policyAgg = [];
        let commissionAgg = [];

        if (agentIds.length > 0) {
            policyAgg = await Policy.aggregate([
                { $match: { agentId: { $in: agentIds } } },
                {
                    $group: {
                        _id: '$agentId',
                        totalPolicies: { $sum: 1 },
                        approvedPolicies: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0]
                            }
                        },
                        totalPremium: {
                            $sum: { $toDouble: { $ifNull: ['$premium', 0] } }
                        }
                    }
                }
            ]);

            commissionAgg = await Commission.aggregate([
                { $match: { agentId: { $in: agentIds } } },
                {
                    $group: {
                        _id: '$agentId',
                        totalCommissions: { $sum: { $toDouble: { $ifNull: ['$amount', 0] } } },
                        pendingCommissions: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'pending'] },
                                    { $toDouble: { $ifNull: ['$amount', 0] } },
                                    0
                                ]
                            }
                        },
                        approvedCommissions: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'approved'] },
                                    { $toDouble: { $ifNull: ['$amount', 0] } },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);
        }

        const policyMap = new Map(policyAgg.map((p) => [p._id.toString(), p]));
        const commissionMap = new Map(commissionAgg.map((c) => [c._id.toString(), c]));

        const normalizeDecimal = (value) => {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || 0;
            if (value._bsontype === 'Decimal128') return parseFloat(value.toString()) || 0;
            return 0;
        };

        const normalizedAgents = agents.map((agent) => {
            const idStr = agent._id.toString();
            const policyStats = policyMap.get(idStr) || {};
            const commissionStats = commissionMap.get(idStr) || {};

            return {
                ...agent,
                status: (agent.status || 'pending').toLowerCase(),
                kycStatus: agent.kycStatus || 'not_submitted',
                user: agent.userId || null,
                parentAgent: agent.parentAgentId || null,
                walletBalance: normalizeDecimal(agent.walletBalance),
                totalEarnings: normalizeDecimal(agent.totalEarnings),
                totalWithdrawals: normalizeDecimal(agent.totalWithdrawals),
                panPhoto: cleanPath(agent.panPhoto),
                aadharPhotoFront: cleanPath(agent.aadharPhotoFront),
                aadharPhotoBack: cleanPath(agent.aadharPhotoBack),
                bankProofPhoto: cleanPath(agent.bankProofPhoto),
                policyStats: {
                    totalPolicies: policyStats.totalPolicies || 0,
                    approvedPolicies: policyStats.approvedPolicies || 0,
                    totalPremium: policyStats.totalPremium || 0
                },
                commissionStats: {
                    totalCommissions: commissionStats.totalCommissions || 0,
                    pendingCommissions: commissionStats.pendingCommissions || 0,
                    approvedCommissions: commissionStats.approvedCommissions || 0
                }
            };
        });

        res.json({
            success: true,
            count: totalCount,
            totalPages: Math.ceil(totalCount / numericLimit),
            currentPage: numericPage,
            data: { agents: normalizedAgents }
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
        const verificationToken = crypto.randomBytes(32).toString('hex');

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
            status: status === 'active' ? 'active' : 'inactive',
            emailVerified: false,
            verificationToken: hashToken(verificationToken)
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

        // Send verification email (non-blocking)
        sendVerificationEmail(user[0], verificationToken).catch((err) => {
            console.error('Send agent verification email failed:', err);
        });

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
            .populate('userId');

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

        // If user not verified, generate token and send verification email
        if (!agent.userId.emailVerified) {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            agent.userId.verificationToken = hashToken(verificationToken);
            await agent.userId.save();

            sendVerificationEmail(agent.userId, verificationToken).catch((err) => {
                console.error('Send agent verification email on approval failed:', err);
            });
        }

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
            .populate('userId');

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
            .populate('userId')
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
            if (fullName) agent.userId.fullName = fullName;
            if (phone) agent.userId.phone = phone;
            if (address) agent.userId.address = address;
            if (city) agent.userId.city = city;
            if (state) agent.userId.state = state;
            if (pincode) agent.userId.pincode = pincode;
            // Handle email update carefully (uniqueness)
            if (email && email !== agent.userId.email) {
                const existing = await User.findOne({ email }).session(session);
                if (existing) {
                    await session.abortTransaction();
                    await session.endSession();
                    return res.status(400).json({ success: false, message: 'Email already in use' });
                }
                agent.userId.email = email;
            }
            await agent.userId.save({ session });
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
            .populate('userId');

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
            .populate({ path: 'userId', select: '-password' })
            .populate({
                path: 'parentAgentId',
                populate: { path: 'userId', select: '-password' }
            })
            .populate({
                path: 'subAgents',
                populate: { path: 'userId', select: '-password' }
            })
            .populate({ path: 'policies', options: { limit: 10 }, populate: { path: 'customerId', select: 'fullName' } })
            .populate({ path: 'commissions', options: { limit: 10 }, populate: { path: 'agentId', select: 'agentCode' } })
            .populate({ path: 'withdrawals', options: { limit: 10 } });

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

        // Provide `user` alias expected by frontend
        if (!agentJSON.user && agentJSON.userId) {
            agentJSON.user = agentJSON.userId;
        }

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
            .populate('userId');

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
                path: 'agentId',
                populate: { path: 'userId' }
            })
            .populate('processedBy')
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

// @desc    Withdrawal history (non-pending by default)
// @route   GET /api/admin/withdrawals/history
// @access  Private (admin)
export const getWithdrawalHistory = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const where = status ? { status } : { status: { $ne: 'pending' } };
        const offset = (page - 1) * limit;

        const count = await Withdrawal.countDocuments(where);
        const withdrawals = await Withdrawal.find(where)
            .populate({
                path: 'agentId',
                populate: { path: 'userId' }
            })
            .populate('processedBy')
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
        console.error('Get withdrawal history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal history',
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
            .populate('agentId')
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
            const agent = withdrawal.agentId;
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
            await notifyWithdrawalRejected(withdrawal, withdrawal.agentId);
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

// @desc    Reject commission
// @route   PATCH /api/admin/commissions/:id/reject
// @access  Private (admin)
export const rejectCommissionController = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const commission = await Commission.findById(id);
        if (!commission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found'
            });
        }

        if (commission.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Commission is already ${commission.status}`
            });
        }

        commission.status = 'cancelled';
        if (notes) {
            commission.notes = notes;
        }
        await commission.save();

        res.json({
            success: true,
            message: 'Commission rejected successfully',
            data: { commission }
        });
    } catch (error) {
        console.error('Reject commission error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error rejecting commission'
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
                path: 'agentId',
                populate: { path: 'userId' }
            })
            .populate('policyId')
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
