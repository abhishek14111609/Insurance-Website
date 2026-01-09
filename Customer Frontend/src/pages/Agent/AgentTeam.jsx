import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HierarchyTree from '../../components/HierarchyTree';
import {
    initializeMockAgentData,
    getAgentHierarchy,
    generateAgentCode,
    getNextSequence,
    getCommissionRate
} from '../../utils/agentUtils';
import './AgentDashboard.css';

const AgentTeam = () => {
    const navigate = useNavigate();
    const [currentAgent] = useState({
        id: 'agent-1',
        code: 'AG001',
        name: 'Rajesh Kumar',
        level: 1
    });

    const [teamMembers, setTeamMembers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAgentData, setNewAgentData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        initializeMockAgentData();
        loadTeamData();
    }, []);

    const loadTeamData = () => {
        const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        setTeamMembers(allAgents);
    };

    const handleAddAgent = (e) => {
        e.preventDefault();

        // Generate new agent code
        const sequence = getNextSequence(currentAgent.code);
        const newCode = generateAgentCode(currentAgent.code, sequence);
        const newLevel = currentAgent.level + 1;

        if (newLevel > 3) {
            alert('Maximum hierarchy depth (3 levels) reached!');
            return;
        }

        const newAgent = {
            id: `agent-${Date.now()}`,
            code: newCode,
            name: newAgentData.name,
            email: newAgentData.email,
            phone: newAgentData.phone,
            parentId: currentAgent.id,
            level: newLevel,
            commissionRate: getCommissionRate(newLevel),
            walletBalance: 0,
            totalEarnings: 0,
            customersCount: 0,
            policiesSold: 0,
            joinedDate: new Date().toISOString()
        };

        // Save to localStorage
        const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        allAgents.push(newAgent);
        localStorage.setItem('agent_hierarchy', JSON.stringify(allAgents));

        setTeamMembers(allAgents);
        setShowAddModal(false);
        setNewAgentData({ name: '', email: '', phone: '' });

        alert(`New agent added successfully!\nAgent Code: ${newCode}\nCommission Rate: ${getCommissionRate(newLevel)}%`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAgentData({ ...newAgentData, [name]: value });
    };

    const teamStats = {
        totalMembers: getAgentHierarchy(currentAgent.id).length,
        directReports: teamMembers.filter(a => a.parentId === currentAgent.id).length,
        totalCustomers: getAgentHierarchy(currentAgent.id).reduce((sum, a) => sum + (a.customersCount || 0), 0),
        totalPolicies: getAgentHierarchy(currentAgent.id).reduce((sum, a) => sum + (a.policiesSold || 0), 0)
    };

    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>My Team</h1>
                    <p>Manage your agent network and build your team</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Sub-Agent
                </button>
            </div>

            {/* Team Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Team Members</div>
                        <div className="stat-value">{teamStats.totalMembers}</div>
                        <div className="stat-change">Across all levels</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Direct Reports</div>
                        <div className="stat-value">{teamStats.directReports}</div>
                        <div className="stat-change">Level 2 agents</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Team Customers</div>
                        <div className="stat-value">{teamStats.totalCustomers}</div>
                        <div className="stat-change">Total acquired</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Team Policies</div>
                        <div className="stat-value">{teamStats.totalPolicies}</div>
                        <div className="stat-change">Total sold</div>
                    </div>
                </div>
            </div>

            {/* Agent Code Display */}
            <div className="agent-code-display-card">
                <div className="code-header">
                    <div>
                        <h3>Your Agent Code</h3>
                        <p>Share this code with new agents to add them to your team</p>
                    </div>
                </div>
                <div className="code-value">
                    <span className="code-text">{currentAgent.code}</span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            navigator.clipboard.writeText(currentAgent.code);
                            alert('Agent code copied to clipboard!');
                        }}
                    >
                        📋 Copy Code
                    </button>
                </div>
            </div>

            {/* Hierarchy Tree */}
            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Team Hierarchy</h2>
                <HierarchyTree
                    agents={teamMembers}
                    currentAgentId={currentAgent.id}
                    onAgentClick={(agent) => {/* Agent details can be shown in a modal */ }}
                />
            </div>

            {/* Team Table */}
            <div className="table-container" style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Team Members</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Agent Code</th>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Customers</th>
                            <th>Policies</th>
                            <th>Earnings</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getAgentHierarchy(currentAgent.id).map(agent => (
                            <tr key={agent.id}>
                                <td>
                                    <span className="font-medium" style={{ color: 'var(--primary-color)' }}>
                                        {agent.code}
                                    </span>
                                </td>
                                <td>{agent.name}</td>
                                <td>
                                    <span className={`level-badge level-${agent.level}`}>
                                        Level {agent.level}
                                    </span>
                                </td>
                                <td>{agent.customersCount || 0}</td>
                                <td>{agent.policiesSold || 0}</td>
                                <td className="text-success" style={{ fontWeight: 700 }}>
                                    ₹{(agent.totalEarnings || 0).toLocaleString('en-IN')}
                                </td>
                                <td>{new Date(agent.joinedDate).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {getAgentHierarchy(currentAgent.id).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                        <p>No team members yet. Add your first sub-agent to start building your team!</p>
                    </div>
                )}
            </div>

            {/* Add Agent Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-scale-in">
                        <div className="modal-header">
                            <h2>Add New Sub-Agent</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddAgent}>
                            <div className="modal-body">
                                <div className="info-box" style={{
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    border: '2px solid #3b82f6'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600 }}>New Agent Code:</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                                            {generateAgentCode(currentAgent.code, getNextSequence(currentAgent.code))}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600 }}>Level:</span>
                                        <span style={{ fontWeight: 800 }}>Level {currentAgent.level + 1}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 600 }}>Commission Rate:</span>
                                        <span style={{ fontWeight: 800, color: '#10b981' }}>
                                            {getCommissionRate(currentAgent.level + 1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newAgentData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter agent's full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newAgentData.email}
                                        onChange={handleInputChange}
                                        placeholder="agent@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newAgentData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Agent
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentTeam;
