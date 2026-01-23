import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AgentPublic.css';

const AgentLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login({
                email: credentials.email,
                password: credentials.password
            });

            if (result.success) {
                // Check role from response data structure
                const user = result.data.user;
                const agentProfile = result.data.agentProfile;

                if (user && user.role === 'agent') {
                    // Check agent status from agent profile
                    if (agentProfile) {
                        if (agentProfile.status === 'pending') {
                            setError('Your agent account is pending approval. (Admin: Please approve in Admin Panel)');
                            return;
                        }
                        if (agentProfile.status === 'rejected') {
                            setError('Your agent application was not approved. Please contact support.');
                            return;
                        }
                    }
                    navigate('/agent/dashboard');
                } else {

                    localStorage.removeItem('customer:auth_user'); // Clear storage
                    window.location.reload(); // Hard reload to clear context
                    setError('This account is not registered as an agent.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-login-page">
            <div className="login-card animate-fade-in">
                <div className="login-header">
                    <span className="brand-badge">Partner Portal</span>
                    <h1>Agent Login</h1>
                    <p>Access your dashboard to manage policies</p>
                </div>

                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="agent@pashudhansuraksha.com"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group mb-6">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Secure Login'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-muted">
                            Not a partner yet? <Link to="/become-agent" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Join Network</Link>
                        </p>
                        <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                            Need the verification email again? <Link to="/verify-email" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Resend</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentLogin;
