import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'replied'],
            default: 'pending'
        },
        adminReply: {
            type: String,
            default: null
        },
        repliedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
