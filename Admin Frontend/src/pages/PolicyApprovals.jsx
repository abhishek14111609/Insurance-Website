import { useState, useEffect } from 'react';
import { policyAPI } from '../services/api.service';
import './PolicyApprovals.css';

const PolicyApprovals = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            setLoading(true);
            const response = await policyAPI.getPending();
            if (response.success) {
                setPolicies(response.data.policies);
            }
        } catch (err) {
            console.error('Error loading policies:', err);
            setError('Failed to load pending policies');
        } finally {
            setLoading(false);
        }
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

    const handleConfirmApprove = async () => {
        try {
            const result = await policyAPI.approve(selectedPolicy.id, notes);
            if (result.success) {
                alert('Policy approved successfully!');
                loadPolicies();
                closeModal();
            }
        } catch (err) {
            alert(err.message || 'Approval failed');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const result = await policyAPI.reject(selectedPolicy.id, rejectionReason);
            if (result.success) {
                alert('Policy rejected.');
                loadPolicies();
                closeModal();
            }
        } catch (err) {
            alert(err.message || 'Rejection failed');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPolicy(null);
        setNotes('');
        setRejectionReason('');
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>; // Add simple loading UI
    }

    return (
        <div className="policy-approvals-page">
            <div className="page-header">
                <h1>📋 Policy Approvals</h1>
                <p>Review and approve pending policy applications</p>
                <div className="header-stats">
                    <span className="stat-badge">{policies.length} Pending</span>
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

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
                                    <span className="value">{policy.customer?.fullName || policy.ownerName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Email:</span>
                                    <span className="value">{policy.ownerEmail || policy.customer?.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phone:</span>
                                    <span className="value">{policy.ownerPhone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Cattle Type:</span>
                                    <span className="value">{(policy.cattleType || '').toLowerCase() === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Tag ID:</span>
                                    <span className="value">{policy.tagId}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Coverage:</span>
                                    <span className="value highlight">₹{parseInt(policy.coverageAmount).toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Premium:</span>
                                    <span className="value highlight">₹{parseInt(policy.premium).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Photos */}
                            {policy.photos && (
                                <div className="policy-photos">
                                    <h4>Cattle Photos:</h4>
                                    <div className="photos-grid">
                                        {/* Handle both object (old mock) and JSON string (backend) */}
                                        {/* Backend might store as JSON string or parsed object depending on fetcher */}
                                        {/* Assuming fetcher parses JSON automatically if res.json() is used and DB stores JSON type or parsed by Sequelize */}
                                        {policy.photos && typeof policy.photos === 'object' && Object.entries(policy.photos).map(([side, url]) => (
                                            url && (
                                                <div key={side} className="photo-item">
                                                    <img src={url} alt={`${side} view`} onError={(e) => e.target.style.display = 'none'} />
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
                                <p><strong>Customer:</strong> {selectedPolicy?.ownerName}</p>
                                <p><strong>Coverage:</strong> ₹{parseInt(selectedPolicy?.coverageAmount || 0).toLocaleString()}</p>
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
