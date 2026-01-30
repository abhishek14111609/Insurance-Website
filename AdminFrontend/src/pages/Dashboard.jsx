import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { policyAPI, adminAPI } from '../services/api.service';
import { CardSkeleton, SectionLoader } from '../components/Loader';
import './Dashboard.css';

import {
    Clock,
    Users,
    UserCircle,
    IndianRupee,
    ChevronRight,
    AlertCircle,
    ClipboardCheck,
    Wallet,
    Stethoscope,
    Settings,
    ArrowUpRight,
    TrendingUp,
    Mail
} from 'lucide-react';

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
        totalRevenue: 0,
        pendingClaims: 0,
        totalClaims: 0
    });

    const [pendingPolicies, setPendingPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const statsResponse = await adminAPI.getDashboardStats();
            console.log(statsResponse)
            if (statsResponse.success) {
                const s = statsResponse.data.stats;
                setStats({
                    totalPolicies: s.policies.total,
                    pendingPolicies: s.policies.pending,
                    approvedPolicies: s.policies.active,
                    totalAgents: s.agents.total,
                    pendingAgents: s.agents.pending,
                    activeAgents: s.agents.active,
                    pendingWithdrawals: s.financial.pendingWithdrawals,
                    totalWithdrawals: s.financial.totalWithdrawals,
                    totalCustomers: s.customers.total,
                    totalRevenue: s.financial.totalPremium,
                    pendingClaims: s.claims.pending,
                    totalClaims: s.claims.total
                });
            }

            const policyResponse = await policyAPI.getPending();
            if (policyResponse.success) {
                setPendingPolicies(policyResponse.data.policies?.slice(0, 5) || []);
            }

        } catch (err) {
            console.error('Dashboard load error:', err);
            setError('Failed to connect to backend server. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    if (error) return (
        <div className="admin-dashboard error-state-container">
            <div className="error-card">
                <AlertCircle size={64} className="error-icon" />
                <h2>Connection Error</h2>
                <p>{error}</p>
                <div className="error-actions">
                    <button onClick={loadData} className="btn btn-primary">Try Again</button>
                    <Link to="/database-setup" className="btn btn-secondary">Setup Database</Link>
                </div>
            </div>
        </div>
    );

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header-modern">
                <div className="header-text">
                    <h1>Overview</h1>
                    <p>Real-time statistics and updates</p>
                </div>
                <div className="header-date">
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-modern">
                {loading ? (
                    <>
                        <CardSkeleton count={1} />
                        <CardSkeleton count={1} />
                        <CardSkeleton count={1} />
                        <CardSkeleton count={1} />
                    </>
                ) : (
                    <>
                        <div className="stat-card-modern primary">
                            <div className="icon-wrapper">
                                <Clock size={28} />
                            </div>
                            <div className="stat-info">
                                <span className="label">Pending Policies</span>
                                <h2 className="value">{stats.pendingPolicies}</h2>
                                <span className="trend positive"><TrendingUp size={12} /> Needs review</span>
                            </div>
                        </div>

                        <div className="stat-card-modern success">
                            <div className="icon-wrapper">
                                <Users size={28} />
                            </div>
                            <div className="stat-info">
                                <span className="label">Active Agents</span>
                                <h2 className="value">{stats.activeAgents}</h2>
                                <span className="trend">Growth focus</span>
                            </div>
                        </div>

                        <div className="stat-card-modern info">
                            <div className="icon-wrapper">
                                <UserCircle size={28} />
                            </div>
                            <div className="stat-info">
                                <span className="label">Total Customers</span>
                                <h2 className="value">{stats.totalCustomers}</h2>
                                <span className="trend">Lifetime users</span>
                            </div>
                        </div>

                        <div className="stat-card-modern accent">
                            <div className="icon-wrapper">
                                <IndianRupee size={28} />
                            </div>
                            <div className="stat-info">
                                <span className="label">Total Revenue</span>
                                <h2 className="value">{formatCurrency(stats.totalRevenue)}</h2>
                                <span className="trend positive"><ArrowUpRight size={12} /> Premium collected</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Main Dashboard Section */}
            <div className="dashboard-main-grid">
                {/* Left Side: Pending Items */}
                <div className="pending-approvals-card">
                    <div className="section-header">
                        <h2><Clock size={20} /> Action Center</h2>
                        <span className="subtitle">Items requiring immediate attention</span>
                    </div>

                    <div className="approvals-mini-grid">
                        <div className="approval-card-mini">
                            <div className="card-top">
                                <ClipboardCheck className="icon" size={18} />
                                <span className="count">{stats.pendingPolicies}</span>
                            </div>
                            <span className="label">Policy Appr.</span>
                            <Link to="/policy-approvals" className="mini-link">Handle <ChevronRight size={12} /></Link>
                        </div>

                        <div className="approval-card-mini">
                            <div className="card-top">
                                <Users className="icon" size={18} />
                                <span className="count">{stats.pendingAgents}</span>
                            </div>
                            <span className="label">Agent Verif.</span>
                            <Link to="/agent-approvals" className="mini-link">Review <ChevronRight size={12} /></Link>
                        </div>

                        <div className="approval-card-mini">
                            <div className="card-top">
                                <Wallet className="icon" size={18} />
                                <span className="count">{stats.pendingWithdrawals}</span>
                            </div>
                            <span className="label">Withdrawals</span>
                            <Link to="/withdrawal-approvals" className="mini-link">Process <ChevronRight size={12} /></Link>
                        </div>

                        <div className="approval-card-mini">
                            <div className="card-top">
                                <Stethoscope className="icon" size={18} />
                                <span className="count">{stats.pendingClaims}</span>
                            </div>
                            <span className="label">Claim Appr.</span>
                            <Link to="/claim-approvals" className="mini-link">Update <ChevronRight size={12} /></Link>
                        </div>
                    </div>

                    {/* Recent Pending Policies List */}
                    <div className="recent-list-container">
                        <h3>Recent Pending Policies</h3>
                        <div className="recent-list">
                            {pendingPolicies.length > 0 ? (
                                pendingPolicies.map(policy => (
                                    <div key={policy._id || policy.id} className="recent-item">
                                        <div className="item-avatar">
                                            {policy.cattleType === 'cow' ? '🐄' : '🐃'}
                                        </div>
                                        <div className="item-details">
                                            <strong>{policy.policyNumber}</strong>
                                            <span>{policy.customer?.fullName || policy.ownerName}</span>
                                        </div>
                                        <div className="item-meta">
                                            <strong>{formatCurrency(policy.premium)}</strong>
                                            <span>Premium</span>
                                        </div>
                                        <Link to="/policy-approvals" className="item-btn">Review</Link>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-list">No pending policies to show</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Quick Actions & Settings */}
                <div className="dashboard-sidebar">
                    <div className="quick-actions-card">
                        <h3>Quick Navigation</h3>
                        <div className="actions-list">
                            <Link to="/policy-plans/add" className="action-item">
                                <div className="action-icon-box"><ClipboardCheck size={18} /></div>
                                <span>Create Policy Plan</span>
                            </Link>
                            <Link to="/commission-settings" className="action-item">
                                <div className="action-icon-box"><Settings size={18} /></div>
                                <span>Adjust Matrix</span>
                            </Link>
                            <Link to="/transactions" className="action-item">
                                <div className="action-icon-box"><ArrowUpRight size={18} /></div>
                                <span>Financial Logs</span>
                            </Link>
                            <Link to="/inquiries" className="action-item">
                                <div className="action-icon-box"><Mail size={18} /></div>
                                <span>Customer Chat</span>
                            </Link>
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Total Breakdown</h3>
                        <div className="breakdown-list">
                            <div className="breakdown-item">
                                <span>Total Submissions</span>
                                <strong>{stats.totalPolicies}</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Fulfilled Policies</span>
                                <strong>{stats.approvedPolicies}</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Settled Payouts</span>
                                <strong>{stats.totalWithdrawals > 0 ? stats.totalWithdrawals : '0'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
