import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { policyAPI, BASE_URL } from '../services/api.service';
import { TableSkeleton } from '../components/Loader';
import { formatCurrency } from '../utils/numberUtils';
import { exportToCSV, formatPoliciesForExport } from '../utils/exportUtils';
import './PolicyHistory.css';
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

const PolicyHistory = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });

    // Modal state
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, [page, filters.status]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.search !== undefined) {
                fetchPolicies();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                search: filters.search,
                status: filters.status === 'all' ? '' : filters.status
            };
            const response = await policyAPI.getAll(params);
            if (response.success) {
                setPolicies(response.data.policies);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Error fetching policy history:', error);
            toast.error('Failed to load policy history');
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

    const handleViewDetails = (policy) => {
        setSelectedPolicy(policy);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPolicy(null);
    };

    const handleDownloadPDF = async (policy) => {
        try {
            if (policy.status?.toLowerCase() !== 'approved') {
                toast.error('PDF is only available for approved policies');
                return;
            }

            // Use the API endpoint to download PDF (generates if missing)
            const downloadUrl = `${BASE_URL}/api/admin/policies/${policy.policyNumber}/download`;

            // Open in new tab for download
            window.open(downloadUrl, '_blank');
            toast.success('Opening PDF...');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF');
        }
    };

    const handleExport = () => {
        try {
            if (policies.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatPoliciesForExport(policies);
            exportToCSV(formattedData, 'policy_history_export');
            toast.success(`Exported ${policies.length} policies successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'badge-success';
            case 'rejected': return 'badge-danger';
            case 'pending': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="policy-history-page">
            <div className="page-header">
                <div>
                    <h1>📜 Policy History</h1>
                    <p>View all policy records and their current status</p>
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
                        placeholder="Search Policy No, Name, Email..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="filter-box">
                    <select value={filters.status} onChange={handleStatusChange}>
                        <option value="all">All Status</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : policies.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Policies Found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Policy No</th>
                                <th>Owner Name</th>
                                <th>Plan / Cattle</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy) => (
                                <tr key={policy._id}>
                                    <td className="font-mono">{policy.policyNumber}</td>
                                    <td>
                                        <div className="user-cell">
                                            {policy.customerId ? (
                                                <Link to={`/customers/${policy.customerId._id}`} className="name-link">
                                                    {policy.ownerName || policy.customerId?.fullName || 'N/A'}
                                                </Link>
                                            ) : (
                                                <span className="name">{policy.ownerName || policy.customerId?.fullName || 'N/A'}</span>
                                            )}
                                            <span className="sub-text">{policy.ownerPhone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="plan-cell">
                                            <span>{policy.cattleType} ({policy.breed})</span>
                                            <span className="sub-text">Tag: {policy.tagId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="amount-cell">
                                            <span>Cov: {formatCurrency(policy.coverageAmount)}</span>
                                            <span className="sub-text">Prem: {formatCurrency(policy.premium)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(policy.status)}`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td>{new Date(policy.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                className="btn-view-details"
                                                onClick={() => handleViewDetails(policy)}
                                                title="View Details"
                                            >
                                                👁️ View
                                            </button>
                                            {policy.status?.toLowerCase() === 'approved' && (
                                                <button
                                                    className="btn-download"
                                                    onClick={() => handleDownloadPDF(policy)}
                                                    title="Download PDF"
                                                >
                                                    📥 PDF
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && policies.length > 0 && (
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

            {/* View Details Modal */}
            {showModal && selectedPolicy && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Policy Details: {selectedPolicy.policyNumber}</h2>
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
                                        <div className="info-item"><span className="label">Status:</span> <span className={`status-badge ${getStatusBadgeClass(selectedPolicy.status)}`}>{selectedPolicy.status}</span></div>
                                        {selectedPolicy.rejectionReason && (
                                            <div className="info-item"><span className="label text-danger">Rejection Reason:</span> <span className="text-danger">{selectedPolicy.rejectionReason}</span></div>
                                        )}
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
                            {selectedPolicy.status?.toLowerCase() === 'approved' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleDownloadPDF(selectedPolicy)}
                                >
                                    📥 Download Policy PDF
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={closeModal}>Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyHistory;
