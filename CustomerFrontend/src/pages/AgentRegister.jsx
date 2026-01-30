import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { agentAPI } from '../services/api.service';
import AgentCodeInput from '../components/AgentCodeInput';
import './AgentPublic.css';

const AgentRegister = () => {
    const [submitted, setSubmitted] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        parentAgentCode: ''
    });
    const [registeredAgentCode, setRegisteredAgentCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Handle referral link
        const refCode = searchParams.get('ref');
        if (refCode) {
            setRegistrationData(prev => ({ ...prev, parentAgentCode: refCode }));
            // Wait for DOM to update then scroll
            setTimeout(() => {
                const form = document.getElementById('auth-form');
                if (form) form.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [searchParams]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (registrationData.password !== registrationData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (registrationData.phone.length !== 10) {
            setError('Mobile number must be 10 digits');
            return;
        }

        setLoading(true);

        try {
            const response = await agentAPI.register({
                fullName: registrationData.name,
                email: registrationData.email,
                phone: registrationData.phone,
                password: registrationData.password,
                city: registrationData.city,
                referredByCode: registrationData.parentAgentCode
            });

            if (response.success) {
                // If API returns created agent details usually
                if (response.data && response.data.agentCode) {
                    setRegisteredAgentCode(response.data.agentCode);
                }
                setSubmitted(true);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Redirect to remote login
    const handleLoginRedirect = () => {
        // In production this URL should be dynamic or environment based
        window.location.href = 'http://localhost:5176/login';
         window.location.href = 'https://agent.pashudhansuraksha.com/login';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegistrationData({ ...registrationData, [name]: value });
    };

    return (
        <div className="agent-landing">
            <section className="registration-section" id="auth-form">
                <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="registration-card animate-fade-in">

                        {!submitted ? (
                            <>
                                <div className="form-header">
                                    <h2>Start Your Application</h2>
                                    <p className="text-muted">Fill in your details to get started</p>
                                </div>

                                {error && <div className="alert-error">{error}</div>}

                                <form onSubmit={handleRegister} className="agent-form" id="register-form">
                                    <div className="form-group mb-3">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={registrationData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Mobile Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={registrationData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter mobile number"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={registrationData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={registrationData.password}
                                            onChange={handleInputChange}
                                            placeholder="Create a password"
                                            minLength="6"
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>Confirm Password *</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={registrationData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm password"
                                            minLength="6"
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-4">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={registrationData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter your city"
                                            required
                                        />
                                    </div>

                                    {/* Parent Agent Code */}
                                    <AgentCodeInput
                                        value={registrationData.parentAgentCode}
                                        onChange={(value) => setRegistrationData({ ...registrationData, parentAgentCode: value })}
                                        label="Referral Agent Code (Optional)"
                                        required={false}
                                    />

                                    <button type="submit" className="btn btn-primary btn-block w-full" disabled={loading}>
                                        {loading ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="success-message">
                                <span className="success-icon">✅</span>
                                <h2>Application Received!</h2>
                                <div style={{
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    margin: '1.5rem 0',
                                    border: '2px solid #3b82f6'
                                }}>
                                    <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                        Your Agent Code
                                    </div>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        color: 'var(--primary-color)',
                                        fontFamily: 'monospace',
                                        letterSpacing: '3px'
                                    }}>
                                        {registeredAgentCode || 'PENDING'}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                        Wait for admin approval to activate account
                                    </div>
                                </div>
                                <p>Thank you for your interest. Our team will verify your details and approve your account shortly.</p>
                                <button
                                    className="btn btn-outline text-primary border-primary mt-4"
                                    onClick={handleLoginRedirect}
                                >
                                    Go to Login Portal
                                </button>
                            </div>
                        )
                        }
                    </div>
                </div>
            </section>

            {/* Hero Section */}
            <section className="agent-hero">
                <div className="agent-hero-content animate-fade-in">
                    <span className="brand-badge">Join Our Network</span>
                    <h1>Become a Certified POSP Agent</h1>
                    <p>Start your journey with Pashudhan Suraksha today. Zero investment, unlimited earning potential, and complete training support.</p>
                    <button className="btn btn-secondary" onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}>
                        Register Now
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AgentRegister;
