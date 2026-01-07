import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('Customer');
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Mock Authentication
        console.log('Logging in as:', userType, formData);

        // Simulate API delay
        setTimeout(() => {
            // Note: In a real environment, you would receive a JWT token here and store it.
            // For cross-project usage (since these are on different ports), you should use HTTP-only cookies
            // or pass the token via URL (less secure) or assume shared local storage if on same domain.

            // Redirect Logic based on User Type
            // Ports are configured in vite.config.js:
            // Customer: 5173
            // Admin: 5174
            // Agent: 5175

            switch (userType) {
                case 'Admin':
                    // Redirect to Admin Portal
                    navigate("/health-insurance")
                    break;
                case 'Agent':
                    // Redirect to Agent Portal
                    navigate("health-insurance")
                    break;
                case 'Customer':
                    // Navigate internally
                    navigate('/');
                    break;
                default:
                    alert('Invalid User Type');
            }
        }, 1000);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Please login to your account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userType">Login As</label>
                        <select
                            id="userType"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="form-select"
                        >
                            <option value="Customer">Customer</option>
                            <option value="Agent">Agent</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username / Email</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="login-btn">
                        Login
                    </button>

                    <div className="login-footer">
                        <p>Don't have an account? <a href="#">Sign up</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
