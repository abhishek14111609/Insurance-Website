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
        timestamps: true
    }
);

const CommissionSettings = mongoose.model('CommissionSettings', commissionSettingsSchema);

export default CommissionSettings;
