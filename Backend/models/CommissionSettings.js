import mongoose from 'mongoose';

const commissionSettingsSchema = new mongoose.Schema(
    {
        level: {
            type: Number,
            required: true,
            unique: true
        },
        percentage: {
            type: mongoose.Decimal128,
            required: true
        },
        description: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        minPolicyAmount: {
            type: mongoose.Decimal128,
            default: null
        },
        maxPolicyAmount: {
            type: mongoose.Decimal128,
            default: null
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                if (ret._id) ret.id = ret._id.toString();
                if (ret.percentage instanceof mongoose.Types.Decimal128) {
                    ret.percentage = parseFloat(ret.percentage.toString());
                }
                if (ret.minPolicyAmount instanceof mongoose.Types.Decimal128) {
                    ret.minPolicyAmount = parseFloat(ret.minPolicyAmount.toString());
                }
                if (ret.maxPolicyAmount instanceof mongoose.Types.Decimal128) {
                    ret.maxPolicyAmount = parseFloat(ret.maxPolicyAmount.toString());
                }
                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

const CommissionSettings = mongoose.model('CommissionSettings', commissionSettingsSchema);

export default CommissionSettings;
