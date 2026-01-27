import { useState, useEffect } from 'react';
import { adminAPI, BASE_URL } from '../services/api.service';
import toast from 'react-hot-toast';
import './AgentApprovals.css';

import {
    Users,
    CheckCircle,
    Clock,
    ShieldCheck,
    AlertCircle,
    X,
    ExternalLink,
    FileText,
    CreditCard,
    Building,
    User,
    Mail,
    Phone,
    MapPin,
    ArrowRight
} from 'lucide-react';

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
            const result = await adminAPI.approveAgent(selectedAgent.id || selectedAgent._id, notes);
            if (result.success) {
                toast.success('Agent approved successfully!');
                loadAgents();
                closeModal();
            } else {
                toast.error(result.message || 'Failed to approve agent');
            }
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('An error occurred during approval');
        }
    };

    const handleConfirmKYCApprove = async () => {
        try {
            const result = await adminAPI.verifyAgentKYC(selectedAgent.id || selectedAgent._id, 'verified');
            if (result.success) {
                toast.success('KYC verified successfully!');
                loadAgents();
                closeModal();
            } else {
                toast.error(result.message || 'Failed to verify KYC');
            }
        } catch (error) {
            console.error('KYC Verification error:', error);
            toast.error('An error occurred during KYC verification');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            const result = await adminAPI.rejectAgent(selectedAgent.id || selectedAgent._id, rejectionReason);
            if (result.success) {
                toast.success('Agent rejected.');
                loadAgents();
                closeModal();
            } else {
                toast.error(result.message || 'Failed to reject agent');
            }
        } catch (error) {
            console.error('Rejection error:', error);
            toast.error('An error occurred during rejection');
        }
    };

    const handleConfirmKYCReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            const result = await adminAPI.verifyAgentKYC(selectedAgent.id || selectedAgent._id, 'rejected', rejectionReason);
            if (result.success) {
                toast.success('KYC rejected.');
                loadAgents();
                closeModal();
            } else {
                toast.error(result.message || 'Failed to reject KYC');
            }
        } catch (error) {
            console.error('KYC Rejection error:', error);
            toast.error('An error occurred during KYC rejection');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedAgent(null);
        setNotes('');
        setRejectionReason('');
    };

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="agent-approvals-page">
            <div className="page-header-modern">
                <div className="header-info">
                    <h1>Request Verification</h1>
                    <p>Screen new agent applications and KYC submissions</p>
                </div>
                <div className="header-stats-pill">
                    <Clock size={16} />
                    <span>{agents.length} Applications Pending</span>
                </div>
            </div>

            {agents.length === 0 ? (
                <div className="approval-empty-state">
                    <div className="empty-illustration">
                        <CheckCircle size={64} color="var(--color-success)" />
                    </div>
                    <h3>Inbox Cleared!</h3>
                    <p>There are no pending agent requests to review at this moment.</p>
                </div>
            ) : (
                <div className="agents-grid-modern">
                    {agents.map((agent, index) => (
                        <div key={agent.id || agent._id || index} className="approval-card-modern">
                            <div className="card-badge-status">
                                <span className="dot pulse"></span>
                                {agent.kycStatus === 'pending' ? 'KYC Verification' : 'New Enrollment'}
                            </div>

                            <div className="agent-profile-header">
                                <div className="agent-avatar-lg">
                                    {agent.user?.fullName?.charAt(0) || 'A'}
                                </div>
                                <div className="agent-titles">
                                    <h3>{agent.user?.fullName}</h3>
                                    <span>Code: {agent.agentCode || agent.code || 'PENDING'}</span>
                                </div>
                            </div>

                            <div className="agent-info-grid">
                                <div className="info-item">
                                    <Mail size={14} />
                                    <span>{agent.user?.email}</span>
                                </div>
                                <div className="info-item">
                                    <Phone size={14} />
                                    <span>{agent.user?.phone}</span>
                                </div>
                                <div className="info-item">
                                    <MapPin size={14} />
                                    <span>{agent.user?.city || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <Users size={14} />
                                    <span>Level {agent.level || 1} • {agent.parentAgent?.agentCode || 'Direct'}</span>
                                </div>
                            </div>

                            <div className="card-footer-modern">
                                <button className="btn btn-primary btn-block" onClick={() => handleApproveClick(agent)}>
                                    Review Details <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay-modern" onClick={closeModal}>
                    <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-modern">
                            <div className="modal-header-title">
                                <h2>Application Review</h2>
                                <span>{selectedAgent?.user?.fullName}</span>
                            </div>
                            <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
                        </div>

                        <div className="modal-body-scrollable">
                            <div className="review-sections-grid">
                                <section className="review-section-modern">
                                    <div className="section-title-modern">
                                        <User size={18} />
                                        <h3>Identity & Contact</h3>
                                    </div>
                                    <div className="info-list-modern">
                                        <div className="info-pair"><span>Full Name</span><strong>{selectedAgent?.user?.fullName}</strong></div>
                                        <div className="info-pair"><span>Phone</span><strong>{selectedAgent?.user?.phone}</strong></div>
                                        <div className="info-pair"><span>Address</span><strong>{selectedAgent?.user?.address || 'N/A'}</strong></div>
                                        <div className="info-pair"><span>PAN Number</span><strong>{selectedAgent?.panNumber}</strong></div>
                                        <div className="info-pair"><span>Aadhaar</span><strong>{selectedAgent?.aadharNumber}</strong></div>
                                    </div>
                                </section>

                                <section className="review-section-modern">
                                    <div className="section-title-modern">
                                        <Building size={18} />
                                        <h3>Banking Information</h3>
                                    </div>
                                    <div className="info-list-modern">
                                        <div className="info-pair"><span>Bank Name</span><strong>{selectedAgent?.bankName}</strong></div>
                                        <div className="info-pair"><span>Account No</span><strong>{selectedAgent?.accountNumber}</strong></div>
                                        <div className="info-pair"><span>IFSC Code</span><strong>{selectedAgent?.ifscCode}</strong></div>
                                    </div>
                                </section>

                                <section className="review-section-modern full-width">
                                    <div className="section-title-modern">
                                        <FileText size={18} />
                                        <h3>Document Evidence</h3>
                                    </div>
                                    <div className="doc-evidence-grid">
                                        {selectedAgent?.panPhoto && (
                                            <div className="evidence-card" onClick={() => window.open(normalizeFileUrl(selectedAgent.panPhoto), '_blank')}>
                                                <div className="evidence-preview"><img src={normalizeFileUrl(selectedAgent.panPhoto)} alt="PAN" /></div>
                                                <div className="evidence-label">PAN Card <ExternalLink size={12} /></div>
                                            </div>
                                        )}
                                        {selectedAgent?.aadharPhotoFront && (
                                            <div className="evidence-card" onClick={() => window.open(normalizeFileUrl(selectedAgent.aadharPhotoFront), '_blank')}>
                                                <div className="evidence-preview"><img src={normalizeFileUrl(selectedAgent.aadharPhotoFront)} alt="Aadhaar F" /></div>
                                                <div className="evidence-label">Aadhaar Front <ExternalLink size={12} /></div>
                                            </div>
                                        )}
                                        {selectedAgent?.aadharPhotoBack && (
                                            <div className="evidence-card" onClick={() => window.open(normalizeFileUrl(selectedAgent.aadharPhotoBack), '_blank')}>
                                                <div className="evidence-preview"><img src={normalizeFileUrl(selectedAgent.aadharPhotoBack)} alt="Aadhaar B" /></div>
                                                <div className="evidence-label">Aadhaar Back <ExternalLink size={12} /></div>
                                            </div>
                                        )}
                                        {selectedAgent?.bankProofPhoto && (
                                            <div className="evidence-card" onClick={() => window.open(normalizeFileUrl(selectedAgent.bankProofPhoto), '_blank')}>
                                                <div className="evidence-preview"><img src={normalizeFileUrl(selectedAgent.bankProofPhoto)} alt="Bank" /></div>
                                                <div className="evidence-label">Bank Passbook <ExternalLink size={12} /></div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <div className="decision-wrapper">
                                <h3>Final Decision</h3>
                                <div className="decision-buttons">
                                    <button
                                        className={`decision-btn approve ${['approve', 'approve_kyc'].includes(modalType) ? 'active' : ''}`}
                                        onClick={() => setModalType(selectedAgent?.kycStatus === 'pending' ? 'approve_kyc' : 'approve')}
                                    >
                                        <ShieldCheck size={20} />
                                        <span>Verify & Approve</span>
                                    </button>
                                    <button
                                        className={`decision-btn reject ${['reject', 'reject_kyc'].includes(modalType) ? 'active' : ''}`}
                                        onClick={() => setModalType(selectedAgent?.kycStatus === 'pending' ? 'reject_kyc' : 'reject')}
                                    >
                                        <AlertCircle size={20} />
                                        <span>Issue Rejection</span>
                                    </button>
                                </div>

                                {['approve', 'approve_kyc'].includes(modalType) ? (
                                    <div className="decision-notes animate-slide-up">
                                        <label>Approval Notes (Optional)</label>
                                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter any specific notes for this agent..." rows="3" />
                                    </div>
                                ) : ['reject', 'reject_kyc'].includes(modalType) ? (
                                    <div className="decision-notes animate-slide-up">
                                        <label>Rejection Reason (Required)</label>
                                        <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why the application/KYC was rejected..." rows="3" required />
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="modal-footer-modern">
                            <button className="btn btn-secondary" onClick={closeModal}>Close Review</button>
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
                                    Confirm {['approve', 'approve_kyc'].includes(modalType) ? 'Approval' : 'Rejection'}
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
