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
            where: { id: policyId, customerId: req.user.id }
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
            customerId: req.user.id,
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

        const where = { customerId: req.user.id };
        if (status) where.status = status;

        const claims = await Claim.findAll({
            where,
            include: [
                { model: Policy, as: 'policy' },
                { model: User, as: 'reviewer' }
            ],
            order: [['createdAt', 'DESC']]
        });

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
        const claim = await Claim.findOne({
            where: {
                id: req.params.id,
                customerId: req.user.id
            },
            include: [
                { model: Policy, as: 'policy' },
                { model: User, as: 'reviewer' }
            ]
        });

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

        const { count, rows: claims } = await Claim.findAndCountAll({
            where,
            include: [
                { model: Policy, as: 'policy' },
                { model: User, as: 'customer' },
                { model: User, as: 'reviewer' }
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

        const claim = await Claim.findByPk(req.params.id);
        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        const updateData = {
            status,
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            adminNotes
        };

        if (status === 'approved' && approvedAmount) {
            updateData.approvedAmount = approvedAmount;
        }

        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        if (status === 'paid') {
            updateData.paidAmount = claim.approvedAmount || claim.claimAmount;
            updateData.paidAt = new Date();
        }

        await claim.update(updateData);

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
            where: {
                id: req.params.id,
                customerId: req.user.id
            }
        });

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        const existingDocs = claim.documents || [];
        const updatedDocs = [...existingDocs, ...documents];

        await claim.update({ documents: updatedDocs });

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
