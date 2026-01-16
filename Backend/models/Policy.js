import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
    {
        policyNumber: {
            type: String,
            required: true,
            unique: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            default: null
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PolicyPlan',
            default: null
        },
        // Cattle Details
        cattleType: {
            type: String,
            enum: ['cow', 'buffalo'],
            required: true
        },
        tagId: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        breed: {
            type: String,
            default: null
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: true
        },
        milkYield: {
            type: mongoose.Decimal128,
            default: null
        },
        healthStatus: {
            type: String,
            enum: ['healthy', 'under_treatment'],
            default: 'healthy'
        },
        // Policy Details
        coverageAmount: {
            type: mongoose.Decimal128,
            required: true
        },
        premium: {
            type: mongoose.Decimal128,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        // Status
        status: {
            type: String,
            enum: ['PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
            default: 'PENDING'
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            default: 'PENDING'
        },
        paymentId: {
            type: String,
            default: null
        },
        paymentDate: {
            type: Date,
            default: null
        },
        // Photos
        photos: {
            type: [String],
            default: []
        },
        // Owner Details
        ownerName: {
            type: String,
            required: true
        },
        ownerEmail: {
            type: String,
            required: true
        },
        ownerPhone: {
            type: String,
            required: true
        },
        ownerAddress: {
            type: String,
            required: true
        },
        ownerCity: {
            type: String,
            required: true
        },
        ownerState: {
            type: String,
            required: true
        },
        ownerPincode: {
            type: String,
            required: true
        },
        // Agent Code
        agentCode: {
            type: String,
            default: null
        },
        // Approval Details
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
        }
    },
    {
        timestamps: true
    }
);

// Create indexes
policySchema.index({ customerId: 1, createdAt: -1 });
policySchema.index({ agentId: 1, createdAt: -1 });

const Policy = mongoose.model('Policy', policySchema);

export default Policy;
