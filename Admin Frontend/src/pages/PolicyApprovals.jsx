import { useState, useEffect } from 'react';
import { getPendingPolicies, approvePolicy, rejectPolicy, sendEmail } from '../utils/adminUtils';
import './PolicyApprovals.css';

const PolicyApprovals = () => {
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = () => {
        setPolicies(getPendingPolicies());
    };

    const handleApproveClick = (policy) => {
        setSelectedPolicy(policy);
        setModalType('approve');
        setShowModal(true);
    };

    const handleRejectClick = (policy) => {
        setSelectedPolicy(policy);
        setModalType('reject');
        setShowModal(true);
    };

    const handleConfirmApprove = () => {
        const result = approvePolicy(selectedPolicy.id, notes);

        if (result.success) {
            // Send approval email
            sendEmail({
                to: selectedPolicy.email,
                subject: 'Policy Approved - SecureLife Insurance',
                body: `Dear ${selectedPolicy.ownerName},\n\nYour policy ${selectedPolicy.policyNumber} has been approved!\n\nCoverage: ₹${selectedPolicy.coverageAmount?.toLocaleString()}\nPremium: ₹${selectedPolicy.premium?.toLocaleString()}\n\nThank you for choosing SecureLife.`,
                type: 'policy_approval'
            });

            alert('Policy approved successfully! Email sent to customer.');
            loadPolicies();
            closeModal();
        }
    };

    const handleConfirmReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        const result = rejectPolicy(selectedPolicy.id, rejectionReason);

        if (result.success) {
            // Send rejection email
            sendEmail({
                to: selectedPolicy.email,
                subject: 'Policy Application Update - SecureLife Insurance',
                body: `Dear ${selectedPolicy.ownerName},\n\nWe regret to inform you that your policy application ${selectedPolicy.policyNumber} has been rejected.\n\nReason: ${rejectionReason}\n\nPlease contact us for more information.`,
                type: 'policy_rejection'
            });

            alert('Policy rejected. Email sent to customer.');
            loadPolicies();
            closeModal();
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPolicy(null);
        setNotes('');
        setRejectionReason('');
    };

    return (
        <div className="policy-approvals-page">
            <div className="page-header">
                <h1>📋 Policy Approvals</h1>
                <p>Review and approve pending policy applications</p>
                <div className="header-stats">
                    <span className="stat-badge">{policies.length} Pending</span>
                </div>
            </div>

            {policies.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>All Caught Up!</h3>
                    <p>No pending policy approvals at the moment.</p>
                </div>
            ) : (
                <div className="policies-grid">
                    {policies.map(policy => (
                        <div key={policy.id} className="policy-card">
                            <div className="policy-header">
                                <div>
                                    <h3>{policy.policyNumber}</h3>
                                    <span className="status-badge pending">Pending Approval</span>
                                </div>
                                <div className="policy-date">
                                    {new Date(policy.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="policy-details">
                                <div className="detail-row">
                                    <span className="label">Customer:</span>
                                    <span className="value">{policy.customerName || policy.ownerName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Email:</span>
                                    <span className="value">{policy.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phone:</span>
                                    <span className="value">{policy.phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Cattle Type:</span>
                                    <span className="value">{policy.cattleType === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tag ID:</span>
                                    <span className="value">{policy.tagId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Age:</span>
                                    <span className="value">{policy.age} years</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Breed:</span>
                                    <span className="value">{policy.breed}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Coverage:</span>
                                    <span className="value highlight">₹{policy.coverageAmount?.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Premium:</span>
                                    <span className="value highlight">₹{policy.premium?.toLocaleString()}</span>
                                </div>
                                {policy.agentCode && (
                                    <div className="detail-row">
                                        <span className="label">Agent Code:</span>
                                        <span className="value">{policy.agentCode}</span>
                                    </div>
                                )}
                            </div>

                            {/* Photos */}
                            {policy.photos && (
                                <div className="policy-photos">
                                    <h4>Cattle Photos:</h4>
                                    <div className="photos-grid">
                                        {Object.entries(policy.photos).map(([side, url]) => (
                                            url && (
                                                <div key={side} className="photo-item">
                                                    <img src={url} alt={`${side} view`} />
                                                    <span>{side}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="policy-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleApproveClick(policy)}
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleRejectClick(policy)}
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approval/Rejection Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'approve' ? '✅ Approve Policy' : '❌ Reject Policy'}
                            </h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="policy-summary">
                                <p><strong>Policy:</strong> {selectedPolicy?.policyNumber}</p>
                                <p><strong>Customer:</strong> {selectedPolicy?.customerName || selectedPolicy?.ownerName}</p>
                                <p><strong>Coverage:</strong> ₹{selectedPolicy?.coverageAmount?.toLocaleString()}</p>
                            </div>

                            {modalType === 'approve' ? (
                                <div className="form-group">
                                    <label>Admin Notes (Optional):</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes about this approval..."
                                        rows="3"
                                    />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Rejection Reason *:</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        rows="4"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
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

export default PolicyApprovals;
