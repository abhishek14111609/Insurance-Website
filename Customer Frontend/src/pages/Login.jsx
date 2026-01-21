import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/Loader';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    // ... existing state ...
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ... existing useEffect and handlers ...
    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Validate
        if (!formData.email || !formData.password) {
            setError('Please enter both email and password / કૃપા કરીને ઈમેલ અને પાસવર્ડ બંને દાખલ કરો');
            setIsSubmitting(false);
            return;
        }

        try {
            // Use login from AuthContext
            const response = await login({
                email: formData.email,
                password: formData.password
            });

            // Check if user is admin - reject on customer side
            if (response.data?.user?.role === 'admin') {
                setError('Admin accounts cannot login here. Please use the Admin Panel.');
                setIsSubmitting(false);
                return;
            }

            // Dispatch custom event to notify navbar
            window.dispatchEvent(new Event('customerLogin'));

            // Check if user is agent
            if (response.data?.user?.role === 'agent') {
                navigate('/agent/dashboard');
                return;
            }

            // Get the return URL from location state, or default to dashboard
            const from = location.state?.from || '/dashboard';
            navigate(from);
        } catch (error) {
            setError(error.message || 'Login failed. Please check your credentials / લૉગિન નિષ્ફળ. કૃપા કરીને તમારા ઓળખપત્રો તપાસો.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h2>Welcome Back / સ્વાગત છે</h2>
                    <p>Login to access your account / તમારા ખાતામાં પ્રવેશ કરવા માટે લોગિન કરો</p>
                </div>

                {error && (
                    <div className="alert-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address / ઈમેલ સરનામું</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            required
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
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                            />
                            <span>Remember me / મને યાદ રાખો</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            Forgot Password? / પાસવર્ડ ભૂલી ગયા?
                        </Link>
                    </div>

                    <button type="submit" className="login-btn" disabled={isSubmitting}>
                        {isSubmitting && <ButtonLoader />}
                        {isSubmitting ? 'Logging in... / લૉગિન કરી રહ્યું છે...' : 'Login / લૉગિન'}
                    </button>

                    <div className="login-footer">
                        <p>Don't have an account? / ખાતું નથી? <Link to="/register">Sign up / સાઇન અપ કરો</Link></p>
                    </div>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="other-logins">
                    <Link to="/become-agent" className="agent-login-link">
                        Are you an agent? <strong>Login here</strong>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
