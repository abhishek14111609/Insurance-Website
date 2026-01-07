import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AgentPublic.css';

const AgentLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulated Authentication
        if (credentials.email === 'agent@securelife.com' && credentials.password === 'agent123') {
            navigate('/agent/dashboard');
        } else {
            setError('Invalid credentials. Please try again.');
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
                    <div className="alert-error" style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="agent@securelife.com"
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

                    <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }}>
                        Secure Login
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-muted">
                            Not a partner yet? <Link to="/become-agent" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Join Network</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentLogin;
