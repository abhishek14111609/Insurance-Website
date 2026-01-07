import { useState } from 'react';
import './CarInsurance.css';

const CarInsurance = () => {
    const [calculatorData, setCalculatorData] = useState({
        carValue: '',
        registrationYear: '',
        fuelType: 'petrol'
    });

    const handleCalculate = (e) => {
        e.preventDefault();
        alert('Premium calculator will show results here!');
    };

    return (
        <div className="car-insurance">
            {/* Hero Section */}
            <section className="page-hero">
                <div className="container">
                    <h1>Car Insurance</h1>
                    <p>Comprehensive car insurance with zero depreciation and instant claim settlement at 10,000+ garages</p>
                </div>
            </section>

            {/* Premium Calculator */}
            <section className="section bg-light">
                <div className="container">
                    <div className="calculator-card animate-fade-in">
                        <div className="text-center mb-6">
                            <h2>Get Your Car Insurance Quote</h2>
                            <p className="text-muted">Fill in the details to get an instant premium estimate.</p>
                        </div>
                        <form onSubmit={handleCalculate} className="calculator-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Car Registration Number</label>
                                    <input type="text" placeholder="e.g. MH01AB1234" required />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <input type="tel" placeholder="Enter mobile number" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Car Make</label>
                                    <select required>
                                        <option value="">Select Make</option>
                                        <option value="maruti">Maruti Suzuki</option>
                                        <option value="hyundai">Hyundai</option>
                                        <option value="tata">Tata Motors</option>
                                        <option value="honda">Honda</option>
                                        <option value="toyota">Toyota</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Car Model</label>
                                    <input type="text" placeholder="e.g. Swift, Creta" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Registration Year</label>
                                    <select
                                        value={calculatorData.registrationYear}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, registrationYear: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                        <option value="2022">2022</option>
                                        <option value="2021">2021</option>
                                        <option value="2020">2020</option>
                                        <option value="older">Older</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Previous Policy Expiry</label>
                                    <select required>
                                        <option value="not_expired">Not Expired</option>
                                        <option value="expired_90">Expired within 90 days</option>
                                        <option value="expired_over_90">Expired &gt; 90 days</option>
                                        <option value="new">Brand New Car</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                                View Prices & Plans
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Insurance Plans */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Car Insurance Plans</h2>
                    <div className="grid grid-2">
                        <div className="insurance-plan">
                            <div className="plan-header">
                                <h3>Comprehensive Insurance</h3>
                                <span className="plan-tag">Recommended</span>
                            </div>
                            <p className="plan-desc">Complete protection for your car including own damage and third-party liability</p>
                            <ul className="plan-features">
                                <li>✓ Own damage coverage</li>
                                <li>✓ Third-party liability</li>
                                <li>✓ Personal accident cover</li>
                                <li>✓ Natural calamities</li>
                                <li>✓ Theft protection</li>
                                <li>✓ Fire damage</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="insurance-plan">
                            <div className="plan-header">
                                <h3>Third-Party Insurance</h3>
                                <span className="plan-tag budget">Budget-Friendly</span>
                            </div>
                            <p className="plan-desc">Mandatory coverage for third-party liabilities as per Motor Vehicles Act</p>
                            <ul className="plan-features">
                                <li>✓ Third-party bodily injury</li>
                                <li>✓ Third-party property damage</li>
                                <li>✓ Legal liability coverage</li>
                                <li>✓ Mandatory by law</li>
                                <li>✓ Affordable premiums</li>
                                <li>✓ Instant policy</li>
                            </ul>
                            <button className="btn btn-secondary">Buy Now</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Add-on Covers */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Add-on Covers</h2>
                    <p className="section-subtitle">Enhance your car insurance with these optional covers</p>
                    <div className="grid grid-4">
                        <div className="addon-card">
                            <div className="addon-icon">🛡️</div>
                            <h3>Zero Depreciation</h3>
                            <p>Get full claim amount without depreciation deduction on parts</p>
                            <span className="addon-price">+₹2,500/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🔧</div>
                            <h3>Engine Protection</h3>
                            <p>Coverage for engine and gearbox damage due to water ingression</p>
                            <span className="addon-price">+₹1,200/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🚗</div>
                            <h3>Roadside Assistance</h3>
                            <p>24/7 emergency support including towing and fuel delivery</p>
                            <span className="addon-price">+₹500/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🔑</div>
                            <h3>Key Replacement</h3>
                            <p>Coverage for lost or damaged car keys replacement costs</p>
                            <span className="addon-price">+₹300/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🪟</div>
                            <h3>Consumables Cover</h3>
                            <p>Coverage for consumables like engine oil, nuts, bolts, etc.</p>
                            <span className="addon-price">+₹800/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🚙</div>
                            <h3>Return to Invoice</h3>
                            <p>Get invoice value in case of total loss or theft</p>
                            <span className="addon-price">+₹2,000/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">👥</div>
                            <h3>Passenger Cover</h3>
                            <p>Personal accident cover for all passengers</p>
                            <span className="addon-price">+₹400/year</span>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🛠️</div>
                            <h3>NCB Protection</h3>
                            <p>Protect your No Claim Bonus even after making claims</p>
                            <span className="addon-price">+₹600/year</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Choose Our Car Insurance?</h2>
                    <div className="grid grid-3">
                        <div className="feature-box">
                            <h3>🏭 10,000+ Cashless Garages</h3>
                            <p>Get your car repaired at our vast network of authorized garages without paying upfront</p>
                        </div>
                        <div className="feature-box">
                            <h3>⚡ Instant Claim Settlement</h3>
                            <p>Minor damage claims settled instantly at select garages</p>
                        </div>
                        <div className="feature-box">
                            <h3>📱 Self Inspection</h3>
                            <p>Quick and easy self-inspection using our mobile app</p>
                        </div>
                        <div className="feature-box">
                            <h3>🔄 Easy Renewal</h3>
                            <p>Renew your policy online in just 2 minutes</p>
                        </div>
                        <div className="feature-box">
                            <h3>💰 Best Price</h3>
                            <p>Compare quotes from multiple insurers and get the best deal</p>
                        </div>
                        <div className="feature-box">
                            <h3>📞 24/7 Support</h3>
                            <p>Round-the-clock assistance for claims and queries</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2>Protect Your Car Today</h2>
                        <p>Get instant quotes and buy car insurance online in minutes</p>
                        <button className="btn btn-outline">Get Free Quote</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CarInsurance;
