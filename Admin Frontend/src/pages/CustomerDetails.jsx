import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../services/api.service';
import './CustomerDetails.css';

const CustomerDetails = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

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

            <div className="activity-sections">
                <div className="detail-card">
                    <h3>Policies ({customer.policies?.length || 0})</h3>
                    {customer.policies?.length === 0 ? (
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
                                    {customer.policies.map(policy => (
                                        <tr key={policy.id}>
                                            <td>{policy.policyNumber}</td>
                                            <td>{policy.cattleType}</td>
                                            <td>₹{parseFloat(policy.premium).toLocaleString()}</td>
                                            <td><span className={`status-badge ${policy.status.toLowerCase()}`}>{policy.status}</span></td>
                                            <td><Link to="/policy-approvals" className="btn-link">View</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="detail-card">
                    <h3>Claims ({customer.claims?.length || 0})</h3>
                    {customer.claims?.length === 0 ? (
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
                                    {customer.claims.map(claim => (
                                        <tr key={claim.id}>
                                            <td>#{claim.id}</td>
                                            <td>₹{parseFloat(claim.claimAmount).toLocaleString()}</td>
                                            <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                                            <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
