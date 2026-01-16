import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
    {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true
        },
        amount: {
            type: mongoose.Decimal128,
            required: true
        },
        bankDetails: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'paid'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        processedAt: {
            type: Date,
            default: null
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        },
        transactionId: {
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

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
