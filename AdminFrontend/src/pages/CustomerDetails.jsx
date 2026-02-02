import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI, BASE_URL } from '../services/api.service';
import './CustomerDetails.css';

const CustomerDetails = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const [kycActionLoading, setKycActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const handleVerifyKyc = async (status) => {
        if (!window.confirm(`Are you sure you want to ${status} this user's KYC?`)) return;

        try {
            setKycActionLoading(true);
            const response = await adminAPI.updateUserKycStatus(id, status);
            if (response.success) {
                alert(`KYC ${status} successfully!`);
                loadData();
            }
        } catch (error) {
            console.error('Error updating KYC status:', error);
            alert('Failed to update KYC status');
        } finally {
            setKycActionLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getCustomerById(id);
            if (response.success) {
                setCustomer(response.data.customer);
            }
        } catch (error) {
            console.error('Error loading customer details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div>Loading...</div>;
    if (!customer) return <div className="error-message">Customer not found</div>;

    return (
        <div className="customer-details-page">
            <div className="page-header">
                <div>
                    <h1>👤 Customer Details</h1>
                    <p>#{customer.id} - {customer.fullName}</p>
                </div>
                <Link to="/customers" className="btn btn-secondary">
                    Back to List
                </Link>
            </div>

            <div className="details-grid">
                <div className="detail-card">
                    <h3>Contact Information</h3>
                    <div className="detail-row">
                        <span className="label">Full Name:</span>
                        <span className="value">{customer.fullName}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">{customer.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Phone:</span>
                        <span className="value">{customer.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Joined:</span>
                        <span className="value">{new Date(customer.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Location Details</h3>
                    <div className="detail-row">
                        <span className="label">Address:</span>
                        <span className="value">{customer.address || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">City:</span>
                        <span className="value">{customer.city || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">State:</span>
                        <span className="value">{customer.state || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Pincode:</span>
                        <span className="value">{customer.pincode || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="details-grid" style={{ marginTop: '20px' }}>
                <div className="detail-card">
                    <h3>Identity Proof (KYC)</h3>
                    <div className="detail-row">
                        <span className="label">KYC Status:</span>
                        <span className={`status-badge ${customer.kycDetails?.status}`}>
                            {customer.kycDetails?.status?.toUpperCase() || 'NOT SUBMITTED'}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="label">PAN Number:</span>
                        <span className="value">{customer.kycDetails?.panNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-row" style={{ alignItems: 'flex-start' }}>
                        <span className="label">PAN Photo:</span>
                        <span className="value">
                            {customer.kycDetails?.panPhoto ? (
                                <a href={`${BASE_URL}/${customer.kycDetails.panPhoto}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                                    <img src={`${BASE_URL}/${customer.kycDetails.panPhoto}`}
                                        style={{ height: '80px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee', background: '#f8f9fa' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📄 View Document'; }}
                                        alt="PAN Doc" />
                                </a>
                            ) : <span className="text-muted">Not Uploaded</span>}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Aadhar Number:</span>
                        <span className="value">{customer.kycDetails?.aadharNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-row" style={{ alignItems: 'flex-start' }}>
                        <span className="label">Aadhar Front:</span>
                        <span className="value">
                            {customer.kycDetails?.aadharPhotoFront ? (
                                <a href={`${BASE_URL}/${customer.kycDetails.aadharPhotoFront}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                                    <img src={`${BASE_URL}/${customer.kycDetails.aadharPhotoFront}`}
                                        style={{ height: '80px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee', background: '#f8f9fa' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📄 View Document'; }}
                                        alt="Aadhar Front" />
                                </a>
                            ) : <span className="text-muted">Not Uploaded</span>}
                        </span>
                    </div>
                    <div className="detail-row" style={{ alignItems: 'flex-start' }}>
                        <span className="label">Aadhar Back:</span>
                        <span className="value">
                            {customer.kycDetails?.aadharPhotoBack ? (
                                <a href={`${BASE_URL}/${customer.kycDetails.aadharPhotoBack}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                                    <img src={`${BASE_URL}/${customer.kycDetails.aadharPhotoBack}`}
                                        style={{ height: '80px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee', background: '#f8f9fa' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📄 View Document'; }}
                                        alt="Aadhar Back" />
                                </a>
                            ) : <span className="text-muted">Not Uploaded</span>}
                        </span>
                    </div>

                    {customer.kycDetails?.status === 'pending' && (
                        <div className="action-buttons" style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleVerifyKyc('verified')}
                                disabled={kycActionLoading}
                            >
                                ✅ Approve KYC
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleVerifyKyc('rejected')}
                                disabled={kycActionLoading}
                            >
                                ❌ Reject KYC
                            </button>
                        </div>
                    )}
                </div>

                <div className="detail-card">
                    <h3>Bank Details</h3>
                    <div className="detail-row">
                        <span className="label">Bank Name:</span>
                        <span className="value">{customer.bankDetails?.bankName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Account Holder:</span>
                        <span className="value">{customer.bankDetails?.accountHolderName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Account Number:</span>
                        <span className="value">{customer.bankDetails?.accountNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">IFSC Code:</span>
                        <span className="value">{customer.bankDetails?.ifscCode || 'N/A'}</span>
                    </div>
                    <div className="detail-row" style={{ alignItems: 'flex-start' }}>
                        <span className="label">Bank Proof:</span>
                        <span className="value">
                            {customer.bankDetails?.bankProofPhoto ? (
                                <a href={`${BASE_URL}/${customer.bankDetails.bankProofPhoto}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                                    <img src={`${BASE_URL}/${customer.bankDetails.bankProofPhoto}`}
                                        style={{ height: '80px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee', background: '#f8f9fa' }}
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📄 View Document'; }}
                                        alt="Bank Proof" />
                                </a>
                            ) : <span className="text-muted">Not Uploaded</span>}
                        </span>
                    </div>
                </div>
            </div>

            <div className="activity-sections">
                <div className="detail-card">
                    <h3>Insurance Policies ({customer.policies?.length || 0})</h3>
                    {!customer.policies || customer.policies.length === 0 ? (
                        <p className="empty-state">No policies found.</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Policy #</th>
                                        <th>Cattle</th>
                                        <th>Premium</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.policies.map(policy => {
                                        const policyId = policy._id || policy.id;
                                        return (
                                            <tr key={policyId}>
                                                <td>{policy.policyNumber}</td>
                                                <td>{policy.cattleType}</td>
                                                <td>₹{parseFloat(policy.premium).toLocaleString()}</td>
                                                <td><span className={`status-badge ${policy.status.toLowerCase()}`}>{policy.status}</span></td>
                                                <td><Link to="/policy-approvals" className="btn-link">View</Link></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="detail-card">
                    <h3>Claims ({customer.claims?.length || 0})</h3>
                    {!customer.claims || customer.claims.length === 0 ? (
                        <p className="empty-state">No claims found.</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.claims.map(claim => {
                                        const claimId = claim._id || claim.id;
                                        return (
                                            <tr key={claimId}>
                                                <td>#{claimId}</td>
                                                <td>₹{parseFloat(claim.claimAmount).toLocaleString()}</td>
                                                <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                                                <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CustomerDetails;
