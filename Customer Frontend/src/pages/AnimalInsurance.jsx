import { useNavigate } from 'react-router-dom';
import { POLICY_PLANS, formatCurrency } from '../constants/policyPlans';
import { isCustomerLoggedIn } from '../utils/authUtils';
import './AnimalInsurance.css';

const AnimalInsurance = () => {
    const navigate = useNavigate();

    const handleSelectPlan = (plan) => {
        // Check login before proceeding
        if (!isCustomerLoggedIn()) {
            navigate('/login', { state: { from: '/policies', selectedPlan: plan } });
            return;
        }

        // Navigate to policy form with selected plan
        navigate('/animal-policy-form', {
            state: { selectedPlan: plan }
        });
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
                            Comprehensive insurance for Cows and Buffaloes. Coverage of ₹50,000
                            against death due to disease, accidents, and natural calamities.
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <strong>10,000+</strong>
                                <span>Farmers Protected</span>
                            </div>
                            <div className="stat-item">
                                <strong>₹5 Cr+</strong>
                                <span>Claims Settled</span>
                            </div>
                            <div className="stat-item">
                                <strong>7 Days</strong>
                                <span>Claim Settlement</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section className="plans-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Choose Your Protection Plan</h2>
                        <p>All plans provide ₹50,000 coverage. Select the duration that suits you best.</p>
                    </div>

                    <div className="plans-grid">
                        {POLICY_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`plan-card ${plan.recommended ? 'recommended' : ''}`}
                            >
                                {plan.badge && (
                                    <div className="plan-badge">{plan.badge}</div>
                                )}

                                <div className="plan-header">
                                    <h3>{plan.duration}</h3>
                                    <p className="plan-description">{plan.description}</p>
                                </div>

                                <div className="plan-pricing">
                                    <div className="coverage-amount">
                                        <span className="label">Coverage</span>
                                        <span className="amount">{formatCurrency(plan.coverage)}</span>
                                    </div>
                                    <div className="premium-amount">
                                        <span className="label">Total Premium</span>
                                        <span className="amount">{formatCurrency(plan.premium)}</span>
                                    </div>
                                    <div className="annual-cost">
                                        <span>{formatCurrency(plan.annualCost)}/year</span>
                                    </div>
                                    {plan.savings && (
                                        <div className="savings-badge">
                                            Save {formatCurrency(plan.savings)}
                                        </div>
                                    )}
                                </div>

                                <div className="plan-features">
                                    <ul>
                                        {plan.features.map((feature, index) => (
                                            <li key={index}>
                                                <span className="check-icon">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className={`btn ${plan.recommended ? 'btn-primary' : 'btn-secondary'} btn-block`}
                                    onClick={() => handleSelectPlan(plan)}
                                >
                                    Select {plan.duration} Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coverage Details */}
            <section className="coverage-section">
                <div className="container">
                    <h2 className="section-title">What's Covered?</h2>
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
                    <h2 className="section-title">How It Works</h2>
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

            {/* Why Choose Us */}
            <section className="benefits-section">
                <div className="container">
                    <h2 className="section-title">Why Insure with SecureLife?</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">🏥</div>
                            <h3>Pan-India Network</h3>
                            <p>Tie-up with government and private veterinary hospitals</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">⚡</div>
                            <h3>Fastest Claims</h3>
                            <p>Direct bank transfer within 7 days of claim approval</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">🏷️</div>
                            <h3>Easy Tagging</h3>
                            <p>RFID tagging support through our authorized agents</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">💰</div>
                            <h3>Affordable Rates</h3>
                            <p>Best prices with transparent pricing - no hidden charges</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="container">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>What documents are required?</h4>
                            <p>You need 4 clear photos of your cattle (front, back, left, right sides) and basic owner details. Ear tag is mandatory.</p>
                        </div>
                        <div className="faq-item">
                            <h4>How long does approval take?</h4>
                            <p>Once you submit your application and make payment, our admin team reviews it within 24-48 hours.</p>
                        </div>
                        <div className="faq-item">
                            <h4>When does coverage start?</h4>
                            <p>Coverage starts 15 days after policy approval to prevent fraudulent claims.</p>
                        </div>
                        <div className="faq-item">
                            <h4>How to file a claim?</h4>
                            <p>Login to your account, go to Claims section, select the policy, and upload required documents. Claims are settled within 7 days.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Secure Your Livelihood Today</h2>
                        <p>Join thousands of farmers who trust SecureLife for their cattle insurance</p>
                        <button
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
