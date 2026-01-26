import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const navigate = useNavigate();
    const { user, isAgent } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirect if not an agent
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchDashboardStats();
    }, [isAgent, navigate]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="agent-dashboard">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="agent-dashboard">
                <div className="error-state">
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchDashboardStats}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Agent Dashboard</h1>
                    <p>Welcome back, {user?.fullName}!</p>
                </div>
                <div className="header-actions">
                    <Link to="/agent/profile" className="btn btn-outline">
                        My Profile
                    </Link>
                </div>
            </div>

            {/* KYC Mandatory Card */}
            {user?.kycStatus?.toLowerCase() !== 'verified' && (
                <div className="mandatory-kyc-card">
                    <div className="kyc-content">
                        <div className="kyc-icon">📑</div>
                        <div className="kyc-info">
                            <h2>{user?.kycStatus?.toLowerCase() === 'pending' ? 'KYC Under Review' : 'Complete Your KYC'}</h2>
                            <p>
                                {user?.kycStatus?.toLowerCase() === 'pending'
                                    ? 'Your KYC documents are being verified by our team. You will be notified once approved.'
                                    : 'Please upload your identity and bank documents to start selling policies and withdrawing commissions.'}
                            </p>
                        </div>
                    </div>
                    {user?.kycStatus?.toLowerCase() !== 'pending' && (
                        <Link to="/agent/profile" className="btn btn-primary">
                            Upload Documents Now
                        </Link>
                    )}
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Total Earnings</h3>
                        <p className="stat-value">₹{stats?.totalEarnings?.toLocaleString() || '0'}</p>
                        <small>Lifetime commissions</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3>Policies Sold</h3>
                        <p className="stat-value">{stats?.totalPolicies || 0}</p>
                        <small>All time</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Team Size</h3>
                        <p className="stat-value">{stats?.teamSize || 0}</p>
                        <small>Direct + Indirect</small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💳</div>
                    <div className="stat-content">
                        <h3>Wallet Balance</h3>
                        <p className="stat-value">₹{stats?.walletBalance?.toLocaleString() || '0'}</p>
                        <small>Available for withdrawal</small>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Link to="/agent/sell" className="action-card highlight">
                        <span className="action-icon">➕</span>
                        <h3>Sell New Policy</h3>
                        <p>Enroll a new customer now</p>
                    </Link>

                    <Link to="/agent/policies" className="action-card">
                        <span className="action-icon">📄</span>
                        <h3>My Policies</h3>
                        <p>View all policies you've sold</p>
                    </Link>

                    <Link to="/agent/team" className="action-card">
                        <span className="action-icon">🤝</span>
                        <h3>My Team</h3>
                        <p>Manage your agent network</p>
                    </Link>

                    <Link to="/agent/commissions" className="action-card">
                        <span className="action-icon">💰</span>
                        <h3>Commissions</h3>
                        <p>Track your earnings</p>
                    </Link>

                    <Link to="/agent/wallet" className="action-card">
                        <span className="action-icon">💳</span>
                        <h3>Wallet</h3>
                        <p>Manage withdrawals</p>
                    </Link>
                </div>
            </div>

            {/* Maintenance & Performance Grid */}
            <div className="performance-grid-new">
                {/* Upcoming Renewals Card */}
                <div className="maintenance-card">
                    <div className="card-header">
                        <h2>♻️ Expiring Soon</h2>
                        <span className="count-badge warning">{stats?.upcomingRenewalsCount || 0}</span>
                    </div>
                    <p>Policies expiring in the next 30 days. Contact these customers for renewals to maintain your commissions.</p>
                    <Link to="/agent/policies?filter=EXPIRING" className="btn btn-sm btn-primary">
                        View Expiries
                    </Link>
                </div>

                {/* Top Performers Card */}
                <div className="maintenance-card">
                    <div className="card-header">
                        <h2>🏆 Team Leaders</h2>
                    </div>
                    {stats?.topPerformers && stats.topPerformers.length > 0 ? (
                        <div className="performers-list">
                            {stats.topPerformers.map((performer, idx) => {
                                const key = performer.agentCode || performer.id || idx;
                                return (
                                    <div key={key} className="performer-item">
                                        <span className="rank">#{idx + 1}</span>
                                        <div className="performer-info">
                                            <strong>{performer.name}</strong>
                                            <small>{performer.agentCode}</small>
                                        </div>
                                        <div className="performer-stat">
                                            <strong>₹{performer.totalEarnings?.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="empty-msg">No team members yet. Build your network to see leaders!</p>
                    )}
                    <Link to="/agent/team" className="view-link">View Full Team →</Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <div className="section-header">
                    <h2>Recent Commissions</h2>
                    <Link to="/agent/commissions" className="view-all-link">View All →</Link>
                </div>

                {stats?.recentCommissions && stats.recentCommissions.length > 0 ? (
                    <div className="activity-list">
                        {stats.recentCommissions.slice(0, 5).map((commission, idx) => {
                            const key = commission.id || commission._id || idx;
                            return (
                                <div key={key} className="activity-item">
                                    <div className="activity-icon">💰</div>
                                    <div className="activity-content">
                                        <h4>Commission Earned</h4>
                                        <p>Policy #{commission.policy?.policyNumber}</p>
                                        <small>{new Date(commission.createdAt).toLocaleDateString()}</small>
                                    </div>
                                    <div className="activity-amount">
                                        <span className={`status-badge status-${commission.status}`}>
                                            {commission.status}
                                        </span>
                                        <strong>₹{commission.amount?.toLocaleString()}</strong>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No recent commissions</p>
                    </div>
                )}
            </div>

            {/* Performance Summary */}
            <div className="performance-section">
                <h2>This Month's Performance</h2>
                <div className="performance-grid">
                    <div className="performance-card">
                        <h3>Policies Sold</h3>
                        <p className="performance-value">{stats?.thisMonth?.policies || 0}</p>
                    </div>
                    <div className="performance-card">
                        <h3>Commissions Earned</h3>
                        <p className="performance-value">₹{stats?.thisMonth?.commissions?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="performance-card">
                        <h3>New Team Members</h3>
                        <p className="performance-value">{stats?.thisMonth?.newMembers || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
