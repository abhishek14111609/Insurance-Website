import { Policy, User, Agent, Payment, Commission } from '../models/index.js';
import { generatePolicyPdf } from '../utils/pdfGenerator.js';
import fs from 'fs';
import path from 'path';

// @desc    Create new policy
// @route   POST /api/policies
// @access  Private (Customer)
const normalizePhotoPath = (value) => {
    if (!value) return null;
    const asString = String(value).replace(/\\/g, '/');
    const uploadIndex = asString.indexOf('uploads/');
    return uploadIndex !== -1 ? asString.substring(uploadIndex) : asString;
};

export const createPolicy = async (req, res) => {
    try {
        const {
            cattleType, tagId, age, breed, gender, milkYield, healthStatus,
            coverageAmount, premium, duration, startDate, endDate,
            ownerName, ownerEmail, ownerPhone, ownerAddress, ownerCity, ownerState, ownerPincode,
            agentCode, photos, planId
        } = req.body;

        const normalizedAgentCode = agentCode ? String(agentCode).toUpperCase() : null;

        // Generate policy number
        const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Find agent if agent code provided
        let agentId = null;
        if (normalizedAgentCode) {
            const agent = await Agent.findOne({ agentCode: normalizedAgentCode });
            if (agent) {
                // Check KYC status before allowing sale
                if (agent.kycStatus !== 'verified') {
                    return res.status(403).json({
                        success: false,
                        message: 'Agent is not authorized to sell policies yet. KYC verification is pending.'
                    });
                }
                agentId = agent._id;
            }
        }

        const normalizedPhotos = {
            front: normalizePhotoPath(photos?.front),
            back: normalizePhotoPath(photos?.back),
            left: normalizePhotoPath(photos?.left),
            right: normalizePhotoPath(photos?.right)
        };

        // Create policy
        const policy = await Policy.create({
            policyNumber,
            customerId: req.user._id,
            agentId,
            planId,
            cattleType,
            tagId,
            age,
            breed,
            gender,
            milkYield,
            healthStatus,
            coverageAmount,
            premium,
            duration,
            startDate,
            endDate,
            ownerName,
            ownerEmail,
            ownerPhone,
            ownerAddress,
            ownerCity,
            ownerState,
            ownerPincode,
            agentCode: normalizedAgentCode,
            photos: normalizedPhotos,
            status: 'PENDING',
            paymentStatus: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: 'Policy created successfully',
            data: { policy }
        });
    } catch (error) {
        console.error('Create policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating policy',
            error: error.message
        });
    }
};

// @desc    Upload policy photos (pre-policy creation)
// @route   POST /api/policies/upload-photos
// @access  Private (Customer/Agent)
export const uploadPolicyPhotos = async (req, res) => {
    try {
        const files = req.files || {};
        const toRelative = (file) => {
            const fullPath = file.path.replace(/\\/g, '/');
            const idx = fullPath.indexOf('uploads/');
            return idx !== -1 ? fullPath.substring(idx) : fullPath;
        };

        const photos = {
            front: files.front?.[0] ? toRelative(files.front[0]) : null,
            back: files.back?.[0] ? toRelative(files.back[0]) : null,
            left: files.left?.[0] ? toRelative(files.left[0]) : null,
            right: files.right?.[0] ? toRelative(files.right[0]) : null
        };

        res.json({
            success: true,
            message: 'Policy photos uploaded successfully',
            data: { photos }
        });
    } catch (error) {
        console.error('Upload policy photos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading policy photos',
            error: error.message
        });
    }
};

// @desc    Get all policies for current user
// @route   GET /api/policies
// @access  Private
export const getPolicies = async (req, res) => {
    try {
        const { status, paymentStatus } = req.query;

        const where = { customerId: req.user._id };

        if (status) where.status = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        const policies = await Policy.find(where)
            .select('-photos -ownerAddress -adminNotes -rejectionReason')
            .populate({
                path: 'agentId',
                populate: { path: 'userId', select: 'fullName' }
            })
            .populate('payments')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: policies.length,
            data: { policies }
        });
    } catch (error) {
        console.error('Get policies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policies',
            error: error.message
        });
    }
};

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private
export const getPolicyById = async (req, res) => {
    try {
        const policy = await Policy.findOne({
            _id: req.params.id,
            customerId: req.user._id
        })
            .populate({
                path: 'agentId',
                populate: { path: 'userId' }
            })
            .populate('payments')
            .populate('commissions');

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
        console.error('Get policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy',
            error: error.message
        });
    }
};

