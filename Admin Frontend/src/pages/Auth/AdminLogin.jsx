import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api.service';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            setIsSubmitting(false);
            return;
        }

        try {
            // Note: Backend expects 'email' not 'username', but we can check if username is email
            // If user enters 'admin', we might need to map it to 'admin@securelife.com' or modify backend to accept username.
            // For now, let's assume username field accepts email.
            // If the user enters 'admin', and backend only takes email, it will fail.
            // The seeds created 'admin@securelife.com'.
            // I'll assume the user enters the email or I'll handle simple 'admin' alias here.

            let loginIdentifier = formData.username;
            if (loginIdentifier === 'admin') {
                loginIdentifier = 'admin@securelife.com';
            }

            const result = await authAPI.login({
                email: loginIdentifier,
                password: formData.password
            });

            if (result.success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="logo">🛡️</div>
                    <h1>SecureLife Admin</h1>
                    <p>Sign in to access the admin panel</p>
                </div>

                {error && (
                    <div className="alert-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Email or Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter email (admin@securelife.com)"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="demo-credentials">
                        <strong>Demo Credentials:</strong><br />
                        Email: admin@securelife.com (or admin)<br />
                        Password: admin123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
