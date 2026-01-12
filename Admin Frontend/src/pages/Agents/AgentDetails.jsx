import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import './AgentDetails.css';

const AgentDetails = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [stats, setStats] = useState(null);
    const [subAgents, setSubAgents] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch all agents and policies to filter (Simulating getById/search)
            const [agentsRes, policiesRes] = await Promise.all([
                adminAPI.getAllAgents(),
                adminAPI.getAllPolicies()
            ]);

            if (agentsRes.success) {
                const agentsList = agentsRes.data.agents || [];
                // Find current agent
                // Note: id from params is string, agent.id might be number. Loose comparison or toString()
                const foundAgent = agentsList.find(a => String(a.id) === String(id));

                if (foundAgent) {
                    setAgent(foundAgent);

                    // Find sub-agents
                    // Assuming agent.code is used for hierarchy or parentId
                    // If we have parentId in response:
                    const subs = agentsList.filter(a => String(a.parentAgentId) === String(foundAgent.id));
                    setSubAgents(subs);

                    // Stats derived from found agent if available, else calc
                    setStats({
                        totalPolicies: foundAgent.policiesSold || foundAgent.totalPolicies || 0,
                        activePolicies: 0, // Not always available in list
                        totalEarnings: foundAgent.totalEarnings || 0
                    });
                }
            }

            if (policiesRes.success) {
                const allPolicies = policiesRes.data.policies || [];
                // Filter policies by agentId or agentCode
                if (agent) { // This might be stale due to closure if not careful, but we are in async flow
                    // We need the ID from the found agent above.
                }
                // Let's filter here using the found agent ID from the list logic above
                // To do this properly, we should assume we have the agent ID.
                const ps = allPolicies.filter(p => String(p.agentId) === String(id));
                setPolicies(ps);
            }

        } catch (error) {
            console.error('Error loading agent details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Details...</div>;
    if (!agent) return <div className="error-message">Agent not found</div>;

    return (
        <div className="agent-details-page">
            <div className="page-header">
                <div>
                    <h1>👤 Agent Details</h1>
                    <p>{agent.agentCode || agent.code} - {agent.user?.fullName}</p>
                </div>
                <Link to={`/agents/edit/${agent.id}`} className="btn btn-primary">
                    ✏️ Edit Agent
                </Link>
            </div>

            {/* Basic Info */}
            <div className="details-grid">
                <div className="detail-card">
                    <h3>Basic Information</h3>
                    <div className="detail-row">
                        <span className="label">Agent Code:</span>
                        <span className="value">{agent.agentCode || agent.code}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Name:</span>
                        <span className="value">{agent.user?.fullName}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">{agent.user?.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Phone:</span>
                        <span className="value">{agent.user?.phone}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">City:</span>
                        <span className="value">{agent.user?.city || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Status:</span>
                        <span className={`badge badge-${(agent.status || '').toLowerCase()}`}>{agent.status}</span>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Agent Statistics</h3>
                    <div className="stat-item">
                        <span className="stat-label">Level</span>
                        <span className="stat-value">{agent.level || 1}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Policies</span>
                        <span className="stat-value">{stats?.totalPolicies || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Earnings</span>
                        <span className="stat-value">₹{(stats?.totalEarnings || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Sub-Agents */}
            {subAgents.length > 0 && (
                <div className="detail-card">
                    <h3>Sub-Agents ({subAgents.length})</h3>
                    <div className="sub-agents-grid">
                        {subAgents.map(sub => (
                            <Link
                                key={sub.id}
                                to={`/agents/details/${sub.id}`}
                                className="sub-agent-card"
                            >
                                <div className="sub-agent-code">{sub.agentCode || sub.code}</div>
                                <div className="sub-agent-name">{sub.user?.fullName}</div>
                                <div className="sub-agent-status">{sub.status}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Policies */}
            <div className="detail-card">
                <h3>Recent Policies ({policies.length})</h3>
                {policies.length === 0 ? (
                    <p className="empty-state">No policies found associated with this agent.</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Policy #</th>
                                    <th>Customer</th>
                                    <th>Premium</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.slice(0, 10).map(policy => (
                                    <tr key={policy.id}>
                                        <td>{policy.policyNumber}</td>
                                        <td>{policy.customer?.fullName || policy.ownerName}</td>
                                        <td>₹{parseInt(policy.premium || 0).toLocaleString()}</td>
                                        <td><span className={`badge badge-${(policy.status || '').toLowerCase()}`}>{policy.status}</span></td>
                                        <td>{new Date(policy.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDetails;
