import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticate as protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs with filters
 * @access  Admin only
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            userId,
            action,
            entityType,
            entityId,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const result = await AuditLog.getLogs({
            userId,
            action,
            entityType,
            entityId,
            startDate,
            endDate,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/audit-logs/stats
 * @desc    Get audit log statistics
 * @access  Admin only
 */
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const [
            totalLogs,
            actionBreakdown,
            entityBreakdown,
            topUsers,
            recentActivity
        ] = await Promise.all([
            // Total logs count
            AuditLog.countDocuments(dateFilter),

            // Actions breakdown
            AuditLog.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Entity type breakdown
            AuditLog.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$entityType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Top active users
            AuditLog.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$userId',
                        count: { $sum: 1 },
                        userName: { $first: '$userName' },
                        userEmail: { $first: '$userEmail' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Recent activity (last 24 hours)
            AuditLog.find({
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            })
                .select('action entityType userName createdAt')
                .sort({ createdAt: -1 })
                .limit(20)
                .lean()
        ]);

        res.json({
            success: true,
            data: {
                totalLogs,
                actionBreakdown,
                entityBreakdown,
                topUsers,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error fetching audit log stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit log statistics',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/audit-logs/entity/:entityType/:entityId
 * @desc    Get audit logs for a specific entity
 * @access  Admin only
 */
router.get('/entity/:entityType/:entityId', protect, authorize('admin'), async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const result = await AuditLog.getLogs({
            entityType,
            entityId,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching entity audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entity audit logs',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/admin/audit-logs/export
 * @desc    Export audit logs to CSV
 * @access  Admin only
 */
router.get('/export', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            userId,
            action,
            entityType,
            startDate,
            endDate
        } = req.query;

        const query = {};
        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (entityType) query.entityType = entityType;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(10000) // Limit export to 10k records
            .lean();

        // Convert to CSV
        const csv = convertToCSV(logs);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export audit logs',
            error: error.message
        });
    }
});

/**
 * Helper function to convert logs to CSV
 */
function convertToCSV(logs) {
    const headers = ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Entity Type', 'Entity Name', 'Status', 'IP Address'];
    const rows = logs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.userName,
        log.userEmail,
        log.userRole,
        log.action,
        log.entityType,
        log.entityName || 'N/A',
        log.status,
        log.ipAddress || 'N/A'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

export default router;
