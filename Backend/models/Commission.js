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
        distanceFromSeller: {
            type: Number,
            default: null
        },
        amount: {
            type: mongoose.Decimal128,
            required: true
        },
        percentage: {
            type: mongoose.Decimal128,
            required: true
        },
        commissionType: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'percentage'
        },
        premiumAtSale: {
            type: mongoose.Decimal128,
            default: null
        },
        planTermYears: {
            type: Number,
            default: null
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

commissionSchema.index({ policyId: 1 });
commissionSchema.index({ agentId: 1 });

const Commission = mongoose.model('Commission', commissionSchema);

export default Commission;
