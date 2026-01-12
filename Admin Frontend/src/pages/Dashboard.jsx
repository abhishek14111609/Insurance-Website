import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { policyAPI } from '../services/api.service';
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
    const [pendingPolicies, setPendingPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch Pending Policies
            const policyResponse = await policyAPI.getPending();

            let policies = [];
            if (policyResponse.success) {
                policies = policyResponse.data.policies;
                setPendingPolicies(policies.slice(0, 5));
            }

            // Calculate basic stats from available data or default
            // Since we don't have a full stats endpoint yet, we use what we have.
            // Pending counts are accurate from API. Totals are unknown/0 for now.
            setStats(prev => ({
                ...prev,
                pendingPolicies: policies.length,
                pendingAgents: 0, // Placeholder
                pendingWithdrawals: 0, // Placeholder
            }));

        } catch (err) {
            console.error('Dashboard load error:', err);
            // Verify if auth error, done by api service usually
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
                        <h3>--</h3>
                        <p>Active Agents</p>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">👤</div>
                    <div className="stat-content">
                        <h3>--</h3>
                        <p>Total Customers</p>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>₹ --</h3>
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

                    {/* Pending Agents (Placeholder) */}
                    <div className="approval-card">
                        <div className="approval-header">
                            <h3>👥 Agent Approvals</h3>
                            <span className="count-badge">0</span>
                        </div>
                        <div className="approval-list">
                            <p className="empty-state">Agent system not connected</p>
                        </div>
                    </div>

                    {/* Pending Withdrawals (Placeholder) */}
                    <div className="approval-card">
                        <div className="approval-header">
                            <h3>💳 Withdrawal Requests</h3>
                            <span className="count-badge">0</span>
                        </div>
                        <div className="approval-list">
                            <p className="empty-state">Withdrawal system not connected</p>
                        </div>
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

                    <button className="action-btn success disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <span className="action-icon">👥</span>
                        <span>Approve Agents</span>
                    </button>

                    <button className="action-btn warning disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <span className="action-icon">💳</span>
                        <span>Process Withdrawals</span>
                    </button>

                    <button className="action-btn info disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <span className="action-icon">⚙️</span>
                        <span>Commission Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
