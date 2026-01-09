import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AgentCodeInput from '../../components/AgentCodeInput';
import {
    findAgentByCode,
    generateAgentCode,
    getNextSequence,
    getCommissionRate
} from '../../utils/agentUtils';
import './AgentPublic.css';

const AgentLanding = () => {
    const [activeTab, setActiveTab] = useState('register');
    const [submitted, setSubmitted] = useState(false);
    const [registrationData, setRegistrationData] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        parentAgentCode: ''
    });

    // Login State
    const navigate = useNavigate();
    const location = useLocation();
    const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (location.hash === '#login') {
            setActiveTab('login');
            const form = document.getElementById('auth-form');
            if (form) form.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    const handleRegister = (e) => {
        e.preventDefault();

        // Determine parent agent and level
        let parentAgent = null;
        let newLevel = 1;
        let newCode = '';

        if (registrationData.parentAgentCode) {
            parentAgent = findAgentByCode(registrationData.parentAgentCode);
            if (!parentAgent) {
                alert('Invalid parent agent code!');
                return;
            }
            newLevel = parentAgent.level + 1;
            if (newLevel > 3) {
                alert('Maximum hierarchy depth (3 levels) reached! Cannot add more sub-agents.');
                return;
            }
            const sequence = getNextSequence(parentAgent.code);
            newCode = generateAgentCode(parentAgent.code, sequence);
        } else {
            // Top-level agent
            const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
            const topLevelAgents = allAgents.filter(a => a.level === 1);
            const sequence = topLevelAgents.length + 1;
            newCode = generateAgentCode(null, sequence);
        }

        // Save registration data
        const newAgent = {
            id: `agent-${Date.now()}`,
            code: newCode,
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone,
            city: registrationData.city,
            parentId: parentAgent ? parentAgent.id : null,
            level: newLevel,
            commissionRate: getCommissionRate(newLevel),
            walletBalance: 0,
            totalEarnings: 0,
            customersCount: 0,
            policiesSold: 0,
            joinedDate: new Date().toISOString(),
            status: 'pending' // Admin approval required
        };

        const allAgents = JSON.parse(localStorage.getItem('agent_hierarchy') || '[]');
        allAgents.push(newAgent);
        localStorage.setItem('agent_hierarchy', JSON.stringify(allAgents));

        // Store generated code for display
        localStorage.setItem('pending_agent_code', newCode);

        setSubmitted(true);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulated Authentication
        if (loginCredentials.email === 'agent@securelife.com' && loginCredentials.password === 'agent123') {
            // Store logged-in agent data
            const agentData = {
                id: 'agent-1',
                code: 'AG001',
                name: 'Rajesh Kumar',
                email: 'agent@securelife.com',
                level: 1,
                commissionRate: 15
            };
            localStorage.setItem('current_agent', JSON.stringify(agentData));
            navigate('/agent/dashboard');
        } else {
            setLoginError('Invalid credentials. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegistrationData({ ...registrationData, [name]: value });
    };

    return (
        <div className="agent-landing">
            {/* Hero Section */}
            <section className="agent-hero">
                <div className="agent-hero-content animate-fade-in">
                    <span className="brand-badge">Join Our Network</span>
                    <h1>Become a Certified POSP Agent</h1>
                    <p>Start your journey with SecureLife today. Zero investment, unlimited earning potential, and complete training support.</p>
                    <button className="btn btn-secondary" onClick={() => document.getElementById('register-form').scrollIntoView({ behavior: 'smooth' })}>
                        Register Now
                    </button>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="section">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Why Partner With Us?</h2>
                        <p className="section-subtitle">Join thousands of successful agents who trust SecureLife</p>
                    </div>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <span className="benefit-icon">💰</span>
                            <h3>High Commissions</h3>
                            <p>Earn industry-leading commission rates on every policy you sell.</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">🎓</span>
                            <h3>Free Training</h3>
                            <p>Get certified with our comprehensive online training modules.</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">📱</span>
                            <h3>Digital Portal</h3>
                            <p>Manage customers and policies with our state-of-the-art app.</p>
                        </div>
                        <div className="benefit-card">
                            <span className="benefit-icon">🎁</span>
                            <h3>Rewards</h3>
                            <p>Win exciting rewards and international trips on hitting targets.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authentication Section */}
            <section className="registration-section" id="auth-form">
                <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="registration-card animate-fade-in">
                        <div className="auth-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                                onClick={() => setActiveTab('register')}
                            >
                                Register New Agent
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                                onClick={() => setActiveTab('login')}
                            >
                                Agent Login
                            </button>
                        </div>

                        {activeTab === 'register' && (
                            !submitted ? (
                                <>
                                    <div className="form-header">
                                        <h2>Start Your Application</h2>
                                        <p className="text-muted">Fill in your details to get started</p>
                                    </div>
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
                                            label="Parent Agent Code (Optional)"
                                            required={false}
                                        />

                                        <button type="submit" className="btn btn-primary btn-block w-full">
                                            Submit Application
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
                                            {localStorage.getItem('pending_agent_code')}
                                        </div>
                                        <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                            Save this code for future reference
                                        </div>
                                    </div>
                                    <p>Thank you for your interest. Our team will verify your details and contact you within 24 hours.</p>
                                    <button className="btn btn-outline text-primary border-primary mt-4" onClick={() => setSubmitted(false)}>
                                        Start New Application
                                    </button>
                                </div>
                            )
                        )}

                        {activeTab === 'login' && (
                            <>
                                <div className="form-header">
                                    <h2>Welcome Back</h2>
                                    <p className="text-muted">Access your partner dashboard</p>
                                </div>
                                {loginError && (
                                    <div className="alert-error" style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                                        {loginError}
                                    </div>
                                )}
                                <form onSubmit={handleLogin}>
                                    <div className="form-group mb-4">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="agent@securelife.com"
                                            value={loginCredentials.email}
                                            onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-6">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginCredentials.password}
                                            onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }}>
                                        Secure Login
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AgentLanding;
