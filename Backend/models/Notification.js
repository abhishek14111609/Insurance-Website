import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        type: {
            type: String,
            enum: ['policy', 'payment', 'commission', 'withdrawal', 'claim', 'agent', 'system'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        },
        actionUrl: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        },
        isBroadcast: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
