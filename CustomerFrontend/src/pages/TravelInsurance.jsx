import { useState } from 'react';
import toast from 'react-hot-toast';
import './TravelInsurance.css';

const TravelInsurance = () => {
    const [travelData, setTravelData] = useState({
        destination: '',
        startDate: '',
        endDate: '',
        travelers: '1',
        travelerAge: ''
    });

    const handleCalculate = (e) => {
        e.preventDefault();
        toast.success('Travel Insurance Plans loading...');
    };

    return (
        <div className="travel-insurance">
            {/* Hero Section */}
            <section className="page-hero travel-hero">
                <div className="container">
                    <span className="hero-badge">COVID-19 Covered</span>
                    <h1>Travel the World Worry-Free</h1>
                    <p>Comprehensive travel insurance starting at ₹49/day. Covers flight delays, lost baggage, and medical emergencies.</p>
                </div>
            </section>

            {/* Premium Calculator */}
            <section className="section bg-light">
                <div className="container">
                    <div className="calculator-card animate-fade-in">
                        <div className="text-center mb-6">
                            <h2>Get Travel Insurance Quote</h2>
                            <p className="text-muted">Enter trip details to get an instant premium estimate.</p>
                        </div>
                        <form onSubmit={handleCalculate} className="calculator-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Destination</label>
                                    <select
                                        value={travelData.destination}
                                        onChange={(e) => setTravelData({ ...travelData, destination: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Country/Region</option>
                                        <option value="usa">USA & Canada</option>
                                        <option value="schengen">Schengen (Europe)</option>
                                        <option value="asia">Asia</option>
                                        <option value="worldwide">Worldwide</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Travelers</label>
                                    <select
                                        value={travelData.travelers}
                                        onChange={(e) => setTravelData({ ...travelData, travelers: e.target.value })}
                                    >
                                        <option value="1">1 Traveler</option>
                                        <option value="2">2 Travelers</option>
                                        <option value="family">Family (2A + 2C)</option>
                                        <option value="group">Group (5+)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trip Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={travelData.startDate}
                                        onChange={(e) => setTravelData({ ...travelData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Trip End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={travelData.endDate}
                                        onChange={(e) => setTravelData({ ...travelData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Age of Primary Traveler</label>
                                    <input
                                        type="number"
                                        placeholder="Age"
                                        min="1" max="100"
                                        value={travelData.travelerAge}
                                        onChange={(e) => setTravelData({ ...travelData, travelerAge: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
                                View Plans
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Travel Plans */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Travel Insurance Plans</h2>
                    <div className="grid grid-3">
                        <div className="travel-plan">
                            <div className="plan-type">Domestic</div>
                            <h3>India Travel</h3>
                            <div className="plan-price">
                                <span className="price">₹49</span>
                                <span className="period">/day</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Medical expenses up to ₹5 Lacs</li>
                                <li>✓ Trip cancellation coverage</li>
                                <li>✓ Baggage loss up to ₹50,000</li>
                                <li>✓ Flight delay compensation</li>
                                <li>✓ Personal accident cover</li>
                                <li>✓ Emergency medical evacuation</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="travel-plan featured">
                            <div className="plan-badge">Popular</div>
                            <div className="plan-type">International</div>
                            <h3>Asia Travel</h3>
                            <div className="plan-price">
                                <span className="price">₹89</span>
                                <span className="period">/day</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Medical expenses up to $50,000</li>
                                <li>✓ Trip cancellation/interruption</li>
                                <li>✓ Baggage loss up to $2,000</li>
                                <li>✓ Passport loss assistance</li>
                                <li>✓ Emergency medical evacuation</li>
                                <li>✓ 24/7 travel assistance</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="travel-plan">
                            <div className="plan-type">International</div>
                            <h3>Worldwide Travel</h3>
                            <div className="plan-price">
                                <span className="price">₹149</span>
                                <span className="period">/day</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Medical expenses up to $100,000</li>
                                <li>✓ Trip cancellation/interruption</li>
                                <li>✓ Baggage loss up to $5,000</li>
                                <li>✓ Adventure sports coverage</li>
                                <li>✓ Emergency medical evacuation</li>
                                <li>✓ 24/7 global assistance</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="travel-plan">
                            <div className="plan-type">Schengen</div>
                            <h3>Europe Travel</h3>
                            <div className="plan-price">
                                <span className="price">₹129</span>
                                <span className="period">/day</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Schengen visa compliant</li>
                                <li>✓ Medical expenses up to €30,000</li>
                                <li>✓ Emergency medical evacuation</li>
                                <li>✓ Trip cancellation coverage</li>
                                <li>✓ Baggage loss coverage</li>
                                <li>✓ 24/7 travel assistance</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="travel-plan">
                            <div className="plan-type">Student</div>
                            <h3>Student Travel</h3>
                            <div className="plan-price">
                                <span className="price">₹99</span>
                                <span className="period">/day</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Long-term coverage</li>
                                <li>✓ Study interruption coverage</li>
                                <li>✓ Medical expenses up to $50,000</li>
                                <li>✓ Laptop & study material cover</li>
                                <li>✓ Sponsor protection</li>
                                <li>✓ Tuition fee refund</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="travel-plan">
                            <div className="plan-type">Annual</div>
                            <h3>Multi-Trip Plan</h3>
                            <div className="plan-price">
                                <span className="price">₹5,999</span>
                                <span className="period">/year</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Unlimited trips in a year</li>
                                <li>✓ Each trip up to 45 days</li>
                                <li>✓ Medical expenses coverage</li>
                                <li>✓ Trip cancellation coverage</li>
                                <li>✓ Baggage loss coverage</li>
                                <li>✓ Cost-effective for frequent travelers</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">What's Covered?</h2>
                    <div className="grid grid-4">
                        <div className="coverage-item">
                            <div className="coverage-icon">🏥</div>
                            <h3>Medical Expenses</h3>
                            <p>Coverage for hospitalization and medical treatment abroad</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">✈️</div>
                            <h3>Trip Cancellation</h3>
                            <p>Reimbursement for cancelled or interrupted trips</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">🧳</div>
                            <h3>Baggage Loss</h3>
                            <p>Coverage for lost, stolen, or damaged baggage</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">⏰</div>
                            <h3>Flight Delay</h3>
                            <p>Compensation for flight delays over specified hours</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">📄</div>
                            <h3>Passport Loss</h3>
                            <p>Assistance and expenses for passport replacement</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">🚑</div>
                            <h3>Emergency Evacuation</h3>
                            <p>Medical evacuation to nearest hospital or home country</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">⚖️</div>
                            <h3>Personal Liability</h3>
                            <p>Coverage for legal liability for injury or property damage</p>
                        </div>
                        <div className="coverage-item">
                            <div className="coverage-icon">📞</div>
                            <h3>24/7 Assistance</h3>
                            <p>Round-the-clock travel assistance and support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Why Choose Our Travel Insurance?</h2>
                    <div className="grid grid-3">
                        <div className="feature-card">
                            <h3>🌍 Global Coverage</h3>
                            <p>Coverage in over 180 countries worldwide with 24/7 assistance</p>
                        </div>
                        <div className="feature-card">
                            <h3>⚡ Instant Policy</h3>
                            <p>Buy travel insurance online and get instant policy issuance</p>
                        </div>
                        <div className="feature-card">
                            <h3>💰 Best Prices</h3>
                            <p>Competitive premiums starting from ₹49 per day</p>
                        </div>
                        <div className="feature-card">
                            <h3>📱 Mobile App</h3>
                            <p>Manage your policy and file claims through our mobile app</p>
                        </div>
                        <div className="feature-card">
                            <h3>🎯 Customizable</h3>
                            <p>Add optional covers like adventure sports and cruise coverage</p>
                        </div>
                        <div className="feature-card">
                            <h3>🏆 Trusted</h3>
                            <p>Serving 5M+ travelers with 98% claim settlement ratio</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Popular Travel Destinations</h2>
                    <div className="destinations-grid">
                        <div className="destination-card">
                            <div className="destination-name">🇹🇭 Thailand</div>
                            <p>Starting from ₹399 for 7 days</p>
                        </div>
                        <div className="destination-card">
                            <div className="destination-name">🇦🇪 UAE</div>
                            <p>Starting from ₹499 for 7 days</p>
                        </div>
                        <div className="destination-card">
                            <div className="destination-name">🇸🇬 Singapore</div>
                            <p>Starting from ₹599 for 7 days</p>
                        </div>
                        <div className="destination-card">
                            <div className="destination-name">🇺🇸 USA</div>
                            <p>Starting from ₹1,299 for 15 days</p>
                        </div>
                        <div className="destination-card">
                            <div className="destination-name">🇬🇧 UK</div>
                            <p>Starting from ₹1,199 for 15 days</p>
                        </div>
                        <div className="destination-card">
                            <div className="destination-name">🇦🇺 Australia</div>
                            <p>Starting from ₹1,399 for 15 days</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2>Travel with Confidence</h2>
                        <p>Get instant travel insurance and enjoy worry-free vacations</p>
                        <button className="btn btn-outline">Get Quote Now</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TravelInsurance;
