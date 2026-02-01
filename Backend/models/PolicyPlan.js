import mongoose from 'mongoose';

const policyPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: null
        },
        cattleType: {
            type: String,
            enum: ['cow', 'buffalo', 'both'],
            required: true
        },
        minAge: {
            type: Number,
            default: 1
        },
        maxAge: {
            type: Number,
            default: 15
        },
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
            default: '1 year'
        },
        features: {
            type: [String],
            default: []
        },
        coverageDetails: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        exclusions: {
            type: [String],
            default: []
        },
        isActive: {
            type: Boolean,
            default: true
        },
        displayOrder: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        sellerCommission: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                // Convert Decimal128 to regular numbers
                if (ret.coverageAmount && ret.coverageAmount.toString) {
                    ret.coverageAmount = parseFloat(ret.coverageAmount.toString());
                }
                if (ret.premium && ret.premium.toString) {
                    ret.premium = parseFloat(ret.premium.toString());
                }
                return ret;
            }
        }
    }
);

const PolicyPlan = mongoose.model('PolicyPlan', policyPlanSchema);

export default PolicyPlan;
