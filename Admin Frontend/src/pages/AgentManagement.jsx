import { useState, useEffect } from 'react';
import '../App.css';

const AgentManagement = () => {
    const [agents, setAgents] = useState([]);
    const [filter, setFilter] = useState('all'); // all, level1, level2, level3, pending

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = () => {
        const savedAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        setAgents(savedAgents);
    };

    const handleApproveAgent = (agentId) => {
        const updated = agents.map(agent =>
            agent.id === agentId
                ? { ...agent, status: 'active' }
                : agent
        );
        setAgents(updated);
        localStorage.setItem('agent_hierarchy', JSON.stringify(updated));
        alert('Agent approved successfully!');
    };

    const handleRejectAgent = (agentId) => {
        if (!confirm('Are you sure you want to reject this agent?')) return;

        const updated = agents.filter(agent => agent.id !== agentId);
        setAgents(updated);
        localStorage.setItem('agent_hierarchy', JSON.stringify(updated));
        alert('Agent rejected and removed!');
    };

    const filteredAgents = agents.filter(agent => {
        if (filter === 'all') return true;
        if (filter === 'pending') return agent.status === 'pending';
        if (filter === 'level1') return agent.level === 1;
        if (filter === 'level2') return agent.level === 2;
        if (filter === 'level3') return agent.level === 3;
        return true;
    });

    const stats = {
        total: agents.length,
        level1: agents.filter(a => a.level === 1).length,
        level2: agents.filter(a => a.level === 2).length,
        level3: agents.filter(a => a.level === 3).length,
        pending: agents.filter(a => a.status === 'pending').length,
        totalEarnings: agents.reduce((sum, a) => sum + (a.totalEarnings || 0), 0)
    };

    const buildHierarchyTree = (parentId = null, depth = 0) => {
        return agents
            .filter(agent => agent.parentId === parentId)
            .map(agent => ({
                ...agent,
                depth,
                children: buildHierarchyTree(agent.id, depth + 1)
            }));
    };

    const renderTreeNode = (node) => {
        return (
            <div key={node.id} style={{ marginLeft: `${node.depth * 2}rem`, marginBottom: '0.5rem' }}>
                <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `2px solid ${node.level === 1 ? '#3b82f6' : node.level === 2 ? '#10b981' : '#f59e0b'}`,
                    marginBottom: '0.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{node.name}</strong> ({node.code})
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {node.email} | Level {node.level} | {node.commissionRate}% commission
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={`badge badge-${node.status === 'active' ? 'success' : 'warning'}`}>
                                {node.status || 'active'}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                {node.policiesSold || 0} policies | ₹{(node.totalEarnings || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
                {node.children && node.children.map(child => renderTreeNode(child))}
            </div>
        );
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Agent Management</h1>
                <p>Manage agent network and hierarchy</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Agents</h3>
                    <div className="value">{stats.total}</div>
                </div>
                <div className="stat-card">
                    <h3>Level 1 Agents</h3>
                    <div className="value" style={{ color: '#3b82f6' }}>{stats.level1}</div>
                </div>
                <div className="stat-card">
                    <h3>Level 2 Agents</h3>
                    <div className="value" style={{ color: '#10b981' }}>{stats.level2}</div>
                </div>
                <div className="stat-card">
                    <h3>Level 3 Agents</h3>
                    <div className="value" style={{ color: '#f59e0b' }}>{stats.level3}</div>
                </div>
                <div className="stat-card">
                    <h3>Pending Approval</h3>
                    <div className="value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Earnings</h3>
                    <div className="value" style={{ color: '#10b981' }}>
                        ₹{stats.totalEarnings.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>

            {/* Agent List */}
            <div className="admin-card">
                <div className="card-header">
                    <h2>All Agents</h2>
                </div>

                <div className="filter-bar">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'level1' ? 'active' : ''}`}
                        onClick={() => setFilter('level1')}
                    >
                        Level 1 ({stats.level1})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'level2' ? 'active' : ''}`}
                        onClick={() => setFilter('level2')}
                    >
                        Level 2 ({stats.level2})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'level3' ? 'active' : ''}`}
                        onClick={() => setFilter('level3')}
                    >
                        Level 3 ({stats.level3})
                    </button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Agent Code</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Level</th>
                            <th>Commission</th>
                            <th>Policies</th>
                            <th>Earnings</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgents.map(agent => (
                            <tr key={agent.id}>
                                <td style={{ fontWeight: 700, color: '#3b82f6' }}>{agent.code}</td>
                                <td>{agent.name}</td>
                                <td>{agent.email}</td>
                                <td>
                                    <span className={`badge badge-${agent.level === 1 ? 'success' : agent.level === 2 ? 'warning' : 'error'}`}>
                                        Level {agent.level}
                                    </span>
                                </td>
                                <td>{agent.commissionRate}%</td>
                                <td>{agent.policiesSold || 0}</td>
                                <td style={{ fontWeight: 700, color: '#10b981' }}>
                                    ₹{(agent.totalEarnings || 0).toLocaleString('en-IN')}
                                </td>
                                <td>
                                    <span className={`badge badge-${agent.status === 'active' ? 'success' : 'warning'}`}>
                                        {agent.status || 'active'}
                                    </span>
                                </td>
                                <td>
                                    {agent.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleApproveAgent(agent.id)}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRejectAgent(agent.id)}
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Hierarchy Tree */}
            <div className="admin-card">
                <div className="card-header">
                    <h2>Agent Hierarchy Tree</h2>
                </div>
                <div>
                    {buildHierarchyTree().map(node => renderTreeNode(node))}
                </div>
            </div>
        </div>
    );
};

export default AgentManagement;
