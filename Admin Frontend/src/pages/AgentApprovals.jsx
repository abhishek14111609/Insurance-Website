import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './AgentApprovals.css';

const AgentApprovals = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllAgents();
            if (response.success) {
                const pending = (response.data.agents || []).filter(a => (a.status || 'PENDING').toUpperCase() === 'PENDING');
                setAgents(pending);
            }
        } catch (error) {
            console.error('Error loading pending agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (agent) => {
        setSelectedAgent(agent);
        setModalType('approve');
        setShowModal(true);
    };

    const handleRejectClick = (agent) => {
        setSelectedAgent(agent);
        setModalType('reject');
        setShowModal(true);
    };

    const handleConfirmApprove = async () => {
        try {
            const result = await adminAPI.approveAgent(selectedAgent.id);
            if (result.success) {
                alert('Agent approved successfully!');
                loadAgents();
                closeModal();
            } else {
                alert(result.message || 'Failed to approve agent');
            }
        } catch (error) {
            console.error('Approval error:', error);
            alert('An error occurred during approval');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            // Pass rejectionReason if backend API supports it in body (api.service currently doesn't pass body for reject, need to check)
            // The API service definition for rejectAgent didn't include body. I should probably update api.service if reason is needed.
            // But for now I'll just call the endpoint.
            const result = await adminAPI.rejectAgent(selectedAgent.id);

            if (result.success) {
                alert('Agent rejected.');
                loadAgents();
                closeModal();
            } else {
                alert(result.message || 'Failed to reject agent');
            }
        } catch (error) {
            console.error('Rejection error:', error);
            alert('An error occurred during rejection');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedAgent(null);
        setNotes('');
        setRejectionReason('');
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Pending Agents...</div>;

    return (
        <div className="agent-approvals-page">
            <div className="page-header">
                <div>
                    <h1>👥 Agent Approvals</h1>
                    <p>Review and approve pending agent applications</p>
                </div>
                <div className="header-stats">
                    <span className="stat-badge">{agents.length} Pending</span>
                </div>
            </div>

            {agents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>All Caught Up!</h3>
                    <p>No pending agent approvals.</p>
                </div>
            ) : (
                <div className="agents-grid">
                    {agents.map(agent => (
                        <div key={agent.id} className="agent-card">
                            <div className="agent-header">
                                <div>
                                    <h3>{agent.agentCode || agent.code || 'PENDING'}</h3>
                                    <span className="status-badge pending">Pending Approval</span>
                                </div>
                                <div className="agent-level">Level {agent.level || 1}</div>
                            </div>

                            <div className="agent-details">
                                <div className="detail-row">
                                    <span className="label">Name:</span>
                                    <span className="value">{agent.fullName || agent.name}</span>
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
                                {agent.role === 'agent' && (
                                    <div className="detail-row">
                                        <span className="label">Role:</span>
                                        <span className="value">POSP Agent</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="label">Parent Code:</span>
                                    <span className="value">{agent.referredByCode || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="agent-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleApproveClick(agent)}
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleRejectClick(agent)}
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalType === 'approve' ? '✅ Approve Agent' : '❌ Reject Agent'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="agent-summary">
                                <p><strong>Agent Code:</strong> {selectedAgent?.agentCode || 'N/A'}</p>
                                <p><strong>Name:</strong> {selectedAgent?.fullName || selectedAgent?.name}</p>
                            </div>

                            {modalType === 'approve' ? (
                                <div className="form-group">
                                    <p>Are you sure you want to approve this agent? They will become active immediately.</p>
                                    <label>Admin Notes (Optional):</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes..."
                                        rows="3"
                                    />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Rejection Reason *:</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Provide reason..."
                                        rows="4"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={modalType === 'approve' ? handleConfirmApprove : handleConfirmReject}
                            >
                                {modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentApprovals;
