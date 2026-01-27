import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import './AllAgents.css';

import {
    Search,
    Filter,
    UserPlus,
    Eye,
    Ban,
    Users,
    CheckCircle,
    Clock,
    ShieldAlert,
    ChevronDown
} from 'lucide-react';

const AllAgents = () => {
    const [agents, setAgents] = useState([]);
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        filterAgents();
    }, [searchTerm, statusFilter, levelFilter, agents]);

    const loadAgents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getAllAgents();
            if (response.success) {
                const normalized = (response.data.agents || []).map((agent) => {
                    const user = agent.user || agent.userId || {};
                    const parentAgent = agent.parentAgent || agent.parentAgentId || null;
                    return {
                        ...agent,
                        user,
                        parentAgent,
                        status: (agent.status || 'pending').toLowerCase(),
                        kycStatus: (agent.kycStatus || 'not_submitted').toLowerCase(),
                        policyStats: agent.policyStats || {},
                        commissionStats: agent.commissionStats || {}
                    };
                });
                setAgents(normalized);
            } else {
                setError(response.message || 'Failed to load agents');
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            setError(error.message || 'Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const filterAgents = () => {
        let filtered = [...agents];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(agent =>
                (agent.user?.fullName || '').toLowerCase().includes(lowerSearch) ||
                (agent.agentCode || '').toLowerCase().includes(lowerSearch) ||
                (agent.user?.email || '').toLowerCase().includes(lowerSearch) ||
                (agent.user?.phone || '').toLowerCase().includes(lowerSearch) ||
                (agent.user?.city || '').toLowerCase().includes(lowerSearch) ||
                (agent.parentAgent?.agentCode || '').toLowerCase().includes(lowerSearch)
            );
        }

        if (statusFilter !== 'all') {
            const filterVal = statusFilter.toLowerCase();
            filtered = filtered.filter(agent => (agent.status || 'pending').toLowerCase() === filterVal);
        }

        if (levelFilter !== 'all') {
            filtered = filtered.filter(agent => agent.level === parseInt(levelFilter));
        }

        setFilteredAgents(filtered);
    };

    const handleReject = async (agentId, agentName) => {
        const reason = window.prompt(`Are you sure you want to block/reject agent: ${agentName}?\nPlease provide a reason:`);
        if (reason === null) return;
        if (!reason.trim()) {
            toast.error('A reason is required to block an agent.');
            return;
        }

        try {
            const result = await adminAPI.rejectAgent(agentId, reason);
            if (result.success) {
                toast.success('Agent blocked successfully');
                loadAgents();
            } else {
                toast.error(result.message || 'Failed to block agent');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred: ' + err.message);
        }
    };

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'approved':
            case 'active': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'inactive': return 'badge-secondary';
            case 'rejected':
            case 'blocked': return 'badge-error';
            default: return 'badge-secondary';
        }
    };

    const formatCurrency = (value = 0) => {
        const numeric = Number.isFinite(value) ? value : parseFloat(value) || 0;
        return `₹${numeric.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const statusCounts = {
        total: agents.length,
        active: agents.filter((a) => (a.status || '').toLowerCase() === 'active').length,
        pending: agents.filter((a) => (a.status || '').toLowerCase() === 'pending').length,
        rejected: agents.filter((a) => (a.status || '').toLowerCase() === 'rejected').length,
        kycPending: agents.filter((a) => (a.kycStatus || '').toLowerCase() === 'pending').length
    };

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    if (error) return (
        <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadAgents}>Retry</button>
        </div>
    );

    return (
        <div className="all-agents-page">
            <div className="page-header-modern">
                <div className="header-info">
                    <h1>Agent Network</h1>
                    <p>Manage your ecosystem of field agents and sub-agents</p>
                </div>
                <Link to="/agents/add" className="btn btn-primary">
                    <UserPlus size={20} /> Add New Agent
                </Link>
            </div>

            {/* Modern Stats Grid */}
            <div className="agents-stats-grid">
                <div className="agent-stat-card">
                    <div className="icon-box info"><Users size={20} /></div>
                    <div className="stat-data">
                        <h3>{statusCounts.total}</h3>
                        <span>Total Network</span>
                    </div>
                </div>
                <div className="agent-stat-card">
                    <div className="icon-box success"><CheckCircle size={20} /></div>
                    <div className="stat-data">
                        <h3>{statusCounts.active}</h3>
                        <span>Fully Active</span>
                    </div>
                </div>
                <div className="agent-stat-card">
                    <div className="icon-box warning"><Clock size={20} /></div>
                    <div className="stat-data">
                        <h3>{statusCounts.pending}</h3>
                        <span>Onboarding</span>
                    </div>
                </div>
                <div className="agent-stat-card">
                    <div className="icon-box danger"><ShieldAlert size={20} /></div>
                    <div className="stat-data">
                        <h3>{statusCounts.kycPending}</h3>
                        <span>KYC Tasks</span>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="modern-filters">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search agents by name, code, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-actions">
                    <div className="custom-select">
                        <Filter size={16} className="filter-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                            <option value="rejected">Rejected/Blocked</option>
                        </select>
                        <ChevronDown size={14} className="chevron" />
                    </div>

                    <div className="custom-select">
                        <Filter size={16} className="filter-icon" />
                        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                            <option value="all">All Levels</option>
                            {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l}</option>)}
                        </select>
                        <ChevronDown size={14} className="chevron" />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="table-card-modern">
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Agent Profile</th>
                                <th>Contact Info</th>
                                <th>Network</th>
                                <th>Status</th>
                                <th>Performance</th>
                                <th className="text-right">Earnings</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-table">
                                        <div className="empty-content">
                                            <Users size={48} />
                                            <p>No agents match your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAgents.map(agent => {
                                    const agentId = agent._id || agent.id;
                                    const policyStats = agent.policyStats || {};
                                    return (
                                        <tr key={agentId}>
                                            <td>
                                                <div className="agent-profile-cell">
                                                    <div className="agent-initials">
                                                        {agent.user?.fullName?.charAt(0) || 'A'}
                                                    </div>
                                                    <div className="agent-meta">
                                                        <strong>{agent.user?.fullName}</strong>
                                                        <span>{agent.agentCode || 'NO-CODE'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-cell">
                                                    <span>{agent.user?.email}</span>
                                                    <small>{agent.user?.phone}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="network-cell">
                                                    <span className="level-badge">L{agent.level || 1}</span>
                                                    <small>Parent: {agent.parentAgent?.agentCode || 'Direct'}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="status-cell">
                                                    <span className={`badge ${getStatusBadgeClass(agent.status)}`}>
                                                        {agent.status}
                                                    </span>
                                                    <span className={`kyc-dot ${agent.kycStatus === 'verified' ? 'verified' : 'pending'}`} title={`KYC: ${agent.kycStatus}`}></span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="perf-cell">
                                                    <span>{policyStats.approvedPolicies || 0} Policies</span>
                                                    <small>{formatCurrency(policyStats.totalPremium)} Rev.</small>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="earnings-cell">
                                                    <strong>{formatCurrency(agent.totalEarnings)}</strong>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="action-btns-modern">
                                                    <Link to={`/agents/details/${agentId}`} className="action-btn-mini info" title="View Details">
                                                        <Eye size={18} />
                                                    </Link>
                                                    {(agent.status !== 'rejected' && agent.status !== 'blocked') && (
                                                        <button onClick={() => handleReject(agentId, agent.user?.fullName)} className="action-btn-mini danger" title="Block Agent">
                                                            <Ban size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllAgents;
