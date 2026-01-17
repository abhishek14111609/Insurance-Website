import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api.service';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('idle'); // idle | verifying | success | error
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        if (token) {
            verifyToken(token);
        }
    }, [token]);

    const verifyToken = async (verifyTokenValue) => {
        try {
            setStatus('verifying');
            setMessage('Verifying your email...');
            const res = await authAPI.verifyEmail(verifyTokenValue);
            if (res.success) {
                setStatus('success');
                setMessage('Your email has been verified. You can now log in.');
            } else {
                setStatus('error');
                setMessage(res.message || 'Verification failed.');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Verification failed.');
        }
    };

    const resend = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        try {
            setResendStatus('sending');
            setResendMessage('Sending verification email...');
            const res = await authAPI.resendVerification(email.trim());
            setResendStatus('sent');
            setResendMessage(res.message || 'Verification email sent. Check your inbox.');
        } catch (err) {
            setResendStatus('error');
            setResendMessage(err.message || 'Could not send verification email.');
        }
    };

    return (
        <div className="verify-email-page">
            <div className="verify-card">
                <h1>Verify Your Email</h1>
                {token ? (
                    <p className={`status ${status}`}>
                        {status === 'verifying' && 'Verifying...'}
                        {(status === 'success' || status === 'error') && message}
                    </p>
                ) : (
                    <p className="status idle">Enter your email to resend the verification link.</p>
                )}

                {!token && (
                    <form className="resend-form" onSubmit={resend}>
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn" disabled={resendStatus === 'sending'}>
                            {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification'}
                        </button>
                        {resendMessage && <p className={`status ${resendStatus}`}>{resendMessage}</p>}
                    </form>
                )}

                {status === 'success' && (
                    <div className="actions">
                        <Link to="/login" className="link-btn">Go to Login</Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="actions">
                        <Link to="/login" className="link-btn secondary">Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
