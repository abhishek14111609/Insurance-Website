import { Claim, Policy, User } from '../models/index.js';
import { notifyClaimStatusUpdate } from '../utils/notification.util.js';

// @desc    Create new claim
// @route   POST /api/claims
// @access  Private (customer)
export const createClaim = async (req, res) => {
    try {
        const {
            policyId,
            claimType,
            incidentDate,
            incidentLocation,
            claimAmount,
            description,
            documents
        } = req.body;

        // Verify policy belongs to user
        const policy = await Policy.findOne({
            _id: policyId,
            customerId: req.user._id
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found or does not belong to you'
            });
        }

        // Check if policy is approved
        if (policy.status !== 'APPROVED') {
            return res.status(400).json({
                success: false,
                message: 'Claims can only be filed for approved policies'
            });
        }

        // Generate claim number
        const claimNumber = `CLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create claim
        const claim = await Claim.create({
            claimNumber,
            policyId,
            customerId: req.user._id,
            claimType,
            incidentDate,
            incidentLocation,
            claimAmount,
            description,
            documents: documents || [],
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Claim submitted successfully',
            data: { claim }
        });
    } catch (error) {
        console.error('Create claim error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating claim',
            error: error.message
        });
    }
};

// @desc    Get user's claims
// @route   GET /api/claims
// @access  Private (customer)
export const getClaims = async (req, res) => {
    try {
        const { status } = req.query;

        const where = { customerId: req.user._id };
        if (status) where.status = status;

        const claims = await Claim.find(where)
            .select('-documents -description -adminNotes -rejectionReason')
            .populate({ path: 'policy', select: 'policyNumber status' })
            .populate({ path: 'reviewer', select: 'fullName' })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: claims.length,
            data: { claims }
        });
    } catch (error) {
        console.error('Get claims error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching claims',
            error: error.message
        });
    }
};

// @desc    Get claim details
// @route   GET /api/claims/:id
// @access  Private
export const getClaimById = async (req, res) => {
    try {
        const where = { _id: req.params.id };
        if (req.user.role !== 'admin') {
            where.customerId = req.user._id;
        }

        const claim = await Claim.findOne(where)
            .populate('policy')
            .populate('reviewer');

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        res.json({
            success: true,
            data: { claim }
        });
    } catch (error) {
        console.error('Get claim error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching claim',
            error: error.message
        });
    }
};

// @desc    Get all claims (admin)
// @route   GET /api/claims/admin/all
// @access  Private (admin)
export const getAllClaims = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const count = await Claim.countDocuments(where);
        const claims = await Claim.find(where)
            .select('-documents -description -adminNotes -rejectionReason')
            .populate({ path: 'policy', select: 'policyNumber status' })
            .populate({ path: 'customer', select: 'fullName email' })
            .populate({ path: 'reviewer', select: 'fullName' })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: { claims }
        });
    } catch (error) {
        console.error('Get all claims error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching claims',
            error: error.message
        });
    }
};

// @desc    Update claim status
// @route   PATCH /api/claims/:id/status
// @access  Private (admin)
export const updateClaimStatus = async (req, res) => {
    try {
        const { status, approvedAmount, rejectionReason, adminNotes } = req.body;

        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        claim.status = status;
        claim.reviewedBy = req.user._id;
        claim.reviewedAt = new Date();
        claim.adminNotes = adminNotes;

        if (status === 'approved' && approvedAmount) {
            claim.approvedAmount = approvedAmount;
        }

        if (status === 'rejected' && rejectionReason) {
            claim.rejectionReason = rejectionReason;
        }

        if (status === 'paid') {
            claim.paidAmount = claim.approvedAmount || claim.claimAmount;
            claim.paidAt = new Date();
        }

        await claim.save();

        // Send notification
        await notifyClaimStatusUpdate(claim);

        res.json({
            success: true,
            message: 'Claim status updated successfully',
            data: { claim }
        });
    } catch (error) {
        console.error('Update claim status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating claim status',
            error: error.message
        });
    }
};

// @desc    Upload claim documents
// @route   POST /api/claims/:id/documents
// @access  Private (customer)
export const uploadClaimDocuments = async (req, res) => {
    try {
        const { documents } = req.body; // Array of document URLs

        const claim = await Claim.findOne({
            _id: req.params.id,
            customerId: req.user._id
        });

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        const existingDocs = claim.documents || [];
        claim.documents = [...existingDocs, ...documents];
        await claim.save();

        res.json({
            success: true,
            message: 'Documents uploaded successfully',
            data: { claim }
        });
    } catch (error) {
        console.error('Upload claim documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading documents',
            error: error.message
        });
    }
};
