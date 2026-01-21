import { Claim, Policy, User } from '../models/index.js';
import { notifyClaimStatusUpdate } from '../utils/notification.util.js';
import { sendEmail } from '../utils/email.util.js';

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
            .select('-description -adminNotes -rejectionReason')
            .populate({ path: 'policy', select: 'policyNumber status', strictPopulate: false })
            .populate({ path: 'reviewer', select: 'fullName', strictPopulate: false })
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
            .populate({ path: 'policy', strictPopulate: false })
            .populate({ path: 'reviewer', strictPopulate: false });

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
            .select('-description -adminNotes -rejectionReason')
            .populate({ path: 'policy', select: 'policyNumber status', strictPopulate: false })
            .populate({ path: 'customer', select: 'fullName email', strictPopulate: false })
            .populate({ path: 'reviewer', select: 'fullName', strictPopulate: false })
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

        // Send approval email when claim is approved by admin
        if (status === 'approved') {
            try {
                const [customer, policy] = await Promise.all([
                    User.findById(claim.customerId).select('email fullName'),
                    Policy.findById(claim.policyId).select('policyNumber')
                ]);

                const customerEmail = customer?.email;
                const customerName = customer?.fullName || 'Customer';
                const policyLabel = policy?.policyNumber || claim.policyId?.toString();
                const approvedText = claim.approvedAmount
                    ? `Amount approved: ₹${parseFloat(claim.approvedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '';

                if (customerEmail) {
                    const html = `
                        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">
                            <h2 style="color: #16a34a;">Claim Approved</h2>
                            <p>Hi ${customerName},</p>
                            <p>Your claim <strong>${claim.claimNumber}</strong> for policy <strong>${policyLabel}</strong> has been <strong>approved</strong>.</p>
                            ${approvedText ? `<p>${approvedText}</p>` : ''}
                            <p>We will process the payout shortly. You will be notified once the payment is completed.</p>
                            <p>Thank you for your patience.</p>
                        </div>
                    `;

                    await sendEmail({
                        to: customerEmail,
                        subject: `Claim Approved - ${claim.claimNumber}`,
                        html,
                        text: `Your claim ${claim.claimNumber} for policy ${policyLabel} has been approved. ${approvedText}`.trim()
                    });
                }
            } catch (mailErr) {
                console.error('[ClaimApprovalEmail] Failed to send claim approval email (non-blocking):', mailErr);
            }
        }

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
        const { documents } = req.body; // Optional array of existing URLs/paths
        const files = req.files || [];

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

        const toRelative = (file) => {
            const fullPath = file.path.replace(/\\/g, '/');
            const idx = fullPath.indexOf('uploads/');
            return idx !== -1 ? fullPath.substring(idx) : fullPath;
        };

        const uploaded = Array.isArray(files) ? files.map(toRelative) : [];
        const bodyDocs = Array.isArray(documents)
            ? documents
            : documents
                ? [documents]
                : [];

        const existingDocs = claim.documents || [];
        claim.documents = [...existingDocs, ...uploaded, ...bodyDocs];
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
