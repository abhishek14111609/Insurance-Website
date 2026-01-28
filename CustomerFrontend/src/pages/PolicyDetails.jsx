import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, BASE_URL } from '../services/api.service';
import toast from 'react-hot-toast';
import { TERMS_AND_CONDITIONS, CLAIM_PROCEDURES, EXCLUSIONS } from '../constants/termsAndConditions';
import './PolicyDetails.css';

const PolicyDetails = () => {
    const { policyId } = useParams();
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/policies');
        }
    }, [isAgent, navigate]);
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                setLoading(true);
                const response = await policyAPI.getById(policyId);
                if (response.success) {
                    setPolicy(response.data.policy);
                } else {
                    setError('Policy not found or access denied.');
                }
            } catch (err) {
                console.error("Error fetching policy:", err);
                setError('Failed to load policy details.');
            } finally {
                setLoading(false);
            }
        };

        if (policyId) {
            fetchPolicy();
        }
    }, [policyId]);

    const handleDownload = () => {
        if (policy.documentUrl) {
            const url = `${BASE_URL}/${policy.documentUrl}`;
            window.open(url, '_blank');
        } else {
            toast.error('Policy document is not generated yet.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="policy-details-page">
                <div className="policy-details-container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !policy) {
        return (
            <div className="policy-details-page">
                <div className="policy-details-container" style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>{error || 'Policy not found'}</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/my-policies')}>Back to My Policies</button>
                </div>
            </div>
        );
    }

    // Helper to safely get date
    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-IN');
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div className="policy-details-page">
            <div className="policy-details-container">
                {/* Header */}
                <div className="policy-header-section">
                    <Link to="/my-policies" className="back-link">
                        ← Back to My Policies
                    </Link>
                    <div className="header-content">
                        <div className="header-left">
                            <h1>Cattle Insurance Policy</h1>
                            <p className="policy-number">Policy No: {policy.policyNumber || 'Processing...'}</p>
                        </div>
                        <div className="header-right">
                            <span className={`status-badge ${policy.status.toLowerCase()}`}>
                                {policy.status === 'PENDING_APPROVAL' ? '⏳ Pending Approval' :
                                    policy.status === 'PENDING' ? '🟡 Payment Pending' :
                                        policy.status === 'APPROVED' ? '✓ Active' : policy.status}
                            </span>
                        </div>
                    </div>
                </div>

                {policy.status === 'PENDING' && (
                    <div className="payment-alert" style={{
                        background: '#fff3cd',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #ffc107',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>
                            <strong>Action Required:</strong> Payment is pending for this policy.
                        </span>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/payment', { state: { policyId: policy.id } })}
                        >
                            Complete Payment
                        </button>
                    </div>
                )}

                {/* Policy Document */}
                <div className="policy-document">
                    {/* Company Header */}
                    <div className="document-header">
                        <div className="company-logo">
                            <h2>🛡️ Pashudhan Suraksha</h2>
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
                                <span className="value">{policy.policyNumber || 'Pending'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Start Date:</span>
                                <span className="value">{formatDate(policy.startDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">End Date:</span>
                                <span className="value">{formatDate(policy.endDate)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Duration:</span>
                                <span className="value">{policy.duration}</span>
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
                                <span className="value">{policy.ownerEmail || policy.customerEmail}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Phone:</span>
                                <span className="value">{policy.ownerPhone}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Address:</span>
                                <span className="value">
                                    {policy.ownerAddress}<br />
                                    {policy.ownerCity}, {policy.ownerState} - {policy.ownerPincode}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Cattle Information</h4>
                            <div className="detail-row">
                                <span className="label">Type:</span>
                                <span className="value">
                                    {(policy.cattleType || '').toLowerCase() === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}
                                </span>
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
                                <span className="label">Gender:</span>
                                <span className="value">{policy.gender}</span>
                            </div>
                            {policy.milkYield && (
                                <div className="detail-row">
                                    <span className="label">Milk Yield:</span>
                                    <span className="value">{policy.milkYield} liters/day</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-section">
                            <h4>Coverage Details</h4>
                            <div className="detail-row">
                                <span className="label">Sum Insured:</span>
                                <span className="value premium">₹{parseInt(policy.coverageAmount).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Total Premium:</span>
                                <span className="value premium">₹{parseInt(policy.premium).toLocaleString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Payment Method:</span>
                                <span className="value">{policy.paymentMethod || 'Razorpay'}</span>
                            </div>
                            {policy.paymentId && (
                                <div className="detail-row">
                                    <span className="label">Payment ID:</span>
                                    <span className="value">{policy.paymentId}</span>
                                </div>
                            )}
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
                        <h4>Important Terms & Conditions / મહત્વપૂર્ણ નિયમો અને શરતો</h4>

                        <div style={{ marginBottom: '20px' }}>
                            <h5 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '14px' }}>English Terms:</h5>
                            <ul>
                                {TERMS_AND_CONDITIONS.english.map((term, index) => (
                                    <li key={`en-${index}`}>{term}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h5 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '14px' }}>ગુજરાતીમાં નિયમો:</h5>
                            <ul>
                                {TERMS_AND_CONDITIONS.gujarati.map((term, index) => (
                                    <li key={`gu-${index}`}>{term}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h5 style={{ color: '#16a34a', marginBottom: '10px', fontSize: '14px' }}>Claim Procedures / દાવાની પ્રક્રિયા:</h5>
                            <ul>
                                {CLAIM_PROCEDURES.english.map((proc, index) => (
                                    <li key={`claim-en-${index}`}>{proc}</li>
                                ))}
                                {CLAIM_PROCEDURES.gujarati.map((proc, index) => (
                                    <li key={`claim-gu-${index}`}>{proc}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h5 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '14px' }}>Exclusions / બાકાતો:</h5>
                            <ul>
                                {EXCLUSIONS.english.map((excl, index) => (
                                    <li key={`excl-en-${index}`} style={{ color: '#dc2626' }}>✗ {excl}</li>
                                ))}
                                {EXCLUSIONS.gujarati.map((excl, index) => (
                                    <li key={`excl-gu-${index}`} style={{ color: '#dc2626' }}>✗ {excl}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="document-footer">
                        <p>This is a computer-generated document and does not require a signature.</p>
                        <p><strong>For claims or queries:</strong> Call 1800-123-4567 | Email: claims@securelife.com</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    {policy.status === 'APPROVED' && (
                        <>
                            <button onClick={handleDownload} className="btn btn-primary">
                                📄 Download PDF
                            </button>
                            <button onClick={handlePrint} className="btn btn-outline">
                                🖨️ Print Policy
                            </button>
                        </>
                    )}
                    <Link to="/my-policies" className="btn btn-secondary">
                        Back to My Policies
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetails;
