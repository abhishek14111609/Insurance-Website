import { useState } from 'react';
import './Renewals.css';

function Renewals() {
    const [policyType, setPolicyType] = useState('health');
    const [policyNumber, setPolicyNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const handleCheckRenewal = (e) => {
        e.preventDefault();
        setShowDetails(true);
    };

    const benefits = [
        {
            icon: '🎁',
            title: 'No Claim Bonus',
            description: 'Get up to 50% discount on premium for claim-free years'
        },
        {
            icon: '⏱️',
            title: 'Instant Renewal',
            description: 'Renew your policy in just 2 minutes online'
        },
        {
            icon: '💰',
            title: 'Best Prices',
            description: 'Competitive premiums with maximum benefits'
        },
        {
            icon: '📱',
            title: 'Digital Policy',
            description: 'Get instant policy document via email and SMS'
        },
        {
            icon: '🔔',
            title: 'Renewal Reminders',
            description: 'Never miss renewal with timely notifications'
        },
        {
            icon: '🎯',
            title: 'Enhanced Coverage',
            description: 'Upgrade your plan with additional benefits'
        }
    ];

    const steps = [
        {
            number: '1',
            title: 'Enter Details',
            description: 'Provide your policy number and registered mobile number'
        },
        {
            number: '2',
            title: 'Review Plan',
            description: 'Check your current plan details and renewal premium'
        },
        {
            number: '3',
            title: 'Make Payment',
            description: 'Complete payment using multiple secure payment options'
        },
        {
            number: '4',
            title: 'Get Policy',
            description: 'Receive renewed policy instantly via email & SMS'
        }
    ];

    return (
        <div className="renewals-page">
            <section className="renewals-hero">
                <div className="container">
                    <h1>Renew Your Insurance Policy</h1>
                    <p>Quick, Easy & Hassle-free Online Renewal</p>
                </div>
            </section>

            <section className="renewal-form-section section">
                <div className="container">
                    <div className="renewal-card">
                        <h2>Check Your Policy Renewal</h2>
                        <p className="renewal-subtitle">Enter your policy details to check renewal status and premium</p>

                        <form onSubmit={handleCheckRenewal} className="renewal-form">
                            <div className="form-group">
                                <label>Policy Type</label>
                                <select
                                    value={policyType}
                                    onChange={(e) => setPolicyType(e.target.value)}
                                    required
                                >
                                    <option value="health">Health Insurance</option>
                                    <option value="car">Car Insurance</option>
                                    <option value="bike">Bike Insurance</option>
                                    <option value="travel">Travel Insurance</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Policy Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter your policy number"
                                    value={policyNumber}
                                    onChange={(e) => setPolicyNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter registered mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    pattern="[0-9]{10}"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Check Renewal Status
                            </button>
                        </form>

                        {showDetails && (
                            <div className="renewal-details">
                                <div className="detail-header">
                                    <span className="status-badge active">Active</span>
                                    <h3>Policy Details</h3>
                                </div>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Policy Number</span>
                                        <span className="detail-value">{policyNumber || 'XXXXX12345'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Policy Type</span>
                                        <span className="detail-value">{policyType.charAt(0).toUpperCase() + policyType.slice(1)} Insurance</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Expiry Date</span>
                                        <span className="detail-value">31 Dec 2024</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Renewal Premium</span>
                                        <span className="detail-value highlight">₹8,999</span>
                                    </div>
                                </div>
                                <button className="btn btn-primary full-width">
                                    Proceed to Renew
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="renewal-benefits section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Renew With Us?</h2>
                    <p className="section-subtitle">Experience seamless renewal with exclusive benefits</p>

                    <div className="benefits-grid">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="benefit-card">
                                <span className="benefit-icon">{benefit.icon}</span>
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="renewal-process section">
                <div className="container">
                    <h2 className="section-title">How to Renew Your Policy</h2>
                    <p className="section-subtitle">Simple 4-step process to renew your insurance online</p>

                    <div className="steps-container">
                        {steps.map((step, index) => (
                            <div key={index} className="step-card">
                                <div className="step-number">{step.number}</div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                                {index < steps.length - 1 && <div className="step-connector"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="renewal-faq section bg-light">
                <div className="container">
                    <h2 className="section-title">Renewal FAQs</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>When should I renew my policy?</h4>
                            <p>Renew your policy before the expiry date to maintain continuous coverage. We send reminders 30 days before expiry.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What happens if I miss the renewal date?</h4>
                            <p>Your policy lapses and coverage stops. However, most policies have a grace period of 30 days for renewal.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Can I change my plan during renewal?</h4>
                            <p>Yes, you can upgrade or modify your plan during renewal. Contact our support team for assistance.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Will I lose my No Claim Bonus?</h4>
                            <p>No, your NCB is preserved if you renew before expiry. It may lapse if you delay renewal beyond grace period.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="renewal-contact section">
                <div className="container">
                    <div className="contact-box">
                        <h2>Need Help with Renewal?</h2>
                        <p>Our renewal experts are available 24/7 to assist you</p>
                        <div className="contact-actions">
                            <a href="tel:1800-123-4567" className="btn btn-primary">📞 Call 1800-123-4567</a>
                            <a href="/contact" className="btn btn-secondary">💬 Chat with Expert</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Renewals;
