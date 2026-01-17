import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import './AllAgents.css';

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

        // Search filter
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

        // Status filter
        if (statusFilter !== 'all') {
            const filterVal = statusFilter.toLowerCase();
            filtered = filtered.filter(agent => (agent.status || 'pending').toLowerCase() === filterVal);
        }

        // Level filter
        if (levelFilter !== 'all') {
            filtered = filtered.filter(agent => agent.level === parseInt(levelFilter));
        }

        setFilteredAgents(filtered);
    };

    const handleReject = async (agentId, agentName) => {
        const reason = window.prompt(`Are you sure you want to block/reject agent: ${agentName}?\nPlease provide a reason:`);

        if (reason === null) return; // User cancelled

        if (!reason.trim()) {
            alert('A reason is required to block an agent.');
            return;
        }

        try {
            const result = await adminAPI.rejectAgent(agentId, reason);
            if (result.success) {
                alert('Agent blocked successfully');
                loadAgents();
            } else {
                alert(result.message || 'Failed to block agent');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred: ' + err.message);
        }
    };

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'approved':
            case 'active':
                return 'badge-success';
            case 'pending':
                return 'badge-warning';
            case 'inactive':
                return 'badge-secondary';
            case 'rejected':
            case 'blocked':
                return 'badge-error';
            default:
                return 'badge-secondary';
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

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Agents...</div>;

    if (error) return (
        <div className="error-state">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadAgents}>Retry</button>
        </div>
    );

    return (
        <div className="all-agents-page">
            <div className="page-header">
                <div>
                    <h1>👥 Agent Management</h1>
                    <p>Manage all agents and their hierarchy</p>
                </div>

                {/* // Disabled Adding Agents manually as Admin for now, relying on public registration + approval */}
                <Link to="/agents/add" className="btn btn-primary">
                    ➕ Add New Agent
                </Link>

            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, code, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                        <option value="rejected">Rejected/Blocked</option>
                    </select>

                    <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                        <option value="all">All Levels</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <span className="stat-label">Total Agents</span>
                    <span className="stat-value">{statusCounts.total}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Active</span>
                    <span className="stat-value">{statusCounts.active}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{statusCounts.pending}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">KYC Pending</span>
                    <span className="stat-value">{statusCounts.kycPending}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Filtered Results</span>
                    <span className="stat-value">{filteredAgents.length}</span>
                </div>
            </div>

            {/* Agents Table */}
            <div className="table-container">
                <table className="agents-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Parent</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>KYC</th>
                            <th>Policies</th>
                            <th>Premium</th>
                            <th>Earnings</th>
                            <th>Pending Comm.</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgents.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="empty-state">
                                    No agents found
                                </td>
                            </tr>
                        ) : (
                            filteredAgents.map(agent => {
                                const agentId = agent._id || agent.id;
                                const policyStats = agent.policyStats || {};
                                const commissionStats = agent.commissionStats || {};
                                return (
                                    <tr key={agentId || agent.agentCode || agent.user?.email || Math.random()}>
                                        <td>
                                            <strong>{agent.agentCode || agent.code || 'N/A'}</strong>
                                        </td>
                                        <td>{agent.user?.fullName}</td>
                                        <td>{agent.user?.email}</td>
                                        <td>{agent.user?.phone}</td>
                                        <td>{agent.parentAgent?.agentCode || '—'}</td>
                                        <td>
                                            <span className="level-badge">L{agent.level || 1}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(agent.status)}`}>
                                                {(agent.status || 'pending').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge kyc-${agent.kycStatus || 'not_submitted'}`}>
                                                {(agent.kycStatus || 'not_submitted').replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {policyStats.approvedPolicies || 0} / {policyStats.totalPolicies || 0}
                                        </td>
                                        <td>{formatCurrency(policyStats.totalPremium)}</td>
                                        <td>{formatCurrency(agent.totalEarnings)}</td>
                                        <td>{formatCurrency(commissionStats.pendingCommissions)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {agentId && (
                                                    <Link
                                                        to={`/agents/details/${agentId}`}
                                                        className="btn-icon"
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </Link>
                                                )}
                                                {/* Removed Edit/Delete, kept Block if needed */}
                                                {(agent.status || '').toLowerCase() !== 'rejected' && (agent.status || '').toLowerCase() !== 'blocked' && (
                                                    <button
                                                        onClick={() => handleReject(agentId, agent.user?.fullName || 'Agent')}
                                                        className="btn-icon btn-danger"
                                                        title="Block Agent"
                                                        disabled={!agentId}
                                                    >
                                                        🚫
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
    );
};

export default AllAgents;
