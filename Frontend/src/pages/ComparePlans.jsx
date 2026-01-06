import { useState } from 'react';
import './ComparePlans.css';

function ComparePlans() {
    const [selectedType, setSelectedType] = useState('health');

    const healthPlans = [
        {
            name: 'Basic Shield',
            price: '₹299',
            period: '/month',
            coverage: '₹3 Lakhs',
            features: ['Hospitalization Coverage', 'Pre & Post Hospitalization (30 days)', 'Ambulance Cover (₹1000)', 'Cashless at 5000+ Hospitals', 'No Room Rent Limit', 'Annual Health Checkup'],
            highlighted: false
        },
        {
            name: 'Family Protector',
            price: '₹799',
            period: '/month',
            coverage: '₹10 Lakhs',
            features: ['All Basic Features', 'Covers 4 Family Members', 'Maternity Coverage', 'Newborn Baby Cover', 'Daycare Procedures', 'No Claim Bonus 10%', 'Restore Benefit 100%', 'OPD Coverage (₹5000)'],
            highlighted: true
        },
        {
            name: 'Premium Care',
            price: '₹1,499',
            period: '/month',
            coverage: '₹25 Lakhs',
            features: ['All Family Features', 'Worldwide Coverage', 'No Disease Sub-limits', 'Pre-existing Diseases (2yr)', 'Unlimited Restoration', 'No Claim Bonus 50%', 'Home Healthcare', 'Mental Illness Cover', 'Modern Treatments'],
            highlighted: false
        }
    ];

    const carPlans = [
        {
            name: 'Third Party',
            price: '₹2,072',
            period: '/year',
            coverage: 'Legal Minimum',
            features: ['Third Party Liability', 'Death Cover (₹15 Lakhs)', 'Injury Cover (₹7.5 Lakhs)', 'Property Damage (₹7.5 Lakhs)', 'PA Cover for Owner-Driver', 'Legally Mandatory'],
            highlighted: false
        },
        {
            name: 'Comprehensive',
            price: '₹8,999',
            period: '/year',
            coverage: 'Full Protection',
            features: ['All Third Party Benefits', 'Own Damage Cover', 'Theft Protection', 'Fire & Explosion', 'Natural Calamities', 'Riots & Strikes', 'Depreciation Cover', 'Roadside Assistance', 'NCB Protection'],
            highlighted: true
        },
        {
            name: 'Premium Shield',
            price: '₹14,999',
            period: '/year',
            coverage: 'Zero Depreciation',
            features: ['All Comprehensive Features', 'Zero Depreciation', 'Engine Protection', 'Return to Invoice', 'Key Replacement', 'Tyre Protection', 'Consumables Cover', 'Daily Allowance', 'Emergency Hotel Cover'],
            highlighted: false
        }
    ];

    const bikePlans = [
        {
            name: 'Basic Cover',
            price: '₹999',
            period: '/year',
            coverage: 'Third Party',
            features: ['Third Party Liability', 'Death Cover (₹15 Lakhs)', 'PA Cover for Owner', 'Property Damage', 'Legal Compliance', 'Quick Issuance'],
            highlighted: false
        },
        {
            name: 'Standard Protection',
            price: '₹2,499',
            period: '/year',
            coverage: 'Comprehensive',
            features: ['All Basic Features', 'Own Damage Cover', 'Theft & Fire Protection', 'Natural Calamity Cover', 'Cashless Garages 8000+', '24x7 Roadside Assistance', 'NCB up to 50%'],
            highlighted: true
        },
        {
            name: 'Complete Care',
            price: '₹4,499',
            period: '/year',
            coverage: 'Zero Depreciation',
            features: ['All Standard Features', 'Zero Depreciation', 'Engine Protection', 'Consumables Cover', 'Key & Lock Replace', 'Personal Baggage', 'Return to Invoice', 'Helmet & Riding Gear'],
            highlighted: false
        }
    ];

    const travelPlans = [
        {
            name: 'Domestic Explorer',
            price: '₹49',
            period: '/day',
            coverage: '₹1 Lakh',
            features: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss (₹10k)', 'Flight Delay Cover', 'Personal Accident', 'India Coverage'],
            highlighted: false
        },
        {
            name: 'International Plus',
            price: '₹149',
            period: '/day',
            coverage: '₹5 Lakhs',
            features: ['All Domestic Features', 'Worldwide Coverage', 'Medical Evacuation', 'Repatriation', 'Passport Loss', 'Home Burglary Insurance', 'Adventure Sports', 'COVID-19 Cover'],
            highlighted: true
        },
        {
            name: 'Global Premium',
            price: '₹299',
            period: '/day',
            coverage: '₹20 Lakhs',
            features: ['All International Features', 'Extended Coverage', 'Pre-existing Conditions', 'Trip Interruption', 'Missed Connection', 'Rental Car Excess', 'Golf Cover', 'Leisure Activities', 'Business Equipment'],
            highlighted: false
        }
    ];

    const getPlans = () => {
        switch (selectedType) {
            case 'health':
                return healthPlans;
            case 'car':
                return carPlans;
            case 'bike':
                return bikePlans;
            case 'travel':
                return travelPlans;
            default:
                return healthPlans;
        }
    };

    return (
        <div className="compare-page">
            <section className="compare-hero">
                <div className="container">
                    <h1>Compare Insurance Plans</h1>
                    <p>Find the perfect insurance plan that matches your needs and budget</p>
                </div>
            </section>

            <section className="compare-section section">
                <div className="container">
                    <div className="plan-type-selector">
                        <button
                            className={`type-btn ${selectedType === 'health' ? 'active' : ''}`}
                            onClick={() => setSelectedType('health')}
                        >
                            🏥 Health Insurance
                        </button>
                        <button
                            className={`type-btn ${selectedType === 'car' ? 'active' : ''}`}
                            onClick={() => setSelectedType('car')}
                        >
                            🚗 Car Insurance
                        </button>
                        <button
                            className={`type-btn ${selectedType === 'bike' ? 'active' : ''}`}
                            onClick={() => setSelectedType('bike')}
                        >
                            🏍️ Bike Insurance
                        </button>
                        <button
                            className={`type-btn ${selectedType === 'travel' ? 'active' : ''}`}
                            onClick={() => setSelectedType('travel')}
                        >
                            ✈️ Travel Insurance
                        </button>
                    </div>

                    <div className="plans-grid">
                        {getPlans().map((plan, index) => (
                            <div key={index} className={`plan-card ${plan.highlighted ? 'highlighted' : ''}`}>
                                {plan.highlighted && <div className="popular-badge">Most Popular</div>}

                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    <div className="plan-coverage">{plan.coverage}</div>
                                </div>

                                <div className="plan-price">
                                    <span className="price-amount">{plan.price}</span>
                                    <span className="price-period">{plan.period}</span>
                                </div>

                                <ul className="plan-features">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <span className="check-icon">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                                    Choose Plan
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="compare-info">
                        <div className="info-card">
                            <span className="info-icon">💡</span>
                            <div>
                                <h4>Need Help Choosing?</h4>
                                <p>Our insurance experts are available 24/7 to help you select the right plan</p>
                                <a href="/contact" className="info-link">Talk to Expert →</a>
                            </div>
                        </div>
                        <div className="info-card">
                            <span className="info-icon">📊</span>
                            <div>
                                <h4>Customize Your Plan</h4>
                                <p>Add or remove features to create a personalized insurance plan that fits your needs</p>
                                <a href="/contact" className="info-link">Get Custom Quote →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ComparePlans;
