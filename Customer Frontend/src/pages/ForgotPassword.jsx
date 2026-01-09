import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Check if email exists
        const users = JSON.parse(localStorage.getItem('customer_users') || '[]');
        const userExists = users.find(u => u.email === email);

        if (!userExists) {
            setError('No account found with this email address');
            return;
        }

        // Simulate sending reset email
        setIsSubmitted(true);
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

                    <button type="submit" className="btn btn-primary btn-block">
                        Send Reset Instructions
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
