import { useState } from 'react';
import toast from 'react-hot-toast';
import './BikeInsurance.css';

const BikeInsurance = () => {
    const [calculatorData, setCalculatorData] = useState({
        bikeNumber: '',
        mobile: '',
        bikeValue: ''
    });

    const handleCalculate = (e) => {
        e.preventDefault();
        toast.success('Premium calculator will show results here!');
    };

    return (
        <div className="bike-insurance">
            {/* Hero Section */}
            <section className="page-hero">
                <div className="container">
                    <h1>Two Wheeler Insurance</h1>
                    <p>Comprehensive bike insurance with affordable premiums and quick claim settlement</p>
                </div>
            </section>

            {/* Premium Calculator */}
            <section className="section bg-light">
                <div className="container">
                    <div className="calculator-card animate-fade-in">
                        <div className="text-center mb-6">
                            <h2>Calculate Bike Insurance Premium</h2>
                            <p className="text-muted">Enter your bike details for an instant quote.</p>
                        </div>
                        <form onSubmit={handleCalculate} className="calculator-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Registration Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MH02AB1234"
                                        value={calculatorData.bikeNumber}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, bikeNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter mobile number"
                                        value={calculatorData.mobile}
                                        onChange={(e) => setCalculatorData({ ...calculatorData, mobile: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bike Make</label>
                                    <select required>
                                        <option value="">Select Make</option>
                                        <option value="hero">Hero MotoCorp</option>
                                        <option value="honda">Honda</option>
                                        <option value="tvs">TVS</option>
                                        <option value="bajaj">Bajaj</option>
                                        <option value="royal_enfield">Royal Enfield</option>
                                        <option value="yamaha">Yamaha</option>
                                        <option value="suzuki">Suzuki</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bike Model</label>
                                    <input type="text" placeholder="e.g. Splendor, Activa" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Registration Year</label>
                                    <select required>
                                        <option value="">Select Year</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                        <option value="2022">2022</option>
                                        <option value="2021">2021</option>
                                        <option value="older">Older</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Policy Status</label>
                                    <select required>
                                        <option value="not_expired">Not Expired</option>
                                        <option value="expired_within_90">Expired within 90 days</option>
                                        <option value="expired_over_90">Expired &gt; 90 days</option>
                                        <option value="new">Brand New Bike</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                                Get Bike Quote
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Insurance Plans */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Two Wheeler Insurance Plans</h2>
                    <div className="grid grid-2">
                        <div className="insurance-plan">
                            <div className="plan-header">
                                <h3>Comprehensive Cover</h3>
                                <span className="plan-tag">Popular</span>
                            </div>
                            <div className="plan-price">
                                <span className="price">₹499</span>
                                <span className="period">/year</span>
                            </div>
                            <p className="plan-desc">Complete protection for your bike including own damage and third-party liability</p>
                            <ul className="plan-features">
                                <li>✓ Own damage coverage</li>
                                <li>✓ Third-party liability</li>
                                <li>✓ Personal accident cover (₹15 Lacs)</li>
                                <li>✓ Theft protection</li>
                                <li>✓ Natural calamities</li>
                                <li>✓ Fire & explosion</li>
                                <li>✓ Man-made calamities</li>
                            </ul>
                            <button className="btn btn-primary">Buy Now</button>
                        </div>

                        <div className="insurance-plan">
                            <div className="plan-header">
                                <h3>Third-Party Only</h3>
                                <span className="plan-tag budget">Mandatory</span>
                            </div>
                            <div className="plan-price">
                                <span className="price">₹299</span>
                                <span className="period">/year</span>
                            </div>
                            <p className="plan-desc">Mandatory third-party liability coverage as per Motor Vehicles Act</p>
                            <ul className="plan-features">
                                <li>✓ Third-party bodily injury</li>
                                <li>✓ Third-party property damage</li>
                                <li>✓ Legal liability coverage</li>
                                <li>✓ Personal accident (₹15 Lacs)</li>
                                <li>✓ Required by law</li>
                                <li>✓ Affordable premium</li>
                                <li>✓ Instant policy issuance</li>
                            </ul>
                            <button className="btn btn-secondary">Buy Now</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Add-on Covers */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Add-on Covers for Your Bike</h2>
                    <p className="section-subtitle">Enhance your two-wheeler insurance with these optional covers</p>
                    <div className="grid grid-3">
                        <div className="addon-card">
                            <div className="addon-icon">🛡️</div>
                            <h3>Zero Depreciation</h3>
                            <p>Get full claim without depreciation deduction on spare parts</p>
                            <div className="addon-details">
                                <span className="addon-price">+₹500/year</span>
                                <button className="addon-btn">Add</button>
                            </div>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🔧</div>
                            <h3>Engine Protection</h3>
                            <p>Coverage for engine damage due to water ingression or oil leakage</p>
                            <div className="addon-details">
                                <span className="addon-price">+₹300/year</span>
                                <button className="addon-btn">Add</button>
                            </div>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🚨</div>
                            <h3>Roadside Assistance</h3>
                            <p>24/7 emergency support including towing and fuel delivery</p>
                            <div className="addon-details">
                                <span className="addon-price">+₹200/year</span>
                                <button className="addon-btn">Add</button>
                            </div>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🔑</div>
                            <h3>Key & Lock Replacement</h3>
                            <p>Coverage for lost or damaged bike keys and lock replacement</p>
                            <div className="addon-details">
                                <span className="addon-price">+₹150/year</span>
                                <button className="addon-btn">Add</button>
                            </div>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">🪟</div>
                            <h3>Consumables Cover</h3>
                            <p>Coverage for consumables like engine oil, brake oil, nuts & bolts</p>
                            <div className="addon-details">
                                <span className="addon-price">+₹250/year</span>
                                <button className="addon-btn">Add</button>
                            </div>
                        </div>
                        <div className="addon-card">
                            <div className="addon-icon">⚡</div>
                            <h3>Return to Invoice</h3>
                            <p>Get invoice value in case of total loss or theft of your bike</p>
                            <div className="addon-details">
                                <span className="addon-price">+₹400/year</span>
                                <button className="addon-btn">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Choose Our Bike Insurance?</h2>
                    <div className="grid grid-4">
                        <div className="feature-item">
                            <div className="feature-icon">🏍️</div>
                            <h3>Wide Coverage</h3>
                            <p>Covers all types of two-wheelers including scooters and e-bikes</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">💰</div>
                            <h3>Affordable Plans</h3>
                            <p>Get comprehensive coverage at the most competitive prices</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h3>Quick Claims</h3>
                            <p>Claims settled in 3-7 working days with minimal documentation</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏭</div>
                            <h3>8,000+ Garages</h3>
                            <p>Cashless repairs at our vast network of authorized garages</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📱</div>
                            <h3>Digital Process</h3>
                            <p>Buy, renew, and claim entirely online through our app</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🎁</div>
                            <h3>No Claim Bonus</h3>
                            <p>Get up to 50% discount on renewal for claim-free years</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔄</div>
                            <h3>Easy Renewal</h3>
                            <p>Renew your policy online in just 2 minutes</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📞</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock assistance for all your queries and claims</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Details */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">What's Covered in Bike Insurance?</h2>
                    <div className="coverage-grid">
                        <div className="coverage-section">
                            <h3>Own Damage Coverage</h3>
                            <ul>
                                <li>Accidents & collisions</li>
                                <li>Fire & explosion</li>
                                <li>Theft of vehicle</li>
                                <li>Natural calamities</li>
                                <li>Man-made disasters</li>
                                <li>Riots & strikes</li>
                            </ul>
                        </div>
                        <div className="coverage-section">
                            <h3>Third-Party Coverage</h3>
                            <ul>
                                <li>Bodily injury to third party</li>
                                <li>Death of third party</li>
                                <li>Property damage</li>
                                <li>Legal liability</li>
                                <li>Court proceedings</li>
                                <li>Mandatory by law</li>
                            </ul>
                        </div>
                        <div className="coverage-section">
                            <h3>Personal Accident</h3>
                            <ul>
                                <li>Accidental death</li>
                                <li>Permanent disability</li>
                                <li>Partial disability</li>
                                <li>Medical expenses</li>
                                <li>Cover up to ₹15 Lacs</li>
                                <li>Included in policy</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2>Insure Your Bike Today</h2>
                        <p>Get instant quotes and buy two-wheeler insurance online in minutes</p>
                        <button className="btn btn-outline">Get Free Quote</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BikeInsurance;
