import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { policyNumber, premium, policyData } = location.state || {};

    useEffect(() => {
        if (!policyNumber) {
            navigate('/profile');
        }
    }, [policyNumber, navigate]);

    if (!policyNumber) {
        return null;
    }

    return (
        <div className="payment-success-page">
            <div className="success-container">
                <div className="success-animation">
                    <div className="checkmark-circle">
                        <div className="checkmark"></div>
                    </div>
                </div>

                <h1 className="success-title">Payment Successful!</h1>
                <p className="success-subtitle">
                    Your cattle insurance policy has been activated
                </p>

                <div className="policy-details-card">
                    <div className="policy-header">
                        <h2>Policy Details</h2>
                        <span className="status-badge active">Active</span>
                    </div>

                    <div className="policy-info">
                        <div className="info-row">
                            <span className="label">Policy Number</span>
                            <span className="value policy-number">{policyNumber}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cattle Type</span>
                            <span className="value">
                                {policyData?.petType === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Tag ID / Name</span>
                            <span className="value">{policyData?.tagId || policyData?.petName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Coverage Amount</span>
                            <span className="value">₹{parseInt(policyData?.coverageAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Annual Premium</span>
                            <span className="value premium">₹{premium?.toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Policy Start Date</span>
                            <span className="value">{new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Policy End Date</span>
                            <span className="value">
                                {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">📧</div>
                            <h4>Check Your Email</h4>
                            <p>Policy documents sent to {policyData?.email}</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">📱</div>
                            <h4>Download Policy</h4>
                            <p>Access your policy from dashboard</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">🏥</div>
                            <h4>Emergency Support</h4>
                            <p>24/7 helpline: 1800-123-4567</p>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <Link to="/profile" state={{ activeTab: 'policies' }} className="btn btn-primary">
                        View My Policies
                    </Link>
                    <Link to="/" className="btn btn-outline">
                        Back to Home
                    </Link>
                </div>

                <div className="download-section">
                    <button className="download-btn">
                        📄 Download Policy Document
                    </button>
                    <button className="download-btn">
                        🖨️ Print Policy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
