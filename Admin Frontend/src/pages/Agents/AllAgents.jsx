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

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        filterAgents();
    }, [searchTerm, statusFilter, levelFilter, agents]);

    const loadAgents = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllAgents();
            if (response.success) {
                setAgents(response.data.agents || []);
            }
        } catch (error) {
            console.error('Error loading agents:', error);
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
                (agent.user?.email || '').toLowerCase().includes(lowerSearch)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            const filterVal = statusFilter.toUpperCase();
            filtered = filtered.filter(agent => (agent.status || 'PENDING').toUpperCase() === filterVal);
        }

        // Level filter
        if (levelFilter !== 'all') {
            filtered = filtered.filter(agent => agent.level === parseInt(levelFilter));
        }

        setFilteredAgents(filtered);
    };

    const handleReject = async (agentId, agentName) => {
        if (window.confirm(`Are you sure you want to block/reject agent: ${agentName}?`)) {
            try {
                const result = await adminAPI.rejectAgent(agentId);
                if (result.success) {
                    alert('Agent blocked successfully');
                    loadAgents();
                } else {
                    alert(result.message || 'Failed to block agent');
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred');
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'APPROVED': case 'ACTIVE': return 'badge-success';
            case 'PENDING': return 'badge-warning';
            case 'INACTIVE': return 'badge-secondary';
            case 'REJECTED': case 'BLOCKED': return 'badge-error';
            default: return 'badge-secondary';
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Agents...</div>;

    return (
        <div className="all-agents-page">
            <div className="page-header">
                <div>
                    <h1>👥 Agent Management</h1>
                    <p>Manage all agents and their hierarchy</p>
                </div>
                {/* 
                // Disabled Adding Agents manually as Admin for now, relying on public registration + approval
                <Link to="/agents/add" className="btn btn-primary">
                    ➕ Add New Agent
                </Link> 
                */}
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
                        <option value="rejected">Blocked/Rejected</option>
                    </select>

                    <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                        <option value="all">All Levels</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-box">
                    <span className="stat-label">Total Agents</span>
                    <span className="stat-value">{agents.length}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Active</span>
                    <span className="stat-value">{agents.filter(a => (a.status || '').toUpperCase() === 'APPROVED' || (a.status || '').toUpperCase() === 'ACTIVE').length}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{agents.filter(a => (a.status || '').toUpperCase() === 'PENDING').length}</span>
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
                            <th>Level</th>
                            <th>Status</th>
                            <th>Policies</th>
                            <th>Earnings</th>
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
                            filteredAgents.map(agent => (
                                <tr key={agent.id}>
                                    <td>
                                        <strong>{agent.agentCode || agent.code || 'N/A'}</strong>
                                    </td>
                                    <td>{agent.user?.fullName}</td>
                                    <td>{agent.user?.email}</td>
                                    <td>{agent.user?.phone}</td>
                                    <td>
                                        <span className="level-badge">L{agent.level || 1}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(agent.status)}`}>
                                            {agent.status === 'APPROVED' ? 'ACTIVE' : agent.status}
                                        </span>
                                    </td>
                                    <td>{agent.policiesSold || agent.totalPolicies || 0}</td>
                                    <td>₹{(agent.totalEarnings || 0).toLocaleString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link
                                                to={`/agents/details/${agent.id}`}
                                                className="btn-icon"
                                                title="View Details"
                                            >
                                                👁️
                                            </Link>
                                            {/* Removed Edit/Delete, kept Block if needed */}
                                            {agent.status !== 'REJECTED' && agent.status !== 'BLOCKED' && (
                                                <button
                                                    onClick={() => handleReject(agent.id, agent.fullName || agent.name)}
                                                    className="btn-icon btn-danger"
                                                    title="Block Agent"
                                                >
                                                    🚫
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllAgents;
