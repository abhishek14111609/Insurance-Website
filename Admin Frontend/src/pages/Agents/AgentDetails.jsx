import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI, BASE_URL } from '../../services/api.service';
import './AgentDetails.css';

const AgentDetails = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [stats, setStats] = useState(null);
    const [subAgents, setSubAgents] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    const normalizeFileUrl = (value) => {
        if (!value) return null;
        if (value.startsWith('http') || value.startsWith('data:')) return value;
        let clean = value.trim();
        if (clean.startsWith('/')) clean = clean.slice(1);
        if (!clean.toLowerCase().startsWith('uploads/')) {
            clean = `uploads/${clean}`;
        }
        return `${BASE_URL}/${clean}`;
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleVerifyKYC = async (status) => {
        let reason = '';
        if (status === 'rejected') {
            reason = prompt('Please enter the reason for rejection:');
            if (reason === null) return; // Cancelled
            if (!reason.trim()) {
                alert('Rejection reason is required');
                return;
            }
        }

        const agentId = agent?._id || agent?.id;
        if (!agentId) {
            alert('Missing agent identifier. Please reload and try again.');
            return;
        }

        try {
            setLoading(true);
            const response = await adminAPI.verifyAgentKYC(agentId, status, reason);
            if (response.success) {
                alert(`KYC ${status === 'verified' ? 'Approved' : 'Rejected'} successfully`);
                loadData();
            } else {
                alert(response.message || 'Failed to update KYC status');
            }
        } catch (error) {
            console.error('Error verifying KYC:', error);
            alert('Error updating status');
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAgentById(id);

            if (response.success) {
                const agentData = response.data.agent;
                setAgent(agentData);
                setSubAgents(agentData.subAgents || []);
                setPolicies(agentData.policies || []);

                setStats({
                    totalPolicies: agentData.policiesSold || agentData.totalPolicies || agentData.policies?.length || 0,
                    activePolicies: (agentData.policies || []).filter(p => p.status === 'APPROVED').length,
                    totalEarnings: agentData.totalEarnings || 0
                });
            } else {
                console.error('Failed to load agent:', response.message);
            }
        } catch (error) {
            console.error('Error loading agent details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Details...</div>;
    if (!agent) return <div className="error-message">Agent not found</div>;

    const agentId = agent._id || agent.id;

    return (
        <div className="agent-details-page">
            <div className="page-header">
                <div>
                    <h1>👤 Agent Details</h1>
                    <p>{agent.agentCode || agent.code} - {agent.user?.fullName}</p>
                </div>
                {agentId && (
                    <Link to={`/agents/edit/${agentId}`} className="btn btn-primary">
                        ✏️ Edit Agent
                    </Link>
                )}
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

            {/* KYC Information */}
            <div className="detail-card kyc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>KYC Information</h3>
                    {agent.kycStatus === 'pending' && (
                        <div className="kyc-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleVerifyKYC('verified')}
                                style={{ background: '#10b981', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                ✅ Approve
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleVerifyKYC('rejected')}
                                style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                ❌ Reject
                            </button>
                        </div>
                    )}
                </div>

                <div className="detail-row">
                    <span className="label">KYC Status:</span>
                    <span className={`badge status-badge ${agent.kycStatus || 'not_submitted'}`}>
                        {(agent.kycStatus || 'NOT SUBMITTED').replace('_', ' ').toUpperCase()}
                    </span>
                </div>
                {agent.kycStatus === 'rejected' && (
                    <div className="detail-row rejection-reason">
                        <span className="label">Rejection Reason:</span>
                        <span className="value text-error">{agent.kycRejectionReason}</span>
                    </div>
                )}

                <div className="kyc-documents-grid">
                    <div className="kyc-doc-item">
                        <span className="doc-label">PAN Card:</span>
                        <div className="doc-value">
                            {agent.panNumber ? <strong>{agent.panNumber}</strong> : <span className="text-muted">Not provided</span>}
                            {agent.panPhoto && (
                                <div className="doc-preview-container">
                                    <img
                                        src={normalizeFileUrl(agent.panPhoto)}
                                        alt="PAN Card"
                                        className="clickable-photo"
                                        title="Click to view full size"
                                        onClick={() => window.open(normalizeFileUrl(agent.panPhoto), '_blank')}
                                    />
                                    <span className="preview-hint">Click to enlarge</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="kyc-doc-item">
                        <span className="doc-label">Aadhaar Card:</span>
                        <div className="doc-value">
                            {agent.aadharNumber ? <strong>{agent.aadharNumber}</strong> : <span className="text-muted">Not provided</span>}
                            <div className="doc-previews-list">
                                {agent.aadharPhotoFront && (
                                    <div className="doc-preview-container">
                                        <img
                                            src={normalizeFileUrl(agent.aadharPhotoFront)}
                                            alt="Aadhaar Front"
                                            className="clickable-photo"
                                            title="Click to view full size"
                                            onClick={() => window.open(normalizeFileUrl(agent.aadharPhotoFront), '_blank')}
                                        />
                                        <span className="preview-hint">Front</span>
                                    </div>
                                )}
                                {agent.aadharPhotoBack && (
                                    <div className="doc-preview-container">
                                        <img
                                            src={normalizeFileUrl(agent.aadharPhotoBack)}
                                            alt="Aadhaar Back"
                                            className="clickable-photo"
                                            title="Click to view full size"
                                            onClick={() => window.open(normalizeFileUrl(agent.aadharPhotoBack), '_blank')}
                                        />
                                        <span className="preview-hint">Back</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="kyc-doc-item">
                        <span className="doc-label">Bank Proof:</span>
                        <div className="doc-value">
                            {agent.bankName && agent.accountNumber ? (
                                <span>{agent.bankName} - {agent.accountNumber}</span>
                            ) : <span className="text-muted">No Bank Details</span>}
                            {agent.bankProofPhoto && (
                                <div className="doc-preview-container">
                                    <img
                                        src={normalizeFileUrl(agent.bankProofPhoto)}
                                        alt="Bank Proof"
                                        className="clickable-photo"
                                        title="Click to view full size"
                                        onClick={() => window.open(normalizeFileUrl(agent.bankProofPhoto), '_blank')}
                                    />
                                    <span className="preview-hint">Click to enlarge</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Agents */}
            {
                subAgents.length > 0 && (
                    <div className="detail-card">
                        <h3>Sub-Agents ({subAgents.length})</h3>
                        <div className="sub-agents-grid">
                            {subAgents.map(sub => {
                                const subId = sub._id || sub.id;
                                return (
                                    <Link
                                        key={subId}
                                        to={`/agents/details/${subId}`}
                                        className="sub-agent-card"
                                    >
                                        <div className="sub-agent-code">{sub.agentCode || sub.code}</div>
                                        <div className="sub-agent-name">{sub.user?.fullName}</div>
                                        <div className="sub-agent-status">{sub.status}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )
            }

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
                                {policies.slice(0, 10).map(policy => {
                                    const policyId = policy._id || policy.id;
                                    return (
                                        <tr key={policyId}>
                                            <td>{policy.policyNumber}</td>
                                            <td>{policy.customer?.fullName || policy.ownerName}</td>
                                            <td>₹{parseInt(policy.premium || 0).toLocaleString()}</td>
                                            <td><span className={`badge badge-${(policy.status || '').toLowerCase()}`}>{policy.status}</span></td>
                                            <td>{new Date(policy.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
};

export default AgentDetails;
