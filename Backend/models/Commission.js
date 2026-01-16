import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema(
    {
        policyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Policy',
            required: true
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true
        },
        level: {
            type: Number,
            required: true
        },
        amount: {
            type: mongoose.Decimal128,
            required: true
        },
        percentage: {
            type: mongoose.Decimal128,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'paid', 'cancelled'],
            default: 'pending'
        },
        paidAt: {
            type: Date,
            default: null
        },
        notes: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Commission = mongoose.model('Commission', commissionSchema);

export default Commission;
