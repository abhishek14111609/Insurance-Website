import AuditLog from '../models/AuditLog.js';

/**
 * Middleware to create audit logs for admin actions
 * Usage: Add this middleware after authentication middleware
 */
const auditLogger = (action, entityType) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to capture response
        res.json = function (data) {
            // Only log if user is authenticated
            if (req.user) {
                // Extract entity information from request/response
                const entityId = req.params.id || data?.data?.id || data?.data?._id;
                const entityName = getEntityName(entityType, req, data);

                // Create audit log asynchronously (don't wait)
                createAuditLog({
                    userId: req.user.id || req.user._id,
                    userRole: req.user.role,
                    userName: req.user.fullName,
                    userEmail: req.user.email,
                    action,
                    entityType,
                    entityId,
                    entityName,
                    changes: extractChanges(req),
                    metadata: extractMetadata(req, data),
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: data.success ? 'success' : 'failure',
                    errorMessage: data.success ? null : data.message
                }).catch(err => {
                    console.error('Audit log creation failed:', err);
                });
            }

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

/**
 * Create audit log entry
 */
async function createAuditLog(logData) {
    try {
        await AuditLog.log(logData);
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - logging should not break the main flow
    }
}

/**
 * Extract entity name from request/response
 */
function getEntityName(entityType, req, data) {
    switch (entityType) {
        case 'Agent':
            return req.body?.agentCode || data?.data?.agentCode || 'Unknown';
        case 'Policy':
            return req.body?.policyNumber || data?.data?.policyNumber || 'Unknown';
        case 'PolicyPlan':
            return req.body?.name || data?.data?.name || 'Unknown';
        case 'Customer':
            return data?.data?.fullName || 'Unknown';
        case 'Claim':
            return data?.data?.claimNumber || 'Unknown';
        case 'Withdrawal':
            return `Withdrawal-${req.params.id?.slice(-6)}` || 'Unknown';
        default:
            return 'N/A';
    }
}

/**
 * Extract changes from request body
 */
function extractChanges(req) {
    // For updates, capture the changes
    if (req.method === 'PUT' || req.method === 'PATCH') {
        return {
            updated: req.body,
            // Note: We don't have 'before' state here - would need to fetch from DB
        };
    }

    // For creates, capture the new data
    if (req.method === 'POST') {
        return {
            created: sanitizeData(req.body)
        };
    }

    return null;
}

/**
 * Extract metadata from request
 */
function extractMetadata(req, data) {
    const metadata = {
        method: req.method,
        path: req.path,
        query: req.query
    };

    // Add specific metadata based on action
    if (req.body?.notes) metadata.notes = req.body.notes;
    if (req.body?.reason) metadata.reason = req.body.reason;
    if (req.body?.rejectionReason) metadata.rejectionReason = req.body.rejectionReason;

    return metadata;
}

/**
 * Sanitize sensitive data before logging
 */
function sanitizeData(data) {
    const sanitized = { ...data };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.refreshToken;

    return sanitized;
}

/**
 * Manual audit log creation (for use in controllers)
 */
async function logAction(userId, action, entityType, entityId, entityName, metadata = {}) {
    try {
        await AuditLog.log({
            userId,
            userRole: metadata.userRole || 'admin',
            userName: metadata.userName || 'System',
            userEmail: metadata.userEmail || 'system@pashudhansuraksha.com',
            action,
            entityType,
            entityId,
            entityName,
            metadata,
            status: 'success'
        });
    } catch (error) {
        console.error('Failed to create manual audit log:', error);
    }
}

export {
    auditLogger,
    logAction,
    createAuditLog
};
