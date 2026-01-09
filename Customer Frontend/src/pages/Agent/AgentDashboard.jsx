import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WalletCard from '../../components/WalletCard';
import { getTeamStats, initializeMockAgentData } from '../../utils/agentUtils';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const navigate = useNavigate();
    const [currentAgent] = useState({
        id: 'agent-1',
        code: 'AG001',
        name: 'Rajesh Kumar'
    });

    const [walletData, setWalletData] = useState({
        balance: 24500,
        pendingAmount: 8100,
        transactionCount: 15
    });

    const [teamStats, setTeamStats] = useState({
        teamSize: 0,
        totalCustomers: 0,
        totalPolicies: 0
    });

    useEffect(() => {
        initializeMockAgentData();
        const stats = getTeamStats(currentAgent.id);
        setTeamStats(stats);
    }, []);

    // Mock Data
    const stats = [
        { title: 'Total Policies Sold', value: 142, icon: '📄', change: '+12%', color: 'var(--info-color)' },
        { title: 'Team Members', value: teamStats.teamSize, icon: '👥', change: `+${teamStats.directReports}`, color: 'var(--primary-color)' },
        { title: 'Total Commission', value: '₹1,25,000', icon: '💰', change: '+8.5%', color: 'var(--success-color)' },
        { title: 'This Month', value: '₹24,500', icon: '📈', change: '+15%', color: 'var(--success-color)' },
    ];

    const recentPolicies = [
        { id: 'ANI-001234', customer: 'Ramesh Sharma', type: 'Animal Insurance', date: '2024-03-15', premium: '₹2,000', status: 'Active', commission: '₹300' },
        { id: 'ANI-001235', customer: 'Priya Patel', type: 'Animal Insurance', date: '2024-03-12', premium: '₹1,500', status: 'Pending', commission: '₹225' },
        { id: 'ANI-001236', customer: 'Suresh Kumar', type: 'Animal Insurance', date: '2024-03-10', premium: '₹2,500', status: 'Active', commission: '₹375' },
    ];

    return (
        <div className="agent-dashboard fade-in-up">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">Welcome back, {currentAgent.name}! Here's your performance summary.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/animal-insurance')}>
                        + Sell New Policy
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
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

            {/* Wallet Card */}
            <div style={{ marginBottom: '2rem' }}>
                <WalletCard
                    balance={walletData.balance}
                    pendingAmount={walletData.pendingAmount}
                    transactionCount={walletData.transactionCount}
                    onWithdraw={() => navigate('/agent/wallet')}
                    onViewTransactions={() => navigate('/agent/wallet')}
                />
            </div>

            <div className="dashboard-grid">
                {/* Recent Policies */}
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
                                    <th>Commission</th>
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
                                        <td className="text-success" style={{ fontWeight: 700 }}>{policy.commission}</td>
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

                {/* Quick Actions */}
                <div className="card quick-actions-card">
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="action-grid">
                        <Link to="/agent/team" className="action-item">
                            <div className="action-icon">🌳</div>
                            <span>My Team</span>
                            <small>{teamStats.teamSize} members</small>
                        </Link>
                        <Link to="/agent/customers" className="action-item">
                            <div className="action-icon">👥</div>
                            <span>Customers</span>
                            <small>{teamStats.totalCustomers} total</small>
                        </Link>
                        <Link to="/agent/wallet" className="action-item">
                            <div className="action-icon">💰</div>
                            <span>Wallet</span>
                            <small>₹{walletData.balance.toLocaleString('en-IN')}</small>
                        </Link>
                        <Link to="/agent/commissions" className="action-item">
                            <div className="action-icon">📊</div>
                            <span>Earnings</span>
                            <small>View Reports</small>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Agent Code Reminder */}
            <div className="agent-code-reminder" style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginTop: '2rem',
                border: '2px solid #3b82f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>Your Agent Code</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Share this code with customers to earn commissions</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'var(--primary-color)',
                        fontFamily: 'monospace',
                        letterSpacing: '2px'
                    }}>
                        {currentAgent.code}
                    </span>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            navigator.clipboard.writeText(currentAgent.code);
                            alert('Agent code copied to clipboard!');
                        }}
                    >
                        📋 Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
