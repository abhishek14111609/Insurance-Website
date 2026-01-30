import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import toast from 'react-hot-toast';
import './AuditLogs.css';
import {
    Shield,
    Download,
    Filter,
    Search,
    Calendar,
    User,
    Activity,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        startDate: '',
        endDate: '',
        search: '',
        page: 1,
        limit: 50
    });
    const [pagination, setPagination] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [filters.page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAuditLogs(filters);
            if (response.success) {
                setLogs(response.data.logs || []);
                setPagination(response.data.pagination || {});
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await adminAPI.getAuditLogStats({
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleApplyFilters = () => {
        loadLogs();
        loadStats();
    };

    const handleExport = async () => {
        try {
            toast.loading('Exporting audit logs...');
            const response = await adminAPI.exportAuditLogs(filters);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss();
            toast.success('Audit logs exported successfully');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to export audit logs');
        }
    };

    const getActionBadgeClass = (action) => {
        if (action.includes('APPROVED') || action.includes('VERIFIED')) return 'badge-success';
        if (action.includes('REJECTED')) return 'badge-danger';
        if (action.includes('CREATED')) return 'badge-info';
        if (action.includes('UPDATED')) return 'badge-warning';
        if (action.includes('DELETED')) return 'badge-danger';
        return 'badge-default';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="audit-logs-page">
            <div className="page-header-modern">
                <div className="header-info">
                    <h1><Shield size={28} /> Audit Logs</h1>
                    <p>Track all administrative actions and system changes</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} /> Filters
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleExport}
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Activity size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Actions</span>
                            <h3>{stats.totalLogs?.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <User size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Active Users</span>
                            <h3>{stats.topUsers?.length || 0}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FileText size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Entity Types</span>
                            <h3>{stats.entityBreakdown?.length || 0}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid">
                        <div className="form-group">
                            <label>Action Type</label>
                            <select name="action" value={filters.action} onChange={handleFilterChange}>
                                <option value="">All Actions</option>
                                <option value="AGENT_APPROVED">Agent Approved</option>
                                <option value="AGENT_REJECTED">Agent Rejected</option>
                                <option value="POLICY_APPROVED">Policy Approved</option>
                                <option value="POLICY_REJECTED">Policy Rejected</option>
                                <option value="CLAIM_APPROVED">Claim Approved</option>
                                <option value="WITHDRAWAL_PROCESSED">Withdrawal Processed</option>
                                <option value="COMMISSION_SETTINGS_UPDATED">Commission Updated</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Entity Type</label>
                            <select name="entityType" value={filters.entityType} onChange={handleFilterChange}>
                                <option value="">All Entities</option>
                                <option value="Agent">Agent</option>
                                <option value="Policy">Policy</option>
                                <option value="PolicyPlan">Policy Plan</option>
                                <option value="Claim">Claim</option>
                                <option value="Withdrawal">Withdrawal</option>
                                <option value="Commission">Commission</option>
                                <option value="Customer">Customer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <div className="filters-actions">
                        <button className="btn btn-primary" onClick={handleApplyFilters}>
                            Apply Filters
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setFilters({
                                    action: '',
                                    entityType: '',
                                    startDate: '',
                                    endDate: '',
                                    search: '',
                                    page: 1,
                                    limit: 50
                                });
                                loadLogs();
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Audit Logs Table */}
            <div className="logs-table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <Shield size={64} />
                        <h3>No Audit Logs Found</h3>
                        <p>No actions match your current filters</p>
                    </div>
                ) : (
                    <>
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="timestamp-cell">
                                            <Calendar size={14} />
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="user-cell">
                                            <div className="user-info">
                                                <strong>{log.userName}</strong>
                                                <span className="user-email">{log.userEmail}</span>
                                                <span className={`role-badge role-${log.userRole}`}>
                                                    {log.userRole}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="entity-cell">
                                                <span className="entity-type">{log.entityType}</span>
                                                {log.entityName && (
                                                    <span className="entity-name">{log.entityName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="details-cell">
                                            {log.metadata?.notes && (
                                                <span className="detail-item">📝 {log.metadata.notes}</span>
                                            )}
                                            {log.metadata?.reason && (
                                                <span className="detail-item">💬 {log.metadata.reason}</span>
                                            )}
                                            {log.metadata?.rejectionReason && (
                                                <span className="detail-item">❌ {log.metadata.rejectionReason}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${log.status}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="ip-cell">
                                            {log.ipAddress || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary"
                                    disabled={filters.page === 1}
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>
                                <span className="pagination-info">
                                    Page {pagination.page} of {pagination.pages}
                                    ({pagination.total} total records)
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={filters.page === pagination.pages}
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
