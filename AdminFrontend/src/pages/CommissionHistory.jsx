import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import { exportToCSV, formatCommissionsForExport } from '../utils/exportUtils';
import BulkActionBar from '../components/BulkActionBar';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './CommissionHistory.css';

const CommissionHistory = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pending: 0,
        paid: 0
    });
    const [processingId, setProcessingId] = useState(null);

    // Bulk operations state
    const [selectedCommissions, setSelectedCommissions] = useState(new Set());
    const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    const normalizeNumber = (value) => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'object' && value.$numberDecimal) {
            return Number(value.$numberDecimal);
        }
        const num = Number(value);
        return Number.isNaN(num) ? 0 : num;
    };

    useEffect(() => {
        loadCommissions();
    }, []);

    const loadCommissions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllCommissions();
            if (response.success) {
                const data = response.data.commissions || [];
                setCommissions(data);

                // Calculate totals with Decimal support
                const total = data.reduce((sum, item) => sum + normalizeNumber(item.amount), 0);
                const pending = data.filter(item => (item.status || '').toLowerCase() === 'pending').reduce((sum, item) => sum + normalizeNumber(item.amount), 0);
                const paid = data.filter(item => (item.status || '').toLowerCase() === 'paid' || (item.status || '').toLowerCase() === 'approved').reduce((sum, item) => sum + normalizeNumber(item.amount), 0);

                setStats({
                    totalEarned: total,
                    pending: pending,
                    paid: paid
                });
            }
        } catch (error) {
            console.error('Error loading commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setProcessingId(id);
            const response = await adminAPI.approveCommission(id);
            if (response.success) {
                // Update local state instead of refetching
                setCommissions(prev => prev.map(c =>
                    (c.id === id || c._id === id) ? { ...c, status: 'approved' } : c
                ));
                // Update stats
                const commission = commissions.find(c => (c.id === id || c._id === id));
                if (commission) {
                    setStats(prev => ({
                        ...prev,
                        pending: prev.pending - normalizeNumber(commission.amount),
                        paid: prev.paid + normalizeNumber(commission.amount)
                    }));
                }
            } else {
                toast.error(response.message || 'Failed to approve commission');
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('An error occurred during approval');
        } finally {
            setProcessingId(null);
        }
    };

    const handleExport = () => {
        try {
            if (commissions.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatCommissionsForExport(commissions);
            exportToCSV(formattedData, 'commissions_export');
            toast.success(`Exported ${commissions.length} commissions successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    // Bulk selection handlers
    const handleSelectCommission = (commissionId) => {
        const newSelected = new Set(selectedCommissions);
        if (newSelected.has(commissionId)) {
            newSelected.delete(commissionId);
        } else {
            newSelected.add(commissionId);
        }
        setSelectedCommissions(newSelected);
    };

    const handleSelectAll = () => {
        const pendingCommissions = commissions.filter(c => c.status?.toLowerCase() === 'pending');
        const allIds = new Set(pendingCommissions.map(c => c._id || c.id));
        setSelectedCommissions(allIds);
    };

    const handleClearSelection = () => {
        setSelectedCommissions(new Set());
    };

    // Bulk approve handler
    const handleBulkApprove = async () => {
        setBulkActionLoading(true);
        try {
            const commissionIds = Array.from(selectedCommissions);
            let successCount = 0;
            let failCount = 0;

            for (const commissionId of commissionIds) {
                try {
                    const result = await adminAPI.approveCommission(commissionId);
                    if (result.success) successCount++;
                    else failCount++;
                } catch (err) {
                    failCount++;
                    console.error(`Failed to approve commission ${commissionId}:`, err);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully approved ${successCount} commission(s)`);
                loadCommissions();
                handleClearSelection();
            }
            if (failCount > 0) {
                toast.error(`Failed to approve ${failCount} commission(s)`);
            }
        } catch (error) {
            console.error('Bulk approve error:', error);
            toast.error('Bulk approval failed');
        } finally {
            setBulkActionLoading(false);
            setShowBulkApproveModal(false);
        }
    };

    // Filter pending commissions for display
    const pendingCommissions = commissions.filter(c => c.status?.toLowerCase() === 'pending');

    if (loading) return <div className="loading-state">Loading commission history...</div>;

    return (
        <div className="commissions-history-page">
            <div className="page-header">
                <div>
                    <h1>💰 Commission History</h1>
                    <p>Track all earnings and distribution across the agent network</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleExport} className="btn btn-secondary">
                        📥 Export CSV
                    </button>
                    {stats.pending > 0 && (
                        <button
                            className="go-approvals-btn"
                            onClick={() => window.location.href = '/commission-approvals'}
                        >
                            🚀 Process Pending ({commissions.filter(c => c.status === 'pending').length})
                        </button>
                    )}
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <span className="card-label">Total Commissions</span>
                    <span className="card-value">₹{stats.totalEarned.toLocaleString()}</span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Pending Payouts</span>
                    <span className="card-value warning">₹{stats.pending.toLocaleString()}</span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Successfully Paid</span>
                    <span className="card-value success">₹{stats.paid.toLocaleString()}</span>
                </div>
            </div>

            {/* Bulk Action Bar - Only show for pending commissions */}
            {pendingCommissions.length > 0 && (
                <BulkActionBar
                    selectedCount={selectedCommissions.size}
                    totalCount={pendingCommissions.length}
                    onSelectAll={handleSelectAll}
                    onClearSelection={handleClearSelection}
                    entityName="pending commissions"
                    actions={[
                        {
                            label: 'Approve Selected',
                            icon: <CheckCircle size={18} />,
                            variant: 'success',
                            onClick: () => setShowBulkApproveModal(true),
                            disabled: bulkActionLoading
                        }
                    ]}
                />
            )}

            <div className="table-container">
                <table className="commissions-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCommissions.size === pendingCommissions.length && pendingCommissions.length > 0}
                                    onChange={() => selectedCommissions.size === pendingCommissions.length ? handleClearSelection() : handleSelectAll()}
                                    style={{ cursor: 'pointer' }}
                                    disabled={pendingCommissions.length === 0}
                                />
                            </th>
                            <th>ID</th>
                            <th>Agent</th>
                            <th>Policy / Customer</th>
                            <th>Amount</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.length > 0 ? (
                            commissions.map((item, idx) => {
                                const key = item.id || item._id || idx;
                                const policyNumber = item.policy?.policyNumber || item.policyId?.policyNumber || item.policyId || 'N/A';
                                const customerName = item.policy?.ownerName || item.policyId?.ownerName || 'N/A';
                                const amountValue = normalizeNumber(item.amount);
                                const status = (item.status || '').toLowerCase();
                                const isPending = status === 'pending';
                                return (
                                    <tr key={key}>
                                        <td>
                                            {isPending ? (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCommissions.has(key)}
                                                    onChange={() => handleSelectCommission(key)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            ) : (
                                                <span style={{ width: '18px', display: 'inline-block' }}>-</span>
                                            )}
                                        </td>
                                        <td>#{key}</td>
                                        <td>
                                            <div className="agent-col">
                                                <span className="agent-name">{item.agent?.user?.fullName || 'N/A'}</span>
                                                <span className="agent-code">{item.agent?.agentCode}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="policy-col">
                                                <span className="policy-id">Policy #{policyNumber}</span>
                                                <span className="customer-name">{customerName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="amount">₹{amountValue.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <span className={`level-badge L${item.level}`}>
                                                Level {item.level}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${status}`}>
                                                {status || 'unknown'}
                                            </span>
                                            {status === 'pending' && (
                                                <button
                                                    className="quick-approve-btn"
                                                    onClick={() => handleApprove(item.id || item._id)}
                                                    disabled={processingId === (item.id || item._id)}
                                                >
                                                    {processingId === (item.id || item._id) ? '...' : 'Approve'}
                                                </button>
                                            )}
                                        </td>
                                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No commission records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bulk Approve Modal */}
            {showBulkApproveModal && (
                <div className="modal-overlay" onClick={() => !bulkActionLoading && setShowBulkApproveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✅ Bulk Approve Commissions</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowBulkApproveModal(false)}
                                disabled={bulkActionLoading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>You are about to approve <strong>{selectedCommissions.size}</strong> commission(s).</p>
                            <p>This action will:</p>
                            <ul>
                                <li>✅ Mark commissions as approved</li>
                                <li>✅ Update payment status</li>
                                <li>✅ Notify agents of approval</li>
                                <li>✅ Make commissions ready for payout</li>
                            </ul>
                            <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9em' }}>
                                💡 Tip: Approved commissions can be processed for payment in the next payout cycle.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowBulkApproveModal(false)}
                                disabled={bulkActionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleBulkApprove}
                                disabled={bulkActionLoading}
                            >
                                {bulkActionLoading ? 'Processing...' : `Approve ${selectedCommissions.size} Commission(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionHistory;
