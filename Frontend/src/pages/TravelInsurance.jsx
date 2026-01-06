import './TravelInsurance.css';

const TravelInsurance = () => {
    return (
        <div className="travel-insurance">
            {/* Hero Section */}
            <section className="page-hero">
                <div className="container">
                    <h1>Travel Insurance</h1>
                    <p>Travel worry-free with comprehensive coverage for medical emergencies, trip cancellations, and baggage loss</p>
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
