import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgentById, getAgentChildren, getAgentHierarchy, getAgentStats } from '../../utils/agentUtils';
import { getPoliciesByAgent } from '../../utils/policyUtils';
import { getCommissionsByAgent } from '../../utils/commissionUtils';
import './AgentDetails.css';

const AgentDetails = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [stats, setStats] = useState(null);
    const [hierarchy, setHierarchy] = useState([]);
    const [subAgents, setSubAgents] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [commissions, setCommissions] = useState([]);

    useEffect(() => {
        loadAgentData();
    }, [id]);

    const loadAgentData = () => {
        const agentData = getAgentById(id);
        if (agentData) {
            setAgent(agentData);
            setStats(getAgentStats(id));
            setHierarchy(getAgentHierarchy(id));
            setSubAgents(getAgentChildren(id));
            setPolicies(getPoliciesByAgent(id));
            setCommissions(getCommissionsByAgent(id));
        }
    };

    if (!agent) return <div className="loading">Loading...</div>;

    return (
        <div className="agent-details-page">
            <div className="page-header">
                <div>
                    <h1>👤 Agent Details</h1>
                    <p>{agent.code} - {agent.name}</p>
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
                        <span className="value">{agent.code}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Name:</span>
                        <span className="value">{agent.name}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">{agent.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Phone:</span>
                        <span className="value">{agent.phone}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">City:</span>
                        <span className="value">{agent.city}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">State:</span>
                        <span className="value">{agent.state}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Status:</span>
                        <span className={`badge badge-${agent.status}`}>{agent.status}</span>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Agent Statistics</h3>
                    <div className="stat-item">
                        <span className="stat-label">Level</span>
                        <span className="stat-value">{agent.level}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Policies</span>
                        <span className="stat-value">{stats?.totalPolicies || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Active Policies</span>
                        <span className="stat-value">{stats?.activePolicies || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Earnings</span>
                        <span className="stat-value">₹{stats?.totalEarnings?.toLocaleString() || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Wallet Balance</span>
                        <span className="stat-value">₹{agent.wallet?.balance?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            {/* Hierarchy */}
            <div className="detail-card">
                <h3>Agent Hierarchy</h3>
                <div className="hierarchy-path">
                    {hierarchy.map((h, index) => (
                        <span key={h.id}>
                            {index > 0 && <span className="separator">→</span>}
                            <Link to={`/agents/details/${h.id}`} className="hierarchy-link">
                                {h.code}
                            </Link>
                        </span>
                    ))}
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
                                <div className="sub-agent-code">{sub.code}</div>
                                <div className="sub-agent-name">{sub.name}</div>
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
                    <p className="empty-state">No policies found</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Policy Number</th>
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
                                        <td>{policy.customerName || policy.ownerName}</td>
                                        <td>₹{policy.premium?.toLocaleString()}</td>
                                        <td><span className={`badge badge-${policy.status.toLowerCase()}`}>{policy.status}</span></td>
                                        <td>{new Date(policy.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Commissions */}
            <div className="detail-card">
                <h3>Commission Records ({commissions.length})</h3>
                {commissions.length === 0 ? (
                    <p className="empty-state">No commissions found</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Policy Number</th>
                                    <th>Amount</th>
                                    <th>Level</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.slice(0, 10).map(commission => (
                                    <tr key={commission.id}>
                                        <td>{commission.policyNumber}</td>
                                        <td>₹{commission.amount?.toLocaleString()}</td>
                                        <td>Level {commission.level}</td>
                                        <td><span className={`badge badge-${commission.status}`}>{commission.status}</span></td>
                                        <td>{new Date(commission.createdAt).toLocaleDateString()}</td>
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
