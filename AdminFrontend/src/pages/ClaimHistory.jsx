import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI, BASE_URL } from '../services/api.service';
import { TableSkeleton } from '../components/Loader';
import { formatCurrency } from '../utils/numberUtils';
import './PolicyHistory.css'; // Reusing common history styles
import toast from 'react-hot-toast';

// Helper to normalize file URLs
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

const ClaimHistory = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });

    const [selectedClaim, setSelectedClaim] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchClaims();
    }, [page, filters.status]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.search !== undefined) {
                fetchClaims();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                search: filters.search,
                status: filters.status === 'all' ? '' : filters.status
            };
            const response = await claimAPI.getAll(params);
            if (response.success) {
                setClaims(response.data.claims);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Error fetching claim history:', error);
            toast.error('Failed to load claim history');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setFilters(prev => ({ ...prev, status: e.target.value }));
        setPage(1);
    };

    const handleViewDetails = (claim) => {
        setSelectedClaim(claim);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedClaim(null);
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'paid': return 'badge-success';
            case 'rejected': return 'badge-danger';
            case 'pending':
            case 'under_review': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="policy-history-page">
            <div className="page-header">
                <h1>🩺 Claim History</h1>
                <p>Track and manage insurance claim records</p>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search Claim No..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="filter-box">
                    <select value={filters.status} onChange={handleStatusChange}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : claims.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Claims Found</h3>
                        <p>No claims match your current filters</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Claim No</th>
                                <th>Claimant</th>
                                <th>Policy</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map((claim) => (
                                <tr key={claim._id || claim.id}>
                                    <td className="font-mono">{claim.claimNumber}</td>
                                    <td>
                                        <div className="user-cell">
                                            {claim.customerId ? (
                                                <Link to={`/customers/${claim.customerId._id}`} className="name-link">
                                                    {claim.customerId.fullName}
                                                </Link>
                                            ) : (
                                                <span className="name">{claim.claimant?.fullName || 'N/A'}</span>
                                            )}
                                            <span className="sub-text">{claim.customerId?.phone || claim.claimant?.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="plan-cell">
                                            <span>{claim.policyId?.policyNumber || claim.policy?.policyNumber || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {(claim.claimType || '').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="amount-cell">
                                            <span>Requested: {formatCurrency(claim.claimAmount)}</span>
                                            {claim.approvedAmount && (
                                                <span className="sub-text highlight">Approved: {formatCurrency(claim.approvedAmount)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-view-details"
                                            onClick={() => handleViewDetails(claim)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && claims.length > 0 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="btn-page"
                    >
                        Previous
                    </button>
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="btn-page"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Claim Details Modal */}
            {showModal && selectedClaim && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Claim Details: {selectedClaim.claimNumber}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="details-layout">
                                <section className="info-section">
                                    <h3>📋 General Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item"><span className="label">Status:</span> <span className={`status-badge ${getStatusBadgeClass(selectedClaim.status)}`}>{selectedClaim.status}</span></div>
                                        <div className="info-item"><span className="label">Date:</span> <span>{new Date(selectedClaim.createdAt).toLocaleDateString()}</span></div>
                                        <div className="info-item"><span className="label">Incident Date:</span> <span>{new Date(selectedClaim.incidentDate).toLocaleDateString()}</span></div>
                                        <div className="info-item"><span className="label">Type:</span> <span style={{ textTransform: 'capitalize' }}>{(selectedClaim.claimType || '').replace('_', ' ')}</span></div>
                                        <div className="info-item"><span className="label">Location:</span> <span>{selectedClaim.incidentLocation || 'N/A'}</span></div>
                                    </div>
                                </section>

                                <section className="info-section">
                                    <h3>💰 Financials</h3>
                                    <div className="info-grid">
                                        <div className="info-item"><span className="label">Requested Amount:</span> <span className="highlight">{formatCurrency(selectedClaim.claimAmount)}</span></div>
                                        {selectedClaim.approvedAmount && (
                                            <div className="info-item"><span className="label">Approved Amount:</span> <span className="highlight text-success">{formatCurrency(selectedClaim.approvedAmount)}</span></div>
                                        )}
                                        {selectedClaim.paidAmount && (
                                            <div className="info-item"><span className="label">Paid Amount:</span> <span className="highlight text-success">{formatCurrency(selectedClaim.paidAmount)}</span></div>
                                        )}
                                    </div>
                                </section>

                                <section className="info-section">
                                    <h3>📝 Description</h3>
                                    <p>{selectedClaim.description}</p>
                                    {selectedClaim.rejectionReason && (
                                        <div style={{ marginTop: '1rem' }} className="text-danger">
                                            <strong>Rejection Reason:</strong> {selectedClaim.rejectionReason}
                                        </div>
                                    )}
                                    {selectedClaim.adminNotes && (
                                        <div style={{ marginTop: '1rem', color: '#64748b' }}>
                                            <strong>Admin Notes:</strong> {selectedClaim.adminNotes}
                                        </div>
                                    )}
                                </section>

                                {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                                    <section className="info-section">
                                        <h3>📎 Documents</h3>
                                        <div className="docs-list">
                                            {selectedClaim.documents.map((doc, idx) => {
                                                const url = normalizeFileUrl(doc);
                                                const isImage = url ? (url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || url.startsWith('data:image/')) : false;

                                                if (isImage) {
                                                    return (
                                                        <div key={idx} className="photo-box">
                                                            <img
                                                                src={url}
                                                                alt={`Document ${idx + 1}`}
                                                                className="clickable-photo"
                                                                onClick={() => window.open(url, '_blank')}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120?text=No+Image'; }}
                                                            />
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <a key={idx} href={url || '#'} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                            📄 Document {idx + 1}
                                                        </a>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimHistory;