// @desc    Update policy after payment
// @route   PATCH /api/policies/:id/payment-complete
// @access  Private
export const updatePolicyPayment = async (req, res) => {
    try {
        const { paymentId, orderId } = req.body;

        const policy = await Policy.findOne({
            _id: req.params.id,
            customerId: req.user._id
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        // Update policy status
        policy.paymentStatus = 'PAID';
        policy.paymentId = paymentId;
        policy.paymentDate = new Date();
        policy.status = 'PENDING_APPROVAL'; // Waiting for admin approval
        await policy.save();

        res.json({
            success: true,
            message: 'Policy payment updated successfully',
            data: { policy }
        });
    } catch (error) {
        console.error('Update policy payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating policy payment',
            error: error.message
        });
    }
};

// @desc    Get pending policies for admin approval
// @route   GET /api/policies/admin/pending
// @access  Private (Admin)
export const getPendingPolicies = async (req, res) => {
    try {
        const policies = await Policy.find({
            $or: [
                { status: 'PENDING' },
                { status: 'PENDING_APPROVAL' }
            ]
        })
            .select('-ownerAddress -adminNotes -rejectionReason')
            .populate({ path: 'customerId', select: 'fullName email phone' })
            .populate({
                path: 'agentId',
                populate: { path: 'userId', select: 'fullName' }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: policies.length,
            data: { policies }
        });
    } catch (error) {
        console.error('Get pending policies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending policies',
            error: error.message
        });
    }
};

// @desc    Download policy document (Regenerates if missing)
// @route   GET /api/policies/:id/download
// @access  Private
export const downloadPolicyDocument = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id)
            .populate('customerId')
            .populate({
                path: 'agentId',
                populate: { path: 'userId' }
            });

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        const isOwner = policy.customerId.toString() === req.user._id.toString();

        if (!isOwner) {
            const agent = await Agent.findOne({ userId: req.user._id });
            if (!agent || (policy.agentId && policy.agentId.toString() !== agent._id.toString())) {
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ success: false, message: 'Not authorized to view this policy' });
                }
            }
        }

        if (policy.status !== 'APPROVED') {
            return res.status(400).json({ success: false, message: 'Policy is not approved yet' });
        }

        // Hydrate missing agent/payment details before PDF generation
        let policyUpdated = false;

        if (!policy.agentId && policy.agentCode) {
            const agentByCode = await Agent.findOne({ agentCode: policy.agentCode })
                .populate('userId');
            if (agentByCode) {
                policy.agentId = agentByCode._id;
                policyUpdated = true;
                policy.agentId = agentByCode; // for in-memory PDF rendering
            }
        }

        if (!policy.paymentDate || !policy.paymentId) {
            const payment = await Payment.findOne({ policyId: policy._id, status: 'success' })
                .sort({ paidAt: -1 });
            if (payment) {
                if (!policy.paymentId && payment.paymentId) {
                    policy.paymentId = payment.paymentId;
                }
                if (!policy.paymentDate && payment.paidAt) {
                    policy.paymentDate = payment.paidAt;
                }
                policyUpdated = true;
            }
        }

        let pdfPath = null;
        if (policy.documentUrl) {
            pdfPath = path.join(process.cwd(), policy.documentUrl);
        }

        const shouldRegenerate = !pdfPath || !fs.existsSync(pdfPath) || policyUpdated || (!policy.paymentDate && !policy.paymentId);

        if (shouldRegenerate) {
            console.log(`[Download] PDF missing for policy ${policy.policyNumber}, regenerating...`);
            pdfPath = await generatePolicyPdf(policy);

            const relativePath = 'uploads/policy_docs/' + path.basename(pdfPath);
            policy.documentUrl = relativePath;
            await policy.save();
        }

        res.download(pdfPath, `Policy-${policy.policyNumber}.pdf`);

    } catch (error) {
        console.error('Download policy PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading policy document',
            error: error.message
        });
    }
};

export default {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicyPayment,
    getPendingPolicies,
    uploadPolicyPhotos,
    downloadPolicyDocument
};
