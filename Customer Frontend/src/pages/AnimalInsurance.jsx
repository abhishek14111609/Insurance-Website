import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentCodeInput from '../components/AgentCodeInput';
import { initializeMockAgentData } from '../utils/agentUtils';
import { isCustomerLoggedIn } from '../utils/authUtils';
import './AnimalInsurance.css';

const AnimalInsurance = () => {
    const navigate = useNavigate();
    const [agentCode, setAgentCode] = useState('');
    const [calculatorData, setCalculatorData] = useState({
        petType: 'cow', // Changed default to cow
        petAge: '',
        petBreed: '',
        tagId: '', // Added Tag ID
        milkYield: '', // Added Milk Yield
        coverageAmount: '50000'
    });

    // Initialize mock agent data on component mount
    useEffect(() => {
        initializeMockAgentData();
    }, []);

    const handleCalculate = (e) => {
        e.preventDefault();

        // Check login before proceeding
        if (!isCustomerLoggedIn()) {
            navigate('/login', { state: { from: '/animal-insurance' } });
            return;
        }

        // Navigate to policy form with calculator data
        navigate('/animal-policy-form', {
            state: {
                calculatorData,
                agentCode
            }
        });
    };

    const getPremiumEstimate = () => {
        const baseRates = {
            cow: 2500,
            buffalo: 3000
        };

        const ageMultiplier = calculatorData.petAge > 5 ? 1.2 : 1;
        const coverageMultiplier = parseInt(calculatorData.coverageAmount) / 50000;

        // Milk yield factor (higher yield = slightly higher premium due to higher value)
        const yieldFactor = calculatorData.milkYield > 10 ? 1.1 : 1;

        return Math.round(baseRates[calculatorData.petType] * ageMultiplier * coverageMultiplier * yieldFactor);
    };

    return (
        <div className="animal-insurance">
            {/* Hero Section */}
            <section className="page-hero animal-hero">
                <div className="container">
                    <div className="hero-content-wrapper">
                        <div className="hero-text">
                            <span className="hero-badge">🐄 Cattle Insurance Expert</span>
                            <h1>Protect Your Valuable Livestock</h1>
                            <p>Comprehensive insurance for Cows and Buffaloes. Covers death due to disease, accidents, and natural calamities. Secure your livelihood today.</p>
                            <div className="hero-features">
                                <div className="feature-item">
                                    <span className="feature-icon">✓</span>
                                    <span>Death & Disease Cover</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">✓</span>
                                    <span>Accidental Coverage</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">✓</span>
                                    <span>Quick Claim Settlement</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="pet-illustration">🐄🐃</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Calculator */}
            <section className="section calculator-section">
                <div className="container">
                    <div className="calculator-card animate-fade-in">
                        <div className="text-center mb-6">
                            <h2>Calculate Cattle Insurance Premium</h2>
                            <p className="text-muted">Get an instant quote for your Cow or Buffalo</p>
                        </div>

                        <form onSubmit={handleCalculate} className="calculator-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cattle Type</label>
                                    <select
                                        value={calculatorData.petType}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, petType: e.target.value })}
                                        required
                                    >
                                        <option value="cow">🐄 Cow (Gau Mata)</option>
                                        <option value="buffalo">🐃 Buffalo (Bhains)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Age (Years)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 4"
                                        min="1"
                                        max="15"
                                        value={calculatorData.petAge}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, petAge: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Breed / Variety</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Gir, Jersey, Murrah"
                                        value={calculatorData.petBreed}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, petBreed: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ear Tag Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Tag ID"
                                        value={calculatorData.tagId}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, tagId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Daily Milk Yield (Liters)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10"
                                        min="0"
                                        value={calculatorData.milkYield}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, milkYield: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sum Insured (Market Value)</label>
                                    <select
                                        value={calculatorData.coverageAmount}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, coverageAmount: e.target.value })}
                                    >
                                        <option value="25000">₹25,000</option>
                                        <option value="50000">₹50,000</option>
                                        <option value="75000">₹75,000</option>
                                        <option value="100000">₹1,00,000</option>
                                        <option value="150000">₹1,50,000</option>
                                    </select>
                                </div>
                            </div>

                            {/* Agent Code Input */}
                            <AgentCodeInput
                                value={agentCode}
                                onChange={setAgentCode}
                                label="Agent Code (Optional)"
                            />

                            {/* Premium Estimate */}
                            {calculatorData.petAge && (
                                <div className="premium-estimate">
                                    <div className="estimate-label">Estimated Annual Premium</div>
                                    <div className="estimate-amount">₹{getPremiumEstimate().toLocaleString('en-IN')}</div>
                                    <div className="estimate-note">*Final premium subject to veterinary certificate</div>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
                                Proceed to Buy Protection
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Policy Details */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Pashu Dhan Suraksha - Comprehensive Cattle Plan</h2>
                    <div className="policy-showcase">
                        <div className="policy-card featured">
                            <div className="policy-badge">Best Seller</div>
                            <div className="policy-icon">🛡️</div>
                            <h3>Pashu Raksha</h3>
                            <div className="policy-price">
                                Starting at <span className="price">4%</span><span className="period"> of value</span>
                            </div>
                            <ul className="policy-features">
                                <li>✓ Death due to Disease & Accident</li>
                                <li>✓ Permanent Total Disability Cover</li>
                                <li>✓ Calving Risk Coverage</li>
                                <li>✓ Transit Cover (Up to 50km)</li>
                                <li>✓ Snake Bite & Poisoning</li>
                                <li>✓ Flood, Cyclone & Lightning</li>
                                <li>✓ Free Veterinary Consultation</li>
                                <li>✓ No Claim Bonus</li>
                                <li>✓ Tag Re-issuance Cover</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Details */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">What's Covered?</h2>
                    <div className="grid grid-2">
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
                                <li>Transport beyond 50km (without addon)</li>
                                <li>Pre-existing Disabilities</li>
                                <li>Death within 15 days of policy start</li>
                                <li>No Ear Tag Available</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Insure with SecureLife?</h2>
                    <div className="grid grid-4">
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
                            <p>Subsidized premiums and family discounts available</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Secure Your Livelihood Today</h2>
                        <p>Join lakhs of farmers who trust SecureLife for their cattle insurance</p>
                        <button className="btn btn-outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            Get a Quote Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AnimalInsurance;
