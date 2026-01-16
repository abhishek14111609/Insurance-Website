import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        agentCode: {
            type: String,
            required: true,
            unique: true
        },
        parentAgentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            default: null
        },
        level: {
            type: Number,
            default: 1
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'inactive', 'rejected'],
            default: 'pending'
        },
        // Bank Details
        bankName: {
            type: String,
            default: null
        },
        accountNumber: {
            type: String,
            default: null
        },
        ifscCode: {
            type: String,
            default: null
        },
        accountHolderName: {
            type: String,
            default: null
        },
        // KYC Details
        panNumber: {
            type: String,
            default: null
        },
        panPhoto: {
            type: String,
            default: null
        },
        aadharNumber: {
            type: String,
            default: null
        },
        aadharPhotoFront: {
            type: String,
            default: null
        },
        aadharPhotoBack: {
            type: String,
            default: null
        },
        bankProofPhoto: {
            type: String,
            default: null
        },
        kycStatus: {
            type: String,
            enum: ['not_submitted', 'pending', 'verified', 'rejected'],
            default: 'not_submitted'
        },
        kycRejectionReason: {
            type: String,
            default: null
        },
        // Wallet
        walletBalance: {
            type: mongoose.Decimal128,
            default: 0.00
        },
        totalEarnings: {
            type: mongoose.Decimal128,
            default: 0.00
        },
        totalWithdrawals: {
            type: mongoose.Decimal128,
            default: 0.00
        },
        // Approval
        approvedAt: {
            type: Date,
            default: null
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        rejectedAt: {
            type: Date,
            default: null
        },
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        },
        adminNotes: {
            type: String,
            default: null
        },
        commissionRate: {
            type: mongoose.Decimal128,
            default: null
        },
        trainingStatus: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed'],
            default: 'not_started'
        },
        trainingProgress: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;
