
import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './CommissionApprovals.css';

const CommissionApprovals = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const normalizeNumber = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'object' && value.$numberDecimal) {
            return Number(value.$numberDecimal);
        }
        const num = Number(value);
        return Number.isNaN(num) ? null : num;
    };

    useEffect(() => {
        loadPendingCommissions();
    }, []);

    const loadPendingCommissions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllCommissions();
            if (response.success) {
                // Filter only pending commissions
                const pending = (response.data.commissions || []).filter(c => c.status === 'pending');
                setCommissions(pending);
            }
        } catch (error) {
            console.error('Error loading pending commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this commission? The amount will be instantly credited to the agent\'s wallet.')) {
            return;
        }

        try {
            setProcessingId(id);
            const response = await adminAPI.approveCommission(id);
            if (response.success) {
                alert('Commission approved successfully!');
                // Remove from list
                setCommissions(prev => prev.filter(c => c.id !== id));
            } else {
                alert(response.message || 'Failed to approve commission');
            }
        } catch (error) {
            console.error('Approve commission error:', error);
            alert('An error occurred while approving the commission');
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveAll = async () => {
        if (commissions.length === 0) return;

        if (!window.confirm(`Are you sure you want to approve ALL ${commissions.length} pending commissions?`)) {
            return;
        }

        let successCount = 0;
        let failCount = 0;

        setLoading(true);
        for (const commission of commissions) {
            try {
                const response = await adminAPI.approveCommission(commission.id);
                if (response.success) successCount++;
                else failCount++;
            } catch (err) {
                failCount++;
            }
        }

        alert(`Process complete! Success: ${successCount}, Failed: ${failCount}`);
        loadPendingCommissions();
    };

    if (loading && commissions.length === 0) return <div className="loading-state">Loading pending commissions...</div>;

    return (
        <div className="commission-approvals-page">
            <div className="approvals-header">
                <div>
                    <h1>💰 Commission Approvals</h1>
                    <p className="subtitle">Verify and credit earned commissions to agent wallets</p>
                </div>
                <div className="stat-group">
                    <div className="stat-item">
                        <span className="label">Pending Requests</span>
                        <span className="value">{commissions.length}</span>
                    </div>
                    {commissions.length > 0 && (
                        <button
                            className="action-btn approve-btn"
                            onClick={handleApproveAll}
                            disabled={loading}
                        >
                            ⚡ Approve All
                        </button>
                    )}
                </div>
            </div>

            <div className="commissions-table-container">
                {commissions.length > 0 ? (
                    <table className="commissions-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Agent Details</th>
                                <th>Policy Information</th>
                                <th>Amount</th>
                                <th>Level</th>
                                <th>Request Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.map((item, idx) => {
                                const key = item.id || item._id || idx;
                                const policyNumber = item.policy?.policyNumber || item.policyId?.policyNumber || item.policyId || 'N/A';
                                const agentName = item.agent?.user?.fullName || item.agent?.userId?.fullName;
                                const agentCode = item.agent?.agentCode || item.agentId?.agentCode;
                                const amountValue = normalizeNumber(item.amount);
                                const percentageValue = normalizeNumber(item.percentage);
                                return (
                                    <tr key={key}>
                                        <td>#{key}</td>
                                        <td>
                                            <div className="agent-info">
                                                <span className="agent-name">{agentName || 'Unknown Agent'}</span>
                                                <span className="agent-code">{agentCode || '—'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="policy-info">
                                                <div>Policy #{policyNumber}</div>
                                                <div>Customer: {item.policy?.ownerName || item.policyId?.ownerName || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="amount-cell">₹{amountValue !== null ? amountValue.toLocaleString() : 'N/A'}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{percentageValue !== null ? `${percentageValue}% of premium` : '—'}</div>
                                        </td>
                                        <td>
                                            <span className={`level-badge L${item.level}`}>
                                                Level {item.level}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="action-btn approve-btn"
                                                onClick={() => handleApprove(item.id || item._id)}
                                                disabled={processingId === (item.id || item._id)}
                                            >
                                                {processingId === (item.id || item._id) ? '...' : '✅ Approve'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="icon">🏆</div>
                        <h3>All Commissions Processed!</h3>
                        <p>There are no pending commission requests at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionApprovals;
