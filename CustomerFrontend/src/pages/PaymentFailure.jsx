import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './PaymentFailure.css';

const PaymentFailure = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { reason, premium } = location.state || {};

    useEffect(() => {
        if (!reason) {
            navigate('/animal-insurance');
        }
    }, [reason, navigate]);

    const handleRetry = () => {
        navigate(-1); // Go back to payment page
    };

    if (!reason) {
        return null;
    }

    return (
        <div className="payment-failure-page">
            <div className="failure-container">
                <div className="failure-animation">
                    <div className="error-circle">
                        <div className="error-icon">✕</div>
                    </div>
                </div>

                <h1 className="failure-title">Payment Failed</h1>
                <p className="failure-subtitle">
                    We couldn't process your payment
                </p>

                <div className="error-details-card">
                    <div className="error-icon-large">⚠️</div>
                    <h3>What went wrong?</h3>
                    <p className="error-reason">{reason}</p>

                    <div className="amount-info">
                        <span>Amount:</span>
                        <span className="amount">₹{premium?.toLocaleString()}</span>
                    </div>
                </div>

                <div className="common-issues">
                    <h3>Common Issues</h3>
                    <div className="issues-grid">
                        <div className="issue-card">
                            <div className="issue-icon">💳</div>
                            <h4>Insufficient Balance</h4>
                            <p>Check if you have enough balance in your account</p>
                        </div>
                        <div className="issue-card">
                            <div className="issue-icon">🔒</div>
                            <h4>Card Declined</h4>
                            <p>Your bank may have declined the transaction</p>
                        </div>
                        <div className="issue-card">
                            <div className="issue-icon">📱</div>
                            <h4>OTP Not Entered</h4>
                            <p>Make sure to complete the OTP verification</p>
                        </div>
                        <div className="issue-card">
                            <div className="issue-icon">🌐</div>
                            <h4>Network Issue</h4>
                            <p>Check your internet connection and try again</p>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button onClick={handleRetry} className="btn btn-primary">
                        🔄 Retry Payment
                    </button>
                    <Link to="/animal-insurance" className="btn btn-outline">
                        ← Back to Insurance
                    </Link>
                </div>

                <div className="help-section">
                    <h4>Need Help?</h4>
                    <div className="help-options">
                        <a href="tel:1800-123-4567" className="help-link">
                            📞 Call: 1800-123-4567
                        </a>
                        <a href="mailto:support@pashudhansuraksha.com" className="help-link">
                            ✉️ Email: support@pashudhansuraksha.com
                        </a>
                        <Link to="/contact-us" className="help-link">
                            💬 Live Chat Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
