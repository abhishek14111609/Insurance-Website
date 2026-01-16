import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        policyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Policy',
            required: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        razorpayOrderId: {
            type: String,
            default: null
        },
        razorpayPaymentId: {
            type: String,
            unique: true,
            sparse: true,
            default: null
        },
        razorpaySignature: {
            type: String,
            default: null
        },
        amount: {
            type: mongoose.Decimal128,
            required: true
        },
        currency: {
            type: String,
            default: 'INR'
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed', 'refunded'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        notes: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        errorCode: {
            type: String,
            default: null
        },
        errorDescription: {
            type: String,
            default: null
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({ policyId: 1 });
paymentSchema.index({ customerId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
