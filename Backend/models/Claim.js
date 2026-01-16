import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
    {
        claimNumber: {
            type: String,
            required: true,
            unique: true
        },
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
        claimType: {
            type: String,
            enum: ['death', 'injury', 'theft', 'disease', 'accident', 'natural_disaster', 'disability', 'other'],
            required: true
        },
        incidentDate: {
            type: Date,
            required: true
        },
        incidentLocation: {
            type: String,
            default: null
        },
        claimAmount: {
            type: mongoose.Decimal128,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        documents: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['pending', 'under_review', 'approved', 'rejected', 'paid'],
            default: 'pending'
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        },
        approvedAmount: {
            type: mongoose.Decimal128,
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        },
        paidAmount: {
            type: mongoose.Decimal128,
            default: null
        },
        paidAt: {
            type: Date,
            default: null
        },
        paymentReference: {
            type: String,
            default: null
        },
        adminNotes: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                // Convert Decimal128 to regular numbers
                if (ret.claimAmount instanceof mongoose.Types.Decimal128) {
                    ret.claimAmount = parseFloat(ret.claimAmount.toString());
                }
                if (ret.approvedAmount instanceof mongoose.Types.Decimal128) {
                    ret.approvedAmount = parseFloat(ret.approvedAmount.toString());
                }
                if (ret.paidAmount instanceof mongoose.Types.Decimal128) {
                    ret.paidAmount = parseFloat(ret.paidAmount.toString());
                }
                return ret;
            }
        }
    }
);

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
