import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyPlanAPI } from '../services/api.service';
import { isCustomerLoggedIn } from '../utils/authUtils';
import './AnimalInsurance.css';

const AnimalInsurance = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await policyPlanAPI.getAll();
            if (response.success) {
                // Filter only active plans
                const activePlans = (response.data.plans || []).filter(p => p.isActive);
                setPlans(activePlans);
            }
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        if (!isCustomerLoggedIn()) {
            navigate('/login', { state: { from: '/animal-insurance', selectedPlanId: plan.id } });
            return;
        }

        navigate('/animal-policy-form', {
            state: { selectedPlanId: plan.id, planData: plan }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="policies-page">
            {/* Hero Section */}
            <section className="policies-hero">
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-badge">🐄 Cattle Insurance Expert</span>
                        <h1>Protect Your Valuable Livestock</h1>
                        <p className="hero-subtitle">
                            Comprehensive insurance for Cows and Buffaloes. Coverage of up to ₹1,00,000
                            against death due to disease, accidents, and natural calamities.
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <strong style={{ color: 'white', fontSize: '2rem' }}>10,000+</strong>
                                <span style={{ color: 'white' }}>Farmers Protected</span>
                            </div>
                            <div className="stat-item">
                                <strong style={{ color: 'white', fontSize: '2rem' }}>₹5 Cr+</strong>
                                <span style={{ color: 'white' }}>Claims Settled</span>
                            </div>
                            <div className="stat-item">
                                <strong style={{ color: 'white', fontSize: '2rem' }}>7 Days</strong>
                                <span style={{ color: 'white' }}>Claim Settlement</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="plans-section">
                <div className="container">
                    <div className="section-header" style={{ justifyContent: 'center' }} >
                        <h2>Choose Your Protection Plan</h2>
                        {/* <p>Select from our specially designed livestock protection plans.</p> */}
                    </div>

                    {loading ? (
                        <div className="loading-state" style={{ textAlign: 'center', padding: '50px' }}>
                            <div className="spinner"></div>
                            <p>Loading the best plans for you...</p>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '50px' }}>
                            <p>No active plans available at the moment. Please contact support.</p>
                        </div>
                    ) : (
                        <div className="plans-grid">
                            {plans.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((plan) => (
                                <div
                                    key={plan._id}
                                    className={`plan-card ${plan.displayOrder === 1 ? 'recommended' : ''}`}
                                >
                                    {plan.displayOrder === 1 && (
                                        <div className="plan-badge">Most Popular</div>
                                    )}

                                    <div className="plan-header">
                                        <h3>{plan.name}</h3>
                                        <p className="plan-description" style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                                            {plan.description || `Plan for your livestock protection.`}
                                        </p>
                                    </div>

                                    <div className="plan-pricing">
                                        <div className="coverage-amount">
                                            <span className="label">Coverage</span>
                                            <span className="amount">{formatCurrency(plan.coverageAmount)}</span>
                                        </div>
                                        <div className="premium-amount">
                                            <span className="label">Total Premium</span>
                                            <span className="amount">{formatCurrency(plan.premium)}</span>
                                        </div>
                                        <div className="annual-cost" style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>
                                            Duration: {plan.duration}
                                        </div>
                                    </div>

                                    <div className="plan-features">
                                        <ul>
                                            {(plan.features || []).map((feature) => (
                                                <li key={`${plan._id}-${feature.replace(/\s+/g, '-').toLowerCase()}`}>
                                                    <span className="check-icon">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        className={`btn ${plan.displayOrder === 1 ? 'btn-primary' : 'btn-secondary'} btn-block`}
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        Select {plan.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Coverage Details */}
            <section className="coverage-section">
                <div className="container">
                    <h2 className="section-title" style={{ justifyContent: 'center' }}>What's Covered?</h2>
                    <div className="coverage-grid">
                        <div className="coverage-box covered">
                            <h3>✓ Covered</h3>
                            <ul>
                                <li>Accidental Death (Rail/Road/Drowning)</li>
                                <li>Common Diseases (FMD, HS, BQ, etc.)</li>
                                <li>Natural Calamities (Flood, Storm, etc.)</li>
                                <li>Lightning & Earthquake</li>
                                <li>Surgical Operations</li>
                                <li>Poisoning & Snake Bite</li>
                                <li>Permanent Total Disability (PTD)</li>
                                <li>Strike, Riot & Civil Commotion</li>
                            </ul>
                        </div>
                        <div className="coverage-box not-covered">
                            <h3>✗ Not Covered</h3>
                            <ul>
                                <li>Theft & Clandestine Sale</li>
                                <li>Intentional Slaughter</li>
                                <li>Malicious Injury by Owner</li>
                                <li>Pre-existing Disabilities</li>
                                <li>Death within 15 days of policy start</li>
                                <li>No Ear Tag Available</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works-section">
                <div className="container">
                    <h2 className="section-title" style={{ justifyContent: 'center' }}>How It Works</h2>
                    <br />
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon">📋</div>
                            <h3>Select Plan</h3>
                            <p>Choose the plan duration that suits your needs</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon">📝</div>
                            <h3>Fill Details</h3>
                            <p>Provide cattle information and upload 4 photos</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon">💳</div>
                            <h3>Make Payment</h3>
                            <p>Secure payment through Razorpay gateway</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">4</div>
                            <div className="step-icon">✅</div>
                            <h3>Get Approved</h3>
                            <p>Admin reviews and approves your policy</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Secure Your Livelihood Today</h2>
                        <p>Join thousands of farmers who trust Pashudhan Suraksha for their cattle insurance</p>
                        <button style={{ color: 'white', border: "8px solid white", fontSize: '20px' }}
                            className="btn btn-outline btn-large"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            Choose Your Plan
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AnimalInsurance;
