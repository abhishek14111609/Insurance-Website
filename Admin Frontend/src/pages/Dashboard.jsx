import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getPendingPolicies, getPendingAgents, getPendingWithdrawals } from '../utils/adminUtils';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingPolicies, setPendingPolicies] = useState([]);
    const [pendingAgents, setPendingAgents] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setStats(getAdminStats());
        setPendingPolicies(getPendingPolicies().slice(0, 5));
        setPendingAgents(getPendingAgents().slice(0, 5));
        setPendingWithdrawals(getPendingWithdrawals().slice(0, 5));
    };

    if (!stats) return <div>Loading...</div>;

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
                        <h3>{stats.totalPolicies}</h3>
                        <p>Total Policies</p>
                        <span className="stat-badge">{stats.pendingPolicies} pending</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.activeAgents}</h3>
                        <p>Active Agents</p>
                        <span className="stat-badge">{stats.pendingAgents} pending</span>
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
                        <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
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
                            <span className="count-badge">{stats.pendingPolicies}</span>
                        </div>
                        <div className="approval-list">
                            {pendingPolicies.length > 0 ? (
                                pendingPolicies.map(policy => (
                                    <div key={policy.id} className="approval-item">
                                        <div className="item-info">
                                            <strong>{policy.policyNumber}</strong>
                                            <span>{policy.customerName || policy.ownerName}</span>
                                        </div>
                                        <span className="item-amount">₹{policy.coverageAmount?.toLocaleString()}</span>
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
                            {pendingAgents.length > 0 ? (
                                pendingAgents.map(agent => (
                                    <div key={agent.id} className="approval-item">
                                        <div className="item-info">
                                            <strong>{agent.code}</strong>
                                            <span>{agent.name}</span>
                                        </div>
                                        <span className="item-level">Level {agent.level}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No pending agents</p>
                            )}
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
                            {pendingWithdrawals.length > 0 ? (
                                pendingWithdrawals.map(withdrawal => (
                                    <div key={withdrawal.id} className="approval-item">
                                        <div className="item-info">
                                            <strong>{withdrawal.agentCode}</strong>
                                            <span>{withdrawal.agentName}</span>
                                        </div>
                                        <span className="item-amount">₹{withdrawal.amount?.toLocaleString()}</span>
                                    </div>
                                ))
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

            {/* Recent Activity */}
            <div className="recent-activity">
                <h2>📊 Recent Statistics</h2>
                <div className="activity-stats">
                    <div className="activity-item">
                        <span className="activity-label">Approved Policies</span>
                        <span className="activity-value">{stats.approvedPolicies}</span>
                    </div>
                    <div className="activity-item">
                        <span className="activity-label">Rejected Policies</span>
                        <span className="activity-value">{stats.rejectedPolicies}</span>
                    </div>
                    <div className="activity-item">
                        <span className="activity-label">Total Agents</span>
                        <span className="activity-value">{stats.totalAgents}</span>
                    </div>
                    <div className="activity-item">
                        <span className="activity-label">Total Withdrawals</span>
                        <span className="activity-value">{stats.totalWithdrawals}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
