import { useState, useEffect } from 'react';
import '../App.css';

const CommissionApprovals = () => {
    const [commissions, setCommissions] = useState([]);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

    useEffect(() => {
        loadCommissions();
    }, []);

    const loadCommissions = () => {
        // Load from localStorage (shared with customer frontend)
        const savedCommissions = JSON.parse(localStorage.getItem('commission_records') || '[]');
        setCommissions(savedCommissions);
    };

    const handleApprove = (commissionId) => {
        const updated = commissions.map(comm =>
            comm.id === commissionId
                ? { ...comm, status: 'approved', approvedDate: new Date().toISOString() }
                : comm
        );
        setCommissions(updated);
        localStorage.setItem('commission_records', JSON.stringify(updated));

        // Update agent wallet
        const commission = commissions.find(c => c.id === commissionId);
        if (commission) {
            const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
            const agentIndex = allAgents.findIndex(a => a.id === commission.agentId);
            if (agentIndex !== -1) {
                allAgents[agentIndex].walletBalance += commission.amount;
                allAgents[agentIndex].totalEarnings += commission.amount;
                localStorage.setItem('agent_hierarchy', JSON.stringify(allAgents));
            }
        }

        alert('Commission approved successfully!');
    };

    const handleReject = (commissionId) => {
        if (!confirm('Are you sure you want to reject this commission?')) return;

        const updated = commissions.map(comm =>
            comm.id === commissionId
                ? { ...comm, status: 'rejected', rejectedDate: new Date().toISOString() }
                : comm
        );
        setCommissions(updated);
        localStorage.setItem('commission_records', JSON.stringify(updated));
        alert('Commission rejected!');
    };

    const handleBulkApprove = () => {
        const pendingCommissions = commissions.filter(c => c.status === 'pending');
        if (pendingCommissions.length === 0) {
            alert('No pending commissions to approve');
            return;
        }

        if (!confirm(`Approve ${pendingCommissions.length} pending commissions?`)) return;

        const updated = commissions.map(comm =>
            comm.status === 'pending'
                ? { ...comm, status: 'approved', approvedDate: new Date().toISOString() }
                : comm
        );
        setCommissions(updated);
        localStorage.setItem('commission_records', JSON.stringify(updated));

        // Update all agent wallets
        const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        pendingCommissions.forEach(commission => {
            const agentIndex = allAgents.findIndex(a => a.id === commission.agentId);
            if (agentIndex !== -1) {
                allAgents[agentIndex].walletBalance += commission.amount;
                allAgents[agentIndex].totalEarnings += commission.amount;
            }
        });
        localStorage.setItem('agent_hierarchy', JSON.stringify(allAgents));

        alert(`${pendingCommissions.length} commissions approved successfully!`);
    };

    const filteredCommissions = commissions.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    const stats = {
        pending: commissions.filter(c => c.status === 'pending').length,
        approved: commissions.filter(c => c.status === 'approved').length,
        rejected: commissions.filter(c => c.status === 'rejected').length,
        totalPending: commissions
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + c.amount, 0)
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Commission Approvals</h1>
                <p>Review and approve agent commission requests</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Pending Approvals</h3>
                    <div className="value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <h3>Pending Amount</h3>
                    <div className="value" style={{ color: '#f59e0b' }}>
                        ₹{stats.totalPending.toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Approved</h3>
                    <div className="value" style={{ color: '#10b981' }}>{stats.approved}</div>
                </div>
                <div className="stat-card">
                    <h3>Rejected</h3>
                    <div className="value" style={{ color: '#ef4444' }}>{stats.rejected}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-card">
                <div className="card-header">
                    <h2>Commission Requests</h2>
                    <button
                        className="btn btn-success"
                        onClick={handleBulkApprove}
                        disabled={stats.pending === 0}
                    >
                        Approve All Pending ({stats.pending})
                    </button>
                </div>

                <div className="filter-bar">
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved ({stats.approved})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected ({stats.rejected})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({commissions.length})
                    </button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Policy Number</th>
                            <th>Agent</th>
                            <th>Level</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCommissions.length > 0 ? (
                            filteredCommissions.map(commission => (
                                <tr key={commission.id}>
                                    <td>{new Date(commission.date).toLocaleDateString('en-IN')}</td>
                                    <td style={{ fontWeight: 600 }}>{commission.policyNumber}</td>
                                    <td>
                                        <div>{commission.agentName}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {commission.agentCode}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${commission.level === 1 ? 'success' : commission.level === 2 ? 'warning' : 'error'}`}>
                                            Level {commission.level}
                                        </span>
                                    </td>
                                    <td>{commission.rate}%</td>
                                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                                        ₹{commission.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${commission.status === 'approved' ? 'success' :
                                                commission.status === 'pending' ? 'warning' : 'error'
                                            }`}>
                                            {commission.status}
                                        </span>
                                    </td>
                                    <td>
                                        {commission.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApprove(commission.id)}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleReject(commission.id)}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        )}
                                        {commission.status !== 'pending' && (
                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                {commission.status === 'approved' ? 'Approved' : 'Rejected'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    No {filter !== 'all' ? filter : ''} commissions found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionApprovals;
