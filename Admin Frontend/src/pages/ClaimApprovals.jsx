import { useState, useEffect } from 'react';
import { claimAPI, BASE_URL } from '../services/api.service';

const normalizeFileUrl = (value) => {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    let clean = value.trim();
    if (clean.startsWith('/')) clean = clean.slice(1);
    if (!clean.toLowerCase().startsWith('uploads/')) {
        clean = `uploads/${clean}`;
    }
    return `${BASE_URL}/${clean}`;
};
import './ClaimApprovals.css';

const ClaimApprovals = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve', 'reject', 'pay'
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvedAmount, setApprovedAmount] = useState('');

    useEffect(() => {
        loadPendingClaims();
    }, []);

    const loadPendingClaims = async () => {
        try {
            setLoading(true);
            const response = await claimAPI.getAllPending();
            if (response.success) {
                setClaims(response.data.claims);
            }
        } catch (err) {
            console.error('Error loading claims:', err);
            setError('Failed to load pending claims');
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (claim, type) => {
        setSelectedClaim(claim);
        setModalType(type);
        setAdminNotes('');
        setRejectionReason('');
        setApprovedAmount(claim.claimAmount);
        setShowModal(true);
    };

    const handleConfirmAction = async () => {
        try {
            let status = '';
            const data = { adminNotes };

            if (modalType === 'approve') {
                status = 'approved';
                data.approvedAmount = approvedAmount;
            } else if (modalType === 'reject') {
                status = 'rejected';
                data.rejectionReason = rejectionReason;
                if (!rejectionReason) {
                    alert('Please provide a rejection reason');
                    return;
                }
            } else if (modalType === 'pay') {
                status = 'paid';
            }

            const response = await claimAPI.updateStatus(selectedClaim.id, {
                status,
                ...data
            });

            if (response.success) {
                alert(`Claim ${status} successfully!`);
                loadPendingClaims();
                closeModal();
            }
        } catch (err) {
            console.error('Error updating claim:', err);
            alert(err.message || 'Action failed');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedClaim(null);
    };

    if (loading) return <div className="loading">Loading claims...</div>;

    return (
        <div className="claim-approvals-page">
            <div className="page-header">
                <div>
                    <h1>🩺 Claim Approvals</h1>
                    <p>Review and process pending insurance claims</p>
                </div>
                <div className="header-stats">
                    <span className="stat-badge">{claims.length} Pending</span>
                </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            {claims.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>No Pending Claims</h3>
                    <p>Great job! All claims have been processed.</p>
                </div>
            ) : (
                <div className="claims-grid">
                    {claims.map(claim => (
                        <div key={claim.id} className="claim-card">
                            <div className="claim-header">
                                <div>
                                    <h3>{claim.claimNumber}</h3>
                                    <span className="status-badge pending">Pending Review</span>
                                </div>
                                <div className="claim-date">
                                    {new Date(claim.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="claim-details">
                                <div className="detail-row">
                                    <span className="label">Customer:</span>
                                    <span className="value">{claim.customer?.fullName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Policy:</span>
                                    <span className="value">{claim.policy?.policyNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Type:</span>
                                    <span className="value" style={{ textTransform: 'capitalize' }}>
                                        {claim.claimType?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Incident Date:</span>
                                    <span className="value">{new Date(claim.incidentDate).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Claimed Amount:</span>
                                    <span className="value highlight">₹{parseFloat(claim.claimAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="claim-description">
                                <h4>Reason / Description:</h4>
                                <p>{claim.description}</p>
                            </div>

                            {claim.documents && claim.documents.length > 0 && (
                                <div className="claim-docs">
                                    <h4>Documents ({claim.documents.length}):</h4>
                                    <div className="docs-list">
                                        {claim.documents.map((doc, idx) => {
                                            const url = normalizeFileUrl(doc);
                                            const isImage = url ? url.match(/\.(jpg|jpeg|png|webp|gif)$/i) : false;
                                            return (
                                                <div key={idx} className="doc-item">
                                                    {isImage ? (
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="doc-thumb">
                                                            <img src={url} alt={`Document ${idx + 1}`} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120?text=No+Image'; }} />
                                                        </a>
                                                    ) : (
                                                        <a href={url || '#'} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                            📄 View Doc {idx + 1}
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="claim-actions">
                                <button className="btn btn-success" onClick={() => handleActionClick(claim, 'approve')}>
                                    ✅ Approve
                                </button>
                                <button className="btn btn-danger" onClick={() => handleActionClick(claim, 'reject')}>
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'approve' ? '✅ Approve Claim' : '❌ Reject Claim'}
                            </h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Claim:</strong> {selectedClaim?.claimNumber}</p>
                            <p><strong>Customer:</strong> {selectedClaim?.customer?.fullName}</p>

                            {modalType === 'approve' && (
                                <div className="form-group">
                                    <label>Approved Amount (₹):</label>
                                    <input
                                        type="number"
                                        value={approvedAmount}
                                        onChange={e => setApprovedAmount(e.target.value)}
                                    />
                                </div>
                            )}

                            {modalType === 'reject' && (
                                <div className="form-group">
                                    <label>Rejection Reason *:</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="Why is this claim being rejected?"
                                        rows="3"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Admin Notes (Optional):</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder="Internal notes..."
                                    rows="2"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button
                                className={`btn ${modalType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                onClick={handleConfirmAction}
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

export default ClaimApprovals;
