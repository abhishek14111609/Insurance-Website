import { useState, useEffect } from 'react';
import { adminAPI, BASE_URL } from '../services/api.service';
import './AgentApprovals.css';

const AgentApprovals = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
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
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllAgents();
            if (response.success) {
                // Filter agents that are either pending status OR pending KYC
                const pending = (response.data.agents || []).filter(a =>
                    (a.status || 'PENDING').toUpperCase() === 'PENDING' ||
                    a.kycStatus === 'pending'
                );
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
        setModalType(agent.kycStatus === 'pending' ? 'approve_kyc' : 'approve');
        setShowModal(true);
    };

    const handleRejectClick = (agent) => {
        setSelectedAgent(agent);
        setModalType(agent.kycStatus === 'pending' ? 'reject_kyc' : 'reject');
        setShowModal(true);
    };

    const handleConfirmApprove = async () => {
        try {
            const result = await adminAPI.approveAgent(selectedAgent.id, notes);
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

    const handleConfirmKYCApprove = async () => {
        try {
            const result = await adminAPI.verifyAgentKYC(selectedAgent.id, 'verified');
            if (result.success) {
                alert('KYC verified successfully!');
                loadAgents();
                closeModal();
            } else {
                alert(result.message || 'Failed to verify KYC');
            }
        } catch (error) {
            console.error('KYC Verification error:', error);
            alert('An error occurred during KYC verification');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const result = await adminAPI.rejectAgent(selectedAgent.id, rejectionReason);

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

    const handleConfirmKYCReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const result = await adminAPI.verifyAgentKYC(selectedAgent.id, 'rejected', rejectionReason);
            if (result.success) {
                alert('KYC rejected.');
                loadAgents();
                closeModal();
            } else {
                alert(result.message || 'Failed to reject KYC');
            }
        } catch (error) {
            console.error('KYC Rejection error:', error);
            alert('An error occurred during KYC rejection');
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
                                {agent.role === 'agent' && (
                                    <div className="detail-row">
                                        <span className="label">Role:</span>
                                        <span className="value">POSP Agent</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="label">Parent Code:</span>
                                    <span className="value">{agent.parentAgent?.agentCode || 'None'}</span>
                                </div>
                                <div className="detail-divider"></div>
                                <div className="detail-row">
                                    <span className="label">PAN:</span>
                                    <span className="value">{agent.panNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Aadhar:</span>
                                    <span className="value">{agent.aadharNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Bank:</span>
                                    <span className="value">{agent.bankName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">A/C:</span>
                                    <span className="value">{agent.accountNumber}</span>
                                </div>
                                <div className="detail-divider"></div>
                                <div className="detail-row">
                                    <span className="label">KYC Status:</span>
                                    <span className={`status-badge ${agent.kycStatus || 'not_submitted'}`}>
                                        {agent.kycStatus?.replace('_', ' ') || 'NOT SUBMITTED'}
                                    </span>
                                </div>
                            </div>

                            <div className="agent-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleApproveClick(agent)}
                                >
                                    🔍 Review & Verify
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Review Agent: {selectedAgent?.user?.fullName}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="review-grid">
                                <div className="review-section">
                                    <h3>Information</h3>
                                    <p><strong>Agent Code:</strong> {selectedAgent?.agentCode || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedAgent?.user?.email}</p>
                                    <p><strong>Phone:</strong> {selectedAgent?.user?.phone}</p>
                                    <p><strong>Address:</strong> {selectedAgent?.user?.address || 'N/A'}</p>
                                    <p><strong>Bank Details:</strong> {selectedAgent?.bankName} - {selectedAgent?.accountNumber} ({selectedAgent?.ifscCode})</p>
                                </div>

                                <div className="review-section">
                                    <h3>KYC Documents</h3>
                                    <div className="document-previews-grid">
                                        {selectedAgent?.panPhoto ? (
                                            <div className="doc-preview-item">
                                                <span className="doc-label">PAN Card ({selectedAgent.panNumber})</span>
                                                <div className="img-container">
                                                    <img
                                                        src={normalizeFileUrl(selectedAgent.panPhoto)}
                                                        alt="PAN Card"
                                                        onClick={() => window.open(normalizeFileUrl(selectedAgent.panPhoto), '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        ) : <p className="text-muted">No PAN photo uploaded</p>}

                                        {selectedAgent?.aadharPhotoFront ? (
                                            <div className="doc-preview-item">
                                                <span className="doc-label">Aadhaar Front ({selectedAgent.aadharNumber})</span>
                                                <div className="img-container">
                                                    <img
                                                        src={normalizeFileUrl(selectedAgent.aadharPhotoFront)}
                                                        alt="Aadhaar Front"
                                                        onClick={() => window.open(normalizeFileUrl(selectedAgent.aadharPhotoFront), '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        ) : <p className="text-muted">No Aadhaar front uploaded</p>}

                                        {selectedAgent?.aadharPhotoBack ? (
                                            <div className="doc-preview-item">
                                                <span className="doc-label">Aadhaar Back</span>
                                                <div className="img-container">
                                                    <img
                                                        src={normalizeFileUrl(selectedAgent.aadharPhotoBack)}
                                                        alt="Aadhaar Back"
                                                        onClick={() => window.open(normalizeFileUrl(selectedAgent.aadharPhotoBack), '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        ) : null}

                                        {selectedAgent?.bankProofPhoto ? (
                                            <div className="doc-preview-item">
                                                <span className="doc-label">Bank Proof</span>
                                                <div className="img-container">
                                                    <img
                                                        src={normalizeFileUrl(selectedAgent.bankProofPhoto)}
                                                        alt="Bank Proof"
                                                        onClick={() => window.open(normalizeFileUrl(selectedAgent.bankProofPhoto), '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        ) : <p className="text-muted">No bank proof uploaded</p>}
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className="action-selection">
                                <label>Decision:</label>
                                <div className="btn-group">
                                    <button
                                        className={`btn ${['approve', 'approve_kyc'].includes(modalType) ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setModalType(selectedAgent?.kycStatus === 'pending' ? 'approve_kyc' : 'approve')}
                                    >{selectedAgent?.kycStatus === 'pending' ? 'Approve KYC' : 'Approve Agent'}</button>
                                    <button
                                        className={`btn ${['reject', 'reject_kyc'].includes(modalType) ? 'btn-danger' : 'btn-outline-danger'}`}
                                        onClick={() => setModalType(selectedAgent?.kycStatus === 'pending' ? 'reject_kyc' : 'reject')}
                                    >{selectedAgent?.kycStatus === 'pending' ? 'Reject KYC' : 'Reject Application'}</button>
                                </div>
                            </div>

                            {['approve', 'approve_kyc'].includes(modalType) ? (
                                <div className="form-group mt-3">
                                    <p>{modalType === 'approve_kyc' ? 'Are you sure you want to verify this agent\'s KYC? Their status will be updated.' : 'Are you sure you want to approve this agent? They will become active immediately.'}</p>
                                    <label>Admin Notes (Optional):</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes..."
                                        rows="2"
                                    />
                                </div>
                            ) : ['reject', 'reject_kyc'].includes(modalType) ? (
                                <div className="form-group mt-3">
                                    <label>Rejection Reason *:</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Provide reason for rejection..."
                                        rows="2"
                                        required
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            {modalType && (
                                <button
                                    className={`btn ${['approve', 'approve_kyc'].includes(modalType) ? 'btn-success' : 'btn-danger'}`}
                                    onClick={() => {
                                        if (modalType === 'approve') handleConfirmApprove();
                                        else if (modalType === 'approve_kyc') handleConfirmKYCApprove();
                                        else if (modalType === 'reject') handleConfirmReject();
                                        else if (modalType === 'reject_kyc') handleConfirmKYCReject();
                                    }}
                                >
                                    {['approve', 'approve_kyc'].includes(modalType) ? 'Confirm Approval' : 'Confirm Rejection'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentApprovals;
