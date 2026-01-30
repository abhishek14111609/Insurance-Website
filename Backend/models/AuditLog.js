import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    // Who performed the action
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        enum: ['admin', 'agent', 'customer'],
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },

    // What action was performed
    action: {
        type: String,
        required: true,
        enum: [
            // Agent actions
            'AGENT_CREATED', 'AGENT_UPDATED', 'AGENT_APPROVED', 'AGENT_REJECTED',
            'AGENT_KYC_VERIFIED', 'AGENT_KYC_REJECTED', 'AGENT_DELETED',

            // Policy actions
            'POLICY_APPROVED', 'POLICY_REJECTED', 'POLICY_UPDATED', 'POLICY_DELETED',

            // Policy Plan actions
            'PLAN_CREATED', 'PLAN_UPDATED', 'PLAN_DELETED', 'PLAN_ACTIVATED', 'PLAN_DEACTIVATED',

            // Commission actions
            'COMMISSION_SETTINGS_UPDATED', 'COMMISSION_APPROVED', 'COMMISSION_REJECTED',

            // Withdrawal actions
            'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'WITHDRAWAL_PROCESSED',

            // Claim actions
            'CLAIM_APPROVED', 'CLAIM_REJECTED', 'CLAIM_SETTLED', 'CLAIM_UPDATED',

            // Customer actions
            'CUSTOMER_UPDATED', 'CUSTOMER_DELETED',

            // System actions
            'LOGIN', 'LOGOUT', 'PASSWORD_CHANGED', 'SETTINGS_UPDATED',
            'DATABASE_SETUP', 'INQUIRY_DELETED'
        ]
    },

    // What entity was affected
    entityType: {
        type: String,
        required: true,
        enum: ['Agent', 'Policy', 'PolicyPlan', 'Commission', 'Withdrawal', 'Claim', 'Customer', 'User', 'System', 'Inquiry']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Not required for system-wide actions
    },
    entityName: {
        type: String, // Human-readable identifier (e.g., policy number, agent code)
        required: false
    },

    // Details of the change
    changes: {
        type: mongoose.Schema.Types.Mixed, // Store before/after values
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Additional context
        required: false
    },

    // Request information
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },

    // Result
    status: {
        type: String,
        enum: ['success', 'failure'],
        default: 'success'
    },
    errorMessage: {
        type: String,
        required: false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userRole: 1, createdAt: -1 });

// Static method to create audit log
auditLogSchema.statics.log = async function (logData) {
    try {
        const log = new this(logData);
        await log.save();
        return log;
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break the main flow
        return null;
    }
};

// Static method to get logs with filters
auditLogSchema.statics.getLogs = async function (filters = {}, options = {}) {
    const {
        userId,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        page = 1,
        limit = 50
    } = filters;

    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        this.find(query)
            .populate('userId', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
