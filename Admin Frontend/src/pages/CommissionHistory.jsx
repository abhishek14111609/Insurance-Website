import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
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
                alert(response.message || 'Failed to approve commission');
            }
        } catch (error) {
            console.error('Approve error:', error);
            alert('An error occurred during approval');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="loading-state">Loading commission history...</div>;

    return (
        <div className="commissions-history-page">
            <div className="page-header">
                <div>
                    <h1>💰 Commission History</h1>
                    <p>Track all earnings and distribution across the agent network</p>
                </div>
                {stats.pending > 0 && (
                    <button
                        className="go-approvals-btn"
                        onClick={() => window.location.href = '/commission-approvals'}
                    >
                        🚀 Process Pending ({commissions.filter(c => c.status === 'pending').length})
                    </button>
                )}
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

            <div className="table-container">
                <table className="commissions-table">
                    <thead>
                        <tr>
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
                                return (
                                    <tr key={key}>
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
        </div>
    );
};

export default CommissionHistory;
