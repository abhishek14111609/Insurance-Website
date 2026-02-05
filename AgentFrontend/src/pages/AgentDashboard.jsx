import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI } from '../services/api.service';
import { formatCurrency } from '../utils/numberUtils';
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
            {/* Profile Header */}
            <div className="dashboard-header-profile">
                <div className="profile-main">
                    <div className="profile-avatar">
                        {user?.fullName?.charAt(0) || 'A'}
                        {user?.kycStatus === 'verfied' && <span className="verified-badge">✓</span>}
                    </div>
                    <div className="profile-details">
                        <div className="profile-name-row">
                            <h1>{user?.fullName}</h1>
                            {user?.kycStatus === 'verified' && (
                                <span className="status-pill verified">Verified Agent</span>
                            )}
                        </div>
                        <p className="profile-email">{user?.email}</p>
                        <div className="profile-meta">
                            <div className="meta-item">
                                <span className="meta-label">Agent Code</span>
                                <span className="meta-value code">{user?.agentCode || 'PENDING'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Joined</span>
                                <span className="meta-value">{new Date(user?.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/profile" className="btn btn-outline">
                        Edit Profile
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
                        <Link to="/profile" className="btn btn-primary">
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
                        <p className="stat-value">{formatCurrency(stats?.totalEarnings)}</p>
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
                        <p className="stat-value">{formatCurrency(stats?.walletBalance)}</p>
                        <small>Available for withdrawal</small>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    <Link to="/sell" className="action-card highlight">
                        <span className="action-icon">➕</span>
                        <h3>Sell New Policy</h3>
                        <p>Enroll a new customer now</p>
                    </Link>

                    <Link to="/renewals" className="action-card">
                        <span className="action-icon">🔄</span>
                        <h3>Renewals</h3>
                        <p>Process policy renewals</p>
                    </Link>

                    <Link to="/policies" className="action-card">
                        <span className="action-icon">📄</span>
                        <h3>My Policies</h3>
                        <p>View all policies you've sold</p>
                    </Link>

                    <Link to="/team" className="action-card">
                        <span className="action-icon">🤝</span>
                        <h3>My Team</h3>
                        <p>Manage your agent network</p>
                    </Link>

                    <Link to="/commissions" className="action-card">
                        <span className="action-icon">💰</span>
                        <h3>Commissions</h3>
                        <p>Track your earnings</p>
                    </Link>

                    {/* <Link to="/wallet" className="action-card">
                        <span className="action-icon">💳</span>
                        <h3>Wallet</h3>
                        <p>Manage withdrawals</p>
                    </Link> */}
                </div>
            </div>

            <div className="dashboard-columns-grid">
                {/* Main Content Column */}
                <div className="main-column">
                    {/* Maintenance & Performance Grid */}
                    <div className="performance-grid-new">
                        {/* Upcoming Renewals Card */}
                        <div className="maintenance-card">
                            <div className="card-header">
                                <h2>♻️ Expiring Soon</h2>
                                <span className="count-badge warning">{stats?.upcomingRenewalsCount || 0}</span>
                            </div>
                            <p>Policies expiring in the next 30 days. Contact these customers for renewals to maintain your commissions.</p>
                            <Link to="/renewals" className="btn btn-sm btn-primary">
                                View Renewals
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
                                                    <strong>{formatCurrency(performer.totalEarnings)}</strong>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state-mini">
                                    <p>No team members yet.</p>
                                </div>
                            )}
                            <Link to="/team" className="view-link">View Full Team →</Link>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="performance-section">
                        <div className="section-header">
                            <h2>📊 Monthly Performance</h2>
                            <span className="period-badge">This Month</span>
                        </div>
                        <div className="monthly-stats-grid">
                            <div className="monthly-stat-card">
                                <div className="stat-icon-mini policies">📄</div>
                                <div className="stat-info">
                                    <span className="label">Policies Sold</span>
                                    <span className="value">{stats?.thisMonth?.policies || 0}</span>
                                </div>
                            </div>
                            <div className="monthly-stat-card">
                                <div className="stat-icon-mini income">💰</div>
                                <div className="stat-info">
                                    <span className="label">Commissions</span>
                                    <span className="value">{formatCurrency(stats?.thisMonth?.commissions)}</span>
                                </div>
                            </div>
                            <div className="monthly-stat-card">
                                <div className="stat-icon-mini team">👥</div>
                                <div className="stat-info">
                                    <span className="label">New Recruits</span>
                                    <span className="value">{stats?.thisMonth?.newMembers || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="sidebar-column">
                    {/* Recent Activity */}
                    <div className="recent-activity-panel">
                        <div className="panel-header">
                            <h2>Recent Commissions</h2>
                            <Link to="/commissions" className="link-sm">View All</Link>
                        </div>

                        {stats?.recentCommissions && stats.recentCommissions.length > 0 ? (
                            <div className="activity-timeline">
                                {stats.recentCommissions.slice(0, 5).map((commission, idx) => {
                                    const key = commission.id || commission._id || idx;
                                    return (
                                        <div key={key} className="timeline-item">
                                            <div className="timeline-icon">💰</div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <span className="commission-amount">{formatCurrency(commission.amount)}</span>
                                                    <span className={`status-dot ${commission.status}`}></span>
                                                </div>
                                                <p className="policy-ref">Policy #{commission.policy?.policyNumber}</p>
                                                <span className="timeline-date">
                                                    {new Date(commission.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state-panel">
                                <div className="empty-icon">💸</div>
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
