import { useState, useEffect } from 'react';
import { getPendingAgents, approveAgent, rejectAgent, sendEmail } from '../utils/adminUtils';
import './AgentApprovals.css';

const AgentApprovals = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = () => {
        setAgents(getPendingAgents());
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

    const handleConfirmApprove = () => {
        const result = approveAgent(selectedAgent.id, notes);

        if (result.success) {
            sendEmail({
                to: selectedAgent.email,
                subject: 'Agent Application Approved - SecureLife',
                body: `Dear ${selectedAgent.name},\n\nCongratulations! Your agent application has been approved.\n\nAgent Code: ${selectedAgent.code}\nLevel: ${selectedAgent.level}\nCommission Rate: ${selectedAgent.commissionRate}%\n\nWelcome to SecureLife!`,
                type: 'agent_approval'
            });

            alert('Agent approved successfully! Email sent.');
            loadAgents();
            closeModal();
        }
    };

    const handleConfirmReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        const result = rejectAgent(selectedAgent.id, rejectionReason);

        if (result.success) {
            sendEmail({
                to: selectedAgent.email,
                subject: 'Agent Application Update - SecureLife',
                body: `Dear ${selectedAgent.name},\n\nWe regret to inform you that your agent application has been rejected.\n\nReason: ${rejectionReason}\n\nThank you for your interest.`,
                type: 'agent_rejection'
            });

            alert('Agent rejected. Email sent.');
            loadAgents();
            closeModal();
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedAgent(null);
        setNotes('');
        setRejectionReason('');
    };

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
                                    <h3>{agent.code}</h3>
                                    <span className="status-badge pending">Pending Approval</span>
                                </div>
                                <div className="agent-level">Level {agent.level}</div>
                            </div>

                            <div className="agent-details">
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
                                    <span className="label">Commission Rate:</span>
                                    <span className="value highlight">{agent.commissionRate}%</span>
                                </div>
                                {agent.parentId && (
                                    <div className="detail-row">
                                        <span className="label">Parent Agent:</span>
                                        <span className="value">{agent.parentId}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="label">Joined:</span>
                                    <span className="value">{new Date(agent.joinedDate).toLocaleDateString()}</span>
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
                                <p><strong>Agent Code:</strong> {selectedAgent?.code}</p>
                                <p><strong>Name:</strong> {selectedAgent?.name}</p>
                                <p><strong>Level:</strong> {selectedAgent?.level}</p>
                            </div>

                            {modalType === 'approve' ? (
                                <div className="form-group">
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
