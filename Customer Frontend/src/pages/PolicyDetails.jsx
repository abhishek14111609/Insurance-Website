import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomerPolicies } from '../utils/authUtils';
import './PolicyDetails.css';

const PolicyDetails = () => {
    const { policyId } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        const policies = getCustomerPolicies();
        const foundPolicy = policies.find(p => p.id === parseInt(policyId));

        if (!foundPolicy) {
            navigate('/profile');
        } else {
            setPolicy(foundPolicy);
        }
    }, [policyId, navigate]);

    const handleDownload = () => {
        alert('Policy PDF download will be available soon!');
    };

    const handlePrint = () => {
        window.print();
    };

    if (!policy) {
        return null;
    }

    return (
        <div className="policy-details-page">
            <div className="policy-details-container">
                {/* Header */}
                <div className="policy-header-section">
                    <Link to="/profile" state={{ activeTab: 'policies' }} className="back-link">
                        ← Back to My Policies
                    </Link>
                    <div className="header-content">
                        <div className="header-left">
                            <h1>Cattle Insurance Policy</h1>
                            <p className="policy-number">Policy No: {policy.policyNumber}</p>
                        </div>
                        <div className="header-right">
                            <span className={`status-badge ${policy.status}`}>
                                {policy.status === 'active' ? '✓ Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Policy Document */}
                <div className="policy-document">
                    {/* Company Header */}
                    <div className="document-header">
                        <div className="company-logo">
                            <h2>🛡️ SecureLife Insurance</h2>
                            <p>IRDAI Reg. No: IRDA/NL-HLT/2024/001</p>
                        </div>
                        <div className="document-title">
                            <h3>Cattle Insurance Policy</h3>
                            <p>Certificate of Insurance</p>
                        </div>
                    </div>

                    {/* Policy Details Grid */}
                    <div className="details-grid">
                        <div className="detail-section">
                            <h4>Policy Information</h4>
                            <div className="detail-row">
                                <span className="label">Policy Number:</span>
                                <span className="value">{policy.policyNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Issue Date:</span>
                                <span className="value">{new Date(policy.purchaseDate).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Start Date:</span>
                                <span className="value">{new Date(policy.startDate || policy.purchaseDate).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Expiry Date:</span>
                                <span className="value">
                                    {new Date(new Date(policy.purchaseDate).setFullYear(new Date(policy.purchaseDate).getFullYear() + 1)).toLocaleDateString('en-IN')}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className="value status">{policy.status}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Insured Details</h4>
                            <div className="detail-row">
                                <span className="label">Owner Name:</span>
                                <span className="value">{policy.ownerName}</span>
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
                                <span className="label">Address:</span>
                                <span className="value">{policy.address}, {policy.city} - {policy.pincode}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Cattle Information</h4>
                            <div className="detail-row">
                                <span className="label">Type:</span>
                                <span className="value">
                                    {policy.petType === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Tag ID:</span>
                                <span className="value">{policy.tagId || policy.petName || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Age:</span>
                                <span className="value">{policy.petAge} years</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Breed:</span>
                                <span className="value">{policy.petBreed}</span>
                            </div>
                            {policy.milkYield && (
                                <div className="detail-row">
                                    <span className="label">Milk Yield:</span>
                                    <span className="value">{policy.milkYield} liters/day</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="label">Gender:</span>
                                <span className="value">{policy.petGender}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Coverage Details</h4>
                            <div className="detail-row">
                                <span className="label">Sum Insured:</span>
                                <span className="value premium">₹{parseInt(policy.coverageAmount).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Annual Premium:</span>
                                <span className="value premium">₹{policy.premium?.toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Payment Method:</span>
                                <span className="value">{policy.paymentMethod || 'Card'}</span>
                            </div>
                            {policy.agentCode && (
                                <div className="detail-row">
                                    <span className="label">Agent Code:</span>
                                    <span className="value">{policy.agentCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coverage Information */}
                    <div className="coverage-section">
                        <h4>What's Covered</h4>
                        <div className="coverage-grid">
                            <div className="coverage-item">
                                <span className="check">✓</span>
                                <span>Death due to Disease (HS, BQ, FMD)</span>
                            </div>
                            <div className="coverage-item">
                                <span className="check">✓</span>
                                <span>Accidental Death</span>
                            </div>
                            <div className="coverage-item">
                                <span className="check">✓</span>
                                <span>Natural Calamities</span>
                            </div>
                            <div className="coverage-item">
                                <span className="check">✓</span>
                                <span>Permanent Total Disability</span>
                            </div>
                            <div className="coverage-item">
                                <span className="check">✓</span>
                                <span>Snake Bite</span>
                            </div>
                            <div className="coverage-item">
                                <span className="check">✓</span>
                                <span>Drowning</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="terms-section">
                        <h4>Important Terms & Conditions</h4>
                        <ul>
                            <li>This policy is valid for 12 months from the start date.</li>
                            <li>Claims must be reported within 24 hours of incident.</li>
                            <li>Post-mortem report is mandatory for death claims.</li>
                            <li>The insured animal must be healthy at the time of policy issuance.</li>
                            <li>Premium is non-refundable once the policy is active.</li>
                            <li>Renewal must be done before expiry to avoid lapse.</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="document-footer">
                        <p>This is a computer-generated document and does not require a signature.</p>
                        <p><strong>For claims or queries:</strong> Call 1800-123-4567 | Email: claims@securelife.com</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button onClick={handleDownload} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                    <button onClick={handlePrint} className="btn btn-outline">
                        🖨️ Print Policy
                    </button>
                    <Link to="/profile" state={{ activeTab: 'policies' }} className="btn btn-secondary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetails;
