import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoader } from '../../components/Loader';
import './AdminLogin.css';

const AdminLogin = () => {
    // ... existing setup ...
    const navigate = useNavigate();
    const { login } = useAuth();
    // ... existing state ...
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
            setError('Please enter both username and password / કૃપા કરીને વપરાશકર્તા નામ અને પાસવર્ડ બંને દાખલ કરો');
            setIsSubmitting(false);
            return;
        }

        try {
            // Map username to email if needed
            let loginEmail = formData.username;
            if (loginEmail === 'admin') {
                loginEmail = 'admin@insurance.com';
            } else if (!loginEmail.includes('@')) {
                loginEmail = `${loginEmail}@insurance.com`;
            }

            const response = await login({
                email: loginEmail,
                password: formData.password
            });

            if (response && response.success) {
                // Navigate to dashboard - no localStorage needed!
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials / લૉગિન નિષ્ફળ. કૃપા કરીને તમારા ઓળખપત્રો તપાસો.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="logo">🛡️</div>
                    <h1>Pashudhan Suraksha Admin <br /> પશુધન સુરક્ષા એડમિન</h1>
                    <p>Sign in to access the admin panel / એડમિન પેનલ ઍક્સેસ કરવા માટે સાઇન ઇન કરો</p>
                </div>

                {error && (
                    <div className="alert-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Email or Username / ઈમેલ અથવા વપરાશકર્તા નામ</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="admin@insurance.com or just 'admin'"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password / પાસવર્ડ</label>
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
                        {isSubmitting && <ButtonLoader />}
                        {isSubmitting ? 'Signing in... / સાઇન ઇન કરી રહ્યું છે...' : 'Sign In / સાઇન ઇન કરો'}
                    </button>
                </form>

                <div className="login-footer">
                    {import.meta.env.DEV && (
                        <p className="demo-credentials">
                            <strong>Demo Credentials:</strong><br />
                            Email: admin@insurance.com (or type "admin")<br />
                            Password: admin123
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
