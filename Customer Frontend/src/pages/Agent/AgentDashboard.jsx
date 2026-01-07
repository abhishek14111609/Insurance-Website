import React from 'react';
import { Link } from 'react-router-dom';
import './AgentDashboard.css';

const AgentDashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Total Policies Sold', value: 124, icon: '📄', change: '+12%', color: 'var(--info-color)' },
        { title: 'Active Claims', value: 12, icon: '⚠️', change: '-2%', color: 'var(--warning-color)' },
        { title: 'Total Commission', value: '$4,250', icon: '💰', change: '+8.5%', color: 'var(--success-color)' },
        { title: 'New Leads', value: 5, icon: '👥', change: '+5', color: 'var(--primary-color)' },
    ];

    const recentPolicies = [
        { id: 'POL-001', customer: 'John Doe', type: 'Car Insurance', date: '2023-10-25', premium: '$450', status: 'Active' },
        { id: 'POL-002', customer: 'Jane Smith', type: 'Health Insurance', date: '2023-10-24', premium: '$210', status: 'Pending' },
        { id: 'POL-003', customer: 'Robert Brown', type: 'Bike Insurance', date: '2023-10-22', premium: '$85', status: 'Active' },
        { id: 'POL-004', customer: 'Alice Johnson', type: 'Travel Insurance', date: '2023-10-20', premium: '$120', status: 'Expired' },
    ];

    return (
        <div className="agent-dashboard fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">Welcome back, here's what's happening today.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">+ New Policy</button>
                </div>
            </div>

            <section className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="card stat-card">
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                            <span className="stat-change" style={{ color: stat.change.startsWith('+') ? 'var(--success-color)' : 'var(--error-color)' }}>
                                {stat.change} <span className="text-muted">vs last month</span>
                            </span>
                        </div>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </section>

            <div className="dashboard-grid">
                <div className="card recent-activity-card">
                    <div className="card-header">
                        <h2>Recent Policies</h2>
                        <Link to="/agent/policies" className="btn-link">View All</Link>
                    </div>
                    <div className="table-responsive">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Policy ID</th>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Premium</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPolicies.map((policy) => (
                                    <tr key={policy.id}>
                                        <td className="font-medium">{policy.id}</td>
                                        <td>{policy.customer}</td>
                                        <td>{policy.type}</td>
                                        <td>{policy.premium}</td>
                                        <td>{policy.date}</td>
                                        <td>
                                            <span className={`status-badge ${policy.status.toLowerCase()}`}>
                                                {policy.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card quick-actions-card">
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="action-grid">
                        <Link to="/agent/customers/new" className="action-item">
                            <span className="action-icon">👤</span>
                            <span>Add Customer</span>
                        </Link>
                        <Link to="/agent/claims" className="action-item">
                            <span className="action-icon">📋</span>
                            <span>Process Claim</span>
                        </Link>
                        <Link to="/agent/quotes" className="action-item">
                            <span className="action-icon">💬</span>
                            <span>Generate Quote</span>
                        </Link>
                        <Link to="/agent/reports" className="action-item">
                            <span className="action-icon">📊</span>
                            <span>View Reports</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
