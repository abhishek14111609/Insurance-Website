import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI, BASE_URL } from '../services/api.service';
import { TableSkeleton } from '../components/Loader';
import { formatCurrency } from '../utils/numberUtils';
import { exportToCSV, formatClaimsForExport } from '../utils/exportUtils';
import BulkActionBar from '../components/BulkActionBar';
import { CheckCircle } from 'lucide-react';
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

    // Bulk operations state
    const [selectedClaims, setSelectedClaims] = useState(new Set());
    const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

    const handleExport = () => {
        try {
            if (claims.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatClaimsForExport(claims);
            exportToCSV(formattedData, 'claims_export');
            toast.success(`Exported ${claims.length} claims successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    // Bulk selection handlers
    const handleSelectClaim = (claimId) => {
        const newSelected = new Set(selectedClaims);
        if (newSelected.has(claimId)) {
            newSelected.delete(claimId);
        } else {
            newSelected.add(claimId);
        }
        setSelectedClaims(newSelected);
    };

    const handleSelectAll = () => {
        const pendingClaims = claims.filter(c => c.status?.toLowerCase() === 'pending');
        const allIds = new Set(pendingClaims.map(c => c._id || c.id));
        setSelectedClaims(allIds);
    };

    const handleClearSelection = () => {
        setSelectedClaims(new Set());
    };

    // Bulk approve handler (for claims, this means approve for payment)
    const handleBulkApprove = async () => {
        setBulkActionLoading(true);
        try {
            const claimIds = Array.from(selectedClaims);
            let successCount = 0;
            let failCount = 0;

            for (const claimId of claimIds) {
                try {
                    // Assuming there's an approve claim API
                    const result = await claimAPI.approve(claimId);
                    if (result.success) successCount++;
                    else failCount++;
                } catch (err) {
                    failCount++;
                    console.error(`Failed to approve claim ${claimId}:`, err);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully approved ${successCount} claim(s)`);
                fetchClaims();
                handleClearSelection();
            }
            if (failCount > 0) {
                toast.error(`Failed to approve ${failCount} claim(s)`);
            }
        } catch (error) {
            console.error('Bulk approve error:', error);
            toast.error('Bulk approval failed');
        } finally {
            setBulkActionLoading(false);
            setShowBulkApproveModal(false);
        }
    };

    // Filter pending claims for display
    const pendingClaims = claims.filter(c => c.status?.toLowerCase() === 'pending');

    return (
        <div className="policy-history-page">
            <div className="page-header">
                <div>
                    <h1>🩺 Claim History</h1>
                    <p>Track and manage insurance claim records</p>
                </div>
                <button onClick={handleExport} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                    📥 Export CSV
                </button>
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

            {/* Bulk Action Bar - Only show for pending claims */}
            {pendingClaims.length > 0 && (
                <BulkActionBar
                    selectedCount={selectedClaims.size}
                    totalCount={pendingClaims.length}
                    onSelectAll={handleSelectAll}
                    onClearSelection={handleClearSelection}
                    entityName="pending claims"
                    actions={[
                        {
                            label: 'Approve Selected',
                            icon: <CheckCircle size={18} />,
                            variant: 'success',
                            onClick: () => setShowBulkApproveModal(true),
                            disabled: bulkActionLoading
                        }
                    ]}
                />
            )}

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
                                <th style={{ width: '50px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedClaims.size === pendingClaims.length && pendingClaims.length > 0}
                                        onChange={() => selectedClaims.size === pendingClaims.length ? handleClearSelection() : handleSelectAll()}
                                        style={{ cursor: 'pointer' }}
                                        disabled={pendingClaims.length === 0}
                                    />
                                </th>
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
                            {claims.map((claim) => {
                                const claimId = claim._id || claim.id;
                                const isPending = claim.status?.toLowerCase() === 'pending';
                                return (
                                    <tr key={claimId}>
                                        <td>
                                            {isPending ? (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClaims.has(claimId)}
                                                    onChange={() => handleSelectClaim(claimId)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            ) : (
                                                <span style={{ width: '18px', display: 'inline-block' }}>-</span>
                                            )}
                                        </td>
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
                                );
                            })}
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

            {/* Bulk Approve Modal */}
            {showBulkApproveModal && (
                <div className="modal-overlay" onClick={() => !bulkActionLoading && setShowBulkApproveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✅ Bulk Approve Claims</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowBulkApproveModal(false)}
                                disabled={bulkActionLoading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>You are about to approve <strong>{selectedClaims.size}</strong> claim(s).</p>
                            <p>This action will:</p>
                            <ul>
                                <li>✅ Mark claims as approved</li>
                                <li>✅ Initiate payment processing</li>
                                <li>✅ Send approval notifications to claimants</li>
                                <li>✅ Update claim status in the system</li>
                            </ul>
                            <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9em' }}>
                                💡 Tip: Approved claims will be processed for payment according to your payout schedule.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowBulkApproveModal(false)}
                                disabled={bulkActionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleBulkApprove}
                                disabled={bulkActionLoading}
                            >
                                {bulkActionLoading ? 'Processing...' : `Approve ${selectedClaims.size} Claim(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimHistory;
