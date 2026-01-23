import { useState, useEffect } from 'react';
import { policyAPI, BASE_URL } from '../services/api.service';
import { formatCurrency } from '../utils/numberUtils';
import toast from 'react-hot-toast';
import './PolicyApprovals.css';

// Normalize any stored path (bare filename, relative path, or absolute URL) to a fetchable URL
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

const PolicyApprovals = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await policyAPI.getPending();
            if (response.success) {
                setPolicies(response.data.policies || []);
            }
        } catch (err) {
            console.error('Error loading policies:', err);
            setError('Failed to load pending policies. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (policy) => {
        setSelectedPolicy(policy);
        setDetailsModalOpen(true);
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
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const policyId = selectedPolicy?._id || selectedPolicy?.id;
            if (!policyId) {
                throw new Error('Missing policy identifier');
            }

            const result = await policyAPI.approve(policyId, notes);
            if (result.success) {
                toast.success('Policy approved successfully!');
                loadPolicies();
                closeModal();
            } else {
                toast.error(result.message || 'Approval failed');
            }
        } catch (err) {
            console.error('Approval error:', err);
            toast.error(err.message || 'Approval failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const policyId = selectedPolicy?._id || selectedPolicy?.id;
            if (!policyId) {
                throw new Error('Missing policy identifier');
            }

            const result = await policyAPI.reject(policyId, rejectionReason);
            if (result.success) {
                toast.success('Policy rejected.');
                loadPolicies();
                closeModal();
            } else {
                toast.error(result.message || 'Rejection failed');
            }
        } catch (err) {
            console.error('Rejection error:', err);
            toast.error(err.message || 'Rejection failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setDetailsModalOpen(false);
        setSelectedPolicy(null);
        setNotes('');
        setRejectionReason('');
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading Approvals...</div>;

    return (
        <div className="policy-approvals-page">
            <div className="page-header">
                <h1>📋 Policy Approvals</h1>
                <p>Review and approve pending policy applications</p>
                <div className="header-stats">
                    <span className="stat-badge">{policies.length} Pending</span>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by policy #, customer name or tag ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                    {policies
                        .filter(p =>
                            p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.tagId?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(policy => {
                            const policyId = policy._id || policy.id;
                            return (
                                <div key={policyId} className="policy-card">
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
                                            <span className="value highlight">{formatCurrency(policy.coverageAmount)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Premium:</span>
                                            <span className="value highlight">{formatCurrency(policy.premium)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Breed:</span>
                                            <span className="value">{policy.breed || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Age:</span>
                                            <span className="value">{policy.age ? `${policy.age} Years` : 'N/A'}</span>
                                        </div>
                                        {policy.agent && (
                                            <div className="detail-row">
                                                <span className="label">Agent:</span>
                                                <span className="value">{policy.agent.user?.fullName} ({policy.agent.agentCode})</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Photos */}
                                    {policy.photos && (
                                        <div className="policy-photos">
                                            <h4>Cattle Photos:</h4>
                                            <div className="photos-grid">
                                                {(() => {
                                                    let photos = policy.photos;
                                                    if (!photos) return null;
                                                    if (typeof photos === 'string') {
                                                        try { photos = JSON.parse(photos); } catch (e) { photos = {}; }
                                                    }
                                                    return Object.entries(photos || {}).map(([side, url]) => {
                                                        const imgUrl = normalizeFileUrl(url);
                                                        if (!imgUrl) return null;
                                                        return (
                                                            <div key={side} className="photo-item">
                                                                <img
                                                                    src={imgUrl}
                                                                    alt={`${side} view`}
                                                                    title="Click to view full size"
                                                                    className="clickable-photo"
                                                                    onClick={() => window.open(imgUrl, '_blank')}
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Photo'; }}
                                                                />
                                                                <span>{side}</span>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="policy-actions">
                                        <button
                                            className="btn btn-info"
                                            onClick={() => handleViewDetails(policy)}
                                        >
                                            👁️ Details
                                        </button>
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
                            );
                        })}
                </div>
            )}

            {/* Detailed Policy Modal */}
            {detailsModalOpen && selectedPolicy && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detailed Policy Information</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="details-layout">
                                <section className="info-section">
                                    <h3>👤 Owner Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item"><span className="label">Name:</span> <span>{selectedPolicy.ownerName}</span></div>
                                        <div className="info-item"><span className="label">Email:</span> <span>{selectedPolicy.ownerEmail}</span></div>
                                        <div className="info-item"><span className="label">Phone:</span> <span>{selectedPolicy.ownerPhone}</span></div>
                                        <div className="info-item"><span className="label">Address:</span> <span>{selectedPolicy.ownerAddress}, {selectedPolicy.ownerCity}, {selectedPolicy.ownerState} - {selectedPolicy.ownerPincode}</span></div>
                                    </div>
                                </section>

                                <section className="info-section">
                                    <h3>🐄 Cattle Details</h3>
                                    <div className="info-grid">
                                        <div className="info-item"><span className="label">Type:</span> <span>{selectedPolicy.cattleType}</span></div>
                                        <div className="info-item"><span className="label">Breed:</span> <span>{selectedPolicy.breed}</span></div>
                                        <div className="info-item"><span className="label">Age:</span> <span>{selectedPolicy.age} Years</span></div>
                                        <div className="info-item"><span className="label">Health:</span> <span>{selectedPolicy.healthCondition}</span></div>
                                        <div className="info-item"><span className="label">Tag ID:</span> <span>{selectedPolicy.tagId}</span></div>
                                    </div>
                                </section>

                                <section className="info-section">
                                    <h3>📄 Policy & Photos</h3>
                                    <div className="info-grid single-col">
                                        <div className="info-item"><span className="label">Premium:</span> <span className="highlight">{formatCurrency(selectedPolicy.premium)}</span></div>
                                        <div className="info-item"><span className="label">Coverage:</span> <span className="highlight">{formatCurrency(selectedPolicy.coverageAmount)}</span></div>
                                    </div>
                                    <div className="policy-photos-view">
                                        <h4>Identification Photos:</h4>
                                        <div className="photos-row">
                                            {(() => {
                                                let photos = selectedPolicy.photos;
                                                if (typeof photos === 'string') {
                                                    try { photos = JSON.parse(photos); } catch (e) { photos = {}; }
                                                }
                                                return Object.entries(photos || {}).map(([side, url]) => {
                                                    const imgUrl = normalizeFileUrl(url);
                                                    if (!imgUrl) return null;
                                                    return (
                                                        <div key={side} className="photo-box">
                                                            <img
                                                                src={imgUrl}
                                                                alt={side}
                                                                title="Click to view full size"
                                                                className="clickable-photo"
                                                                onClick={() => window.open(imgUrl, '_blank')}
                                                            />
                                                            <span>{side}</span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </section>

                                {selectedPolicy.documents && (
                                    <section className="info-section">
                                        <h3>📎 Documents</h3>
                                        <div className="docs-list">
                                            {(() => {
                                                let docs = selectedPolicy.documents;
                                                if (typeof docs === 'string') {
                                                    try { docs = JSON.parse(docs); } catch (e) { docs = {}; }
                                                }
                                                return Object.entries(docs || {}).map(([name, url]) => (
                                                    <a key={name} href={url.startsWith('http') ? url : `${BASE_URL}${url}`} target="_blank" rel="noreferrer" className="doc-link">
                                                        📄 {name}
                                                    </a>
                                                ));
                                            })()}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Close Details</button>
                            <button className="btn btn-success" onClick={() => { setDetailsModalOpen(false); handleApproveClick(selectedPolicy); }}>Approve This Policy</button>
                        </div>
                    </div>
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
                                <p><strong>Coverage:</strong> {formatCurrency(selectedPolicy?.coverageAmount)}</p>
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
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : (modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyApprovals;
