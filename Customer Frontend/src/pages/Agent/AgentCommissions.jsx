import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import './AgentCommissions.css';

const AgentCommissions = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchCommissions();
    }, [isAgent, navigate]);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getCommissions();
            if (response.success) {
                setCommissions(response.data.commissions || []);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCommissions = filter === 'all'
        ? commissions
        : commissions.filter(c => c.status === filter);

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'status-pending', text: 'Pending' },
            approved: { class: 'status-approved', text: 'Approved' },
            paid: { class: 'status-paid', text: 'Paid' }
        };
        return badges[status] || badges.pending;
    };

    if (loading) {
        return (
            <div className="agent-commissions">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading commissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-commissions">
            <div className="commissions-header">
                <h1>My Commissions</h1>
                <p>Track your earnings from policies</p>
            </div>

            {/* Stats Cards */}
            <div className="commission-stats-grid">
                <div className="stat-card">
                    <h3>Total Earned</h3>
                    <p className="stat-value">₹{stats?.totalEarned?.toLocaleString() || '0'}</p>
                </div>
                <div className="stat-card">
                    <h3>This Month</h3>
                    <p className="stat-value">₹{stats?.thisMonth?.toLocaleString() || '0'}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending</h3>
                    <p className="stat-value">₹{stats?.pending?.toLocaleString() || '0'}</p>
                </div>
                <div className="stat-card">
                    <h3>Paid</h3>
                    <p className="stat-value">₹{stats?.paid?.toLocaleString() || '0'}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({commissions.length})
                </button>
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({commissions.filter(c => c.status === 'pending').length})
                </button>
                <button
                    className={filter === 'approved' ? 'active' : ''}
                    onClick={() => setFilter('approved')}
                >
                    Approved ({commissions.filter(c => c.status === 'approved').length})
                </button>
                <button
                    className={filter === 'paid' ? 'active' : ''}
                    onClick={() => setFilter('paid')}
                >
                    Paid ({commissions.filter(c => c.status === 'paid').length})
                </button>
            </div>

            {/* Commissions List */}
            {filteredCommissions.length > 0 ? (
                <div className="commissions-list">
                    {filteredCommissions.map((commission) => {
                        const badge = getStatusBadge(commission.status);
                        return (
                            <div key={commission.id} className="commission-card">
                                <div className="commission-header">
                                    <div>
                                        <h3>Policy #{commission.policy?.policyNumber}</h3>
                                        <p>Level {commission.level} Commission</p>
                                    </div>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.text}
                                    </span>
                                </div>

                                <div className="commission-details">
                                    <div className="detail-item">
                                        <span>Commission Amount</span>
                                        <strong className="amount">₹{commission.amount?.toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Percentage</span>
                                        <strong>{commission.percentage}%</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Policy Premium</span>
                                        <strong>₹{commission.policy?.premium?.toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Earned On</span>
                                        <strong>{new Date(commission.createdAt).toLocaleDateString()}</strong>
                                    </div>
                                </div>

                                {commission.policy && (
                                    <div className="policy-info">
                                        <p><strong>Customer:</strong> {commission.policy.ownerName}</p>
                                        <p><strong>Cattle:</strong> {commission.policy.cattleType} - {commission.policy.tagId}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="empty-icon">💰</span>
                    <h3>No Commissions Found</h3>
                    <p>
                        {filter === 'all'
                            ? "You haven't earned any commissions yet. Start selling policies!"
                            : `No ${filter} commissions found.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgentCommissions;
