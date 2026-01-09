import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentAncestors, formatCurrency, initializeMockAgentData } from '../../utils/agentUtils';
import './AgentDashboard.css';

const AgentProfile = () => {
    const navigate = useNavigate();
    const [agentData, setAgentData] = useState(null);
    const [ancestors, setAncestors] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        phone: '',
        city: ''
    });

    useEffect(() => {
        initializeMockAgentData();

        // Load current agent data
        const currentAgent = JSON.parse(localStorage.getItem('current_agent') || '{}');
        const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        const fullAgentData = allAgents.find(a => a.id === currentAgent.id) || {
            id: 'agent-1',
            code: 'AG001',
            name: 'Rajesh Kumar',
            email: 'agent@securelife.com',
            phone: '9876543210',
            city: 'Mumbai',
            level: 1,
            commissionRate: 15,
            walletBalance: 24500,
            totalEarnings: 125000,
            customersCount: 15,
            policiesSold: 18,
            joinedDate: '2023-01-15',
            parentId: null
        };

        setAgentData(fullAgentData);
        setEditData({
            name: fullAgentData.name,
            email: fullAgentData.email,
            phone: fullAgentData.phone,
            city: fullAgentData.city
        });

        // Get ancestors
        if (fullAgentData.parentId) {
            const ancestorList = getAgentAncestors(fullAgentData.id);
            setAncestors(ancestorList);
        }
    }, []);

    const handleSave = () => {
        // Update agent data
        const updatedAgent = { ...agentData, ...editData };
        setAgentData(updatedAgent);

        // Update in localStorage
        const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        const index = allAgents.findIndex(a => a.id === agentData.id);
        if (index !== -1) {
            allAgents[index] = updatedAgent;
            localStorage.setItem('agent_hierarchy', JSON.stringify(allAgents));
        }

        // Update current agent
        localStorage.setItem('current_agent', JSON.stringify(updatedAgent));

        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    if (!agentData) {
        return <div className="agent-page-container">Loading...</div>;
    }

    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your agent profile and credentials</p>
                </div>
                <button
                    className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                >
                    {isEditing ? 'Cancel' : '✏️ Edit Profile'}
                </button>
            </div>

            {/* Agent Code Card */}
            <div className="agent-code-display-card" style={{ marginBottom: '2rem' }}>
                <div className="code-header">
                    <div>
                        <h3>Your Agent Code</h3>
                        <p>Share this code with customers and new agents</p>
                    </div>
                </div>
                <div className="code-value">
                    <span className="code-text">{agentData.code}</span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            navigator.clipboard.writeText(agentData.code);
                            alert('Agent code copied to clipboard!');
                        }}
                    >
                        📋 Copy Code
                    </button>
                </div>
            </div>

            {/* Profile Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Agent Level</div>
                        <div className="stat-value">
                            <span className={`level-badge level-${agentData.level}`}>
                                Level {agentData.level}
                            </span>
                        </div>
                        <div className="stat-change">Commission: {agentData.commissionRate}%</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Earnings</div>
                        <div className="stat-value text-success">{formatCurrency(agentData.totalEarnings)}</div>
                        <div className="stat-change">Lifetime</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Policies Sold</div>
                        <div className="stat-value">{agentData.policiesSold}</div>
                        <div className="stat-change">{agentData.customersCount} customers</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: 'white' }}>
                    <div className="stat-content">
                        <div className="stat-title">Member Since</div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                            {new Date(agentData.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="stat-change">
                            {Math.floor((new Date() - new Date(agentData.joinedDate)) / (1000 * 60 * 60 * 24))} days
                        </div>
                    </div>
                </div>
            </div>

            {/* Hierarchy Info */}
            {ancestors.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '2px solid #c7d2fe'
                }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
                        Reporting Hierarchy
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {ancestors.reverse().map((ancestor, index) => (
                            <React.Fragment key={ancestor.id}>
                                <div style={{
                                    background: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '2px solid #3b82f6'
                                }}>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                                        {ancestor.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {ancestor.code}
                                    </div>
                                </div>
                                {index < ancestors.length - 1 && (
                                    <span style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>→</span>
                                )}
                            </React.Fragment>
                        ))}
                        <span style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>→</span>
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: 'white'
                        }}>
                            <div style={{ fontWeight: 700 }}>You ({agentData.name})</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{agentData.code}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Details */}
            <div className="table-container">
                <div className="table-header">
                    <h2>Personal Information</h2>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontWeight: 500 }}>
                                    {agentData.name}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontWeight: 500 }}>
                                    {agentData.email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontWeight: 500 }}>
                                    {agentData.phone}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>City</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.city}
                                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontWeight: 500 }}>
                                    {agentData.city}
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentProfile;
