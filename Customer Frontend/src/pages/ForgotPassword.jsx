import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api.service';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            // Call backend API
            await authAPI.forgotPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="forgot-password-page">
                <div className="forgot-password-container">
                    <div className="success-message">
                        <div className="success-icon">✉️</div>
                        <h2>Check Your Email</h2>
                        <p>We've sent password reset instructions to:</p>
                        <div className="email-display">{email}</div>
                        <p className="note">
                            If you don't receive an email within a few minutes, please check your spam folder.
                        </p>
                        <Link to="/login" className="btn btn-primary">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <div className="forgot-password-header">
                    <h2>Forgot Password?</h2>
                    <p>Enter your email address and we'll send you instructions to reset your password</p>
                </div>

                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                <form className="forgot-password-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                    </button>

                    <div className="form-footer">
                        <Link to="/login" className="back-link">
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
