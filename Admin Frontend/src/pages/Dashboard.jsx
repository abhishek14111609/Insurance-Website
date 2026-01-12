import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { policyAPI, adminAPI } from '../services/api.service';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPolicies: 0,
        pendingPolicies: 0,
        approvedPolicies: 0,
        rejectedPolicies: 0,
        totalAgents: 0,
        pendingAgents: 0,
        activeAgents: 0,
        pendingWithdrawals: 0,
        totalWithdrawals: 0,
        totalCustomers: 0,
        totalRevenue: 0
    });

    // We can fetch recent pending items separately if the dashboard stats endpoint
    // doesn't return list data, which is typical.
    const [pendingPolicies, setPendingPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Get Dashboard Stats
            const statsResponse = await adminAPI.getDashboardStats();
            if (statsResponse.success) {
                setStats(statsResponse.data);
            }

            // 2. Get Pending Policies for the list
            const policyResponse = await policyAPI.getPending();
            if (policyResponse.success) {
                setPendingPolicies(policyResponse.data.policies?.slice(0, 5) || []);
            }

        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3>{stats.pendingPolicies}</h3>
                        <p>Pending Policies</p>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.activeAgents}</h3>
                        <p>Active Agents</p>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">👤</div>
                    <div className="stat-content">
                        <h3>{stats.totalCustomers}</h3>
                        <p>Total Customers</p>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>₹{stats.totalRevenue?.toLocaleString() || '0'}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            {/* Pending Approvals Section */}
            <div className="approvals-section">
                <h2>⚠️ Pending Approvals</h2>

                <div className="approvals-grid">
                    {/* Pending Policies */}
                    <div className="approval-card">
                        <div className="approval-header">
                            <h3>📋 Policy Approvals</h3>
                            <span className="count-badge">{pendingPolicies.length}</span>
                        </div>
                        <div className="approval-list">
                            {pendingPolicies.length > 0 ? (
                                pendingPolicies.map(policy => (
                                    <div key={policy.id} className="approval-item">
                                        <div className="item-info">
                                            <strong>{policy.policyNumber}</strong>
                                            <span>{policy.customer?.fullName || policy.ownerName}</span>
                                        </div>
                                        <span className="item-amount">₹{parseInt(policy.coverageAmount || 0).toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No pending policies</p>
                            )}
                        </div>
                        <Link to="/policy-approvals" className="view-all-btn">
                            View All →
                        </Link>
                    </div>

                    {/* Pending Agents */}
                    <div className="approval-card">
                        <div className="approval-header">
                            <h3>👥 Agent Approvals</h3>
                            <span className="count-badge">{stats.pendingAgents}</span>
                        </div>
                        <div className="approval-list">
                            <div className="stat-summary">
                                {stats.pendingAgents > 0 ? (
                                    <p className="text-warning">{stats.pendingAgents} agents waiting for verification</p>
                                ) : (
                                    <p className="empty-state">No pending agents</p>
                                )}
                            </div>
                        </div>
                        <Link to="/agent-approvals" className="view-all-btn">
                            View All →
                        </Link>
                    </div>

                    {/* Pending Withdrawals */}
                    <div className="approval-card">
                        <div className="approval-header">
                            <h3>💳 Withdrawal Requests</h3>
                            <span className="count-badge">{stats.pendingWithdrawals}</span>
                        </div>
                        <div className="approval-list">
                            {stats.pendingWithdrawals > 0 ? (
                                <p className="text-warning" style={{ padding: '1rem' }}>{stats.pendingWithdrawals} requests pending processing</p>
                            ) : (
                                <p className="empty-state">No pending withdrawals</p>
                            )}
                        </div>
                        <Link to="/withdrawal-approvals" className="view-all-btn">
                            View All →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>⚡ Quick Actions</h2>
                <div className="actions-grid">
                    <Link to="/policy-approvals" className="action-btn primary">
                        <span className="action-icon">📋</span>
                        <span>Approve Policies</span>
                        {stats.pendingPolicies > 0 && <span className="action-badge">{stats.pendingPolicies}</span>}
                    </Link>

                    <Link to="/agent-approvals" className="action-btn success">
                        <span className="action-icon">👥</span>
                        <span>Approve Agents</span>
                        {stats.pendingAgents > 0 && <span className="action-badge">{stats.pendingAgents}</span>}
                    </Link>

                    <Link to="/withdrawal-approvals" className="action-btn warning">
                        <span className="action-icon">💳</span>
                        <span>Process Withdrawals</span>
                        {stats.pendingWithdrawals > 0 && <span className="action-badge">{stats.pendingWithdrawals}</span>}
                    </Link>

                    <Link to="/commission-settings" className="action-btn info">
                        <span className="action-icon">⚙️</span>
                        <span>Commission Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
