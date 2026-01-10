import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllAgents, deleteAgent, getAgentStats } from '../../utils/agentUtils';
import './AllAgents.css';

const AllAgents = () => {
    const [agents, setAgents] = useState([]);
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        filterAgents();
    }, [searchTerm, statusFilter, levelFilter, agents]);

    const loadAgents = () => {
        const allAgents = getAllAgents();
        setAgents(allAgents);
    };

    const filterAgents = () => {
        let filtered = [...agents];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(agent =>
                agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(agent => agent.status === statusFilter);
        }

        // Level filter
        if (levelFilter !== 'all') {
            filtered = filtered.filter(agent => agent.level === parseInt(levelFilter));
        }

        setFilteredAgents(filtered);
    };

    const handleDelete = (agentId, agentName) => {
        if (window.confirm(`Are you sure you want to delete agent: ${agentName}?`)) {
            const result = deleteAgent(agentId);
            if (result.success) {
                alert('Agent deleted successfully');
                loadAgents();
            } else {
                alert(result.message);
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'inactive': return 'badge-secondary';
            case 'blocked': return 'badge-error';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="all-agents-page">
            <div className="page-header">
                <div>
                    <h1>👥 Agent Management</h1>
                    <p>Manage all agents and their hierarchy</p>
                </div>
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
                        <option value="blocked">Blocked</option>
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
                    <span className="stat-value">{agents.length}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Active</span>
                    <span className="stat-value">{agents.filter(a => a.status === 'active').length}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{agents.filter(a => a.status === 'pending').length}</span>
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
                            filteredAgents.map(agent => {
                                const stats = getAgentStats(agent.id);
                                return (
                                    <tr key={agent.id}>
                                        <td>
                                            <strong>{agent.code}</strong>
                                        </td>
                                        <td>{agent.name}</td>
                                        <td>{agent.email}</td>
                                        <td>{agent.phone}</td>
                                        <td>
                                            <span className="level-badge">L{agent.level}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(agent.status)}`}>
                                                {agent.status}
                                            </span>
                                        </td>
                                        <td>{stats.totalPolicies}</td>
                                        <td>₹{stats.totalEarnings.toLocaleString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/agents/details/${agent.id}`}
                                                    className="btn-icon"
                                                    title="View Details"
                                                >
                                                    👁️
                                                </Link>
                                                <Link
                                                    to={`/agents/edit/${agent.id}`}
                                                    className="btn-icon"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(agent.id, agent.name)}
                                                    className="btn-icon btn-danger"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
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
