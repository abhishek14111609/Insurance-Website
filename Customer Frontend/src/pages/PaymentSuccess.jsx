import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { policyNumber, premium, policyData, paymentId, pendingApproval } = location.state || {};

    useEffect(() => {
        if (!policyNumber) {
            navigate('/profile');
            return;
        }
        // Backend handles policy creation and status updates.
        // No local storage synchronization needed.
    }, [policyNumber, navigate]);

    // Helper to format date safely
    const formatDate = (dateString, fallback = new Date()) => {
        try {
            return new Date(dateString || fallback).toLocaleDateString('en-IN');
        } catch (e) {
            return new Date().toLocaleDateString('en-IN');
        }
    };

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
                    {pendingApproval
                        ? 'Your payment has been received. Policy is pending admin approval.'
                        : 'Your cattle insurance policy has been activated'
                    }
                </p>

                {pendingApproval && (
                    <div className="approval-notice" style={{
                        background: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '8px',
                        padding: '16px',
                        margin: '20px 0',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
                        <h3 style={{ color: '#856404', margin: '0 0 8px 0' }}>Awaiting Admin Approval</h3>
                        <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                            Your policy will be activated once approved by our admin team.
                            You will receive an email notification upon approval.
                        </p>
                    </div>
                )}

                <div className="policy-details-card">
                    <div className="policy-header">
                        <h2>Policy Details</h2>
                        <span className={`status-badge ${pendingApproval ? 'pending' : 'active'}`}>
                            {pendingApproval ? 'Pending Approval' : 'Active'}
                        </span>
                    </div>

                    <div className="policy-info">
                        <div className="info-row">
                            <span className="label">Policy Number</span>
                            <span className="value policy-number">{policyNumber}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Cattle Type</span>
                            <span className="value">
                                {String(policyData?.cattleType || policyData?.petType).toLowerCase() === 'cow' ? '🐄 Cow' : '🐃 Buffalo'}
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
                            <span className="value">{formatDate(policyData?.startDate)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Policy End Date</span>
                            <span className="value">{formatDate(policyData?.endDate)}</span>
                        </div>
                        {paymentId && (
                            <div className="info-row">
                                <span className="label">Payment ID</span>
                                <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                                    {paymentId}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">📧</div>
                            <h4>Check Your Email</h4>
                            <p>{pendingApproval ? 'Approval notification will be sent to' : 'Policy documents sent to'} {policyData?.ownerEmail || policyData?.email || 'your email'}</p>
                        </div>
                        {!pendingApproval && (
                            <div className="step-card">
                                <div className="step-icon">📱</div>
                                <h4>Download Policy</h4>
                                <p>Access your policy from dashboard</p>
                            </div>
                        )}
                        {pendingApproval && (
                            <div className="step-card">
                                <div className="step-icon">⏰</div>
                                <h4>Approval Timeline</h4>
                                <p>Usually processed within 24-48 hours</p>
                            </div>
                        )}
                        <div className="step-card">
                            <div className="step-icon">🏥</div>
                            <h4>Emergency Support</h4>
                            <p>24/7 helpline: 1800-123-4567</p>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <Link to="/my-policies" className="btn btn-primary">
                        View My Policies
                    </Link>
                    <Link to="/" className="btn btn-outline">
                        Back to Home
                    </Link>
                </div>

                {!pendingApproval && (
                    <div className="download-section">
                        <button className="download-btn">
                            📄 Download Policy Document
                        </button>
                        <button className="download-btn">
                            🖨️ Print Policy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
