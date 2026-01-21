import { useState } from 'react';
import toast from 'react-hot-toast';
import './HealthInsurance.css';

const HealthInsurance = () => {
    const [data, setData] = useState({
        age: '',
        gender: '',
        members: [],
        pincode: '',
        preExisting: 'no'
    });

    const handleCalculate = (e) => {
        e.preventDefault();
        toast.success('Health Insurance Plans for your family loading...');
    };

    return (
        <div className="health-insurance">
            {/* Hero Section */}
            <section className="page-hero health-hero">
                <div className="container">
                    <span className="hero-badge">Medical Inflation is 14%</span>
                    <h1>Secure Your Family's Health</h1>
                    <p>Comprehensive health insurance starting at just ₹500/month. Cashless treatment at 8,500+ hospitals.</p>
                </div>
            </section>

            {/* Premium Calculator */}
            <section className="section bg-light">
                <div className="container">
                    <div className="calculator-card animate-fade-in">
                        <div className="text-center mb-6">
                            <h2>Calculate Health Premium</h2>
                            <p className="text-muted">Get a customized quote for you and your family.</p>
                        </div>
                        <form onSubmit={handleCalculate} className="calculator-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData({ ...data, gender: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Your Age</label>
                                    <input
                                        type="number"
                                        placeholder="Age in years"
                                        min="18"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Who are you insuring?</label>
                                    <select required>
                                        <option value="self">Self Only</option>
                                        <option value="spouse">Self + Spouse</option>
                                        <option value="family">Self + Spouse + Kids</option>
                                        <option value="parents">Parents</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input type="text" placeholder="e.g. 110001" required maxLength="6" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Any Pre-existing Diseases?</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input type="radio" name="disease" value="yes" /> Yes
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" name="disease" value="no" defaultChecked /> No
                                        </label>
                                    </div>
                                    <small className="form-text">Diabetes, Hypertension, Thyroid, etc.</small>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
                                View Health Plans
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 className="section-title">Our Health Insurance Plans</h2>
                    <div className="grid grid-3">
                        <div className="plan-card featured">
                            <div className="plan-badge">Most Popular</div>
                            <h3>Optima Secure</h3>
                            <div className="plan-price">
                                <span className="price">₹499</span>
                                <span className="period">/month</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ 4X Coverage Guaranteed</li>
                                <li>✓ Cashless hospitalization</li>
                                <li>✓ Sum Insured up to ₹50 Lacs</li>
                                <li>✓ No room rent limit</li>
                                <li>✓ Day 1 coverage for pre-existing conditions after 36 months</li>
                                <li>✓ Restore benefit</li>
                                <li>✓ Preventive health check-ups</li>
                            </ul>
                            <button className="btn btn-primary">Get Quote</button>
                        </div>

                        <div className="plan-card">
                            <h3>Family Floater</h3>
                            <div className="plan-price">
                                <span className="price">₹899</span>
                                <span className="period">/month</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Cover for entire family</li>
                                <li>✓ Cashless hospitalization</li>
                                <li>✓ Sum Insured up to ₹25 Lacs</li>
                                <li>✓ Unlimited restore benefit</li>
                                <li>✓ Pre and post hospitalization</li>
                                <li>✓ No claim bonus</li>
                                <li>✓ Tax benefits under 80D</li>
                            </ul>
                            <button className="btn btn-secondary">Get Quote</button>
                        </div>

                        <div className="plan-card">
                            <h3>Critical Illness</h3>
                            <div className="plan-price">
                                <span className="price">₹349</span>
                                <span className="period">/month</span>
                            </div>
                            <ul className="plan-features">
                                <li>✓ Covers 15 critical illnesses</li>
                                <li>✓ Lump sum payout</li>
                                <li>✓ Sum Insured up to ₹1 Crore</li>
                                <li>✓ No medical checkups till 45 years</li>
                                <li>✓ Affordable premiums</li>
                                <li>✓ Lifelong renewability</li>
                                <li>✓ Tax benefits</li>
                            </ul>
                            <button className="btn btn-secondary">Get Quote</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Key Benefits</h2>
                    <div className="grid grid-4">
                        <div className="benefit-card">
                            <div className="benefit-icon">🏥</div>
                            <h3>15,000+ Network Hospitals</h3>
                            <p>Cashless treatment at our extensive network of hospitals across India</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">💳</div>
                            <h3>Cashless Claims</h3>
                            <p>No upfront payment required at network hospitals with pre-authorization</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">⚡</div>
                            <h3>Quick Settlement</h3>
                            <p>Claims processed and settled within 3-7 working days</p>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon">📱</div>
                            <h3>Digital First</h3>
                            <p>Buy, manage, and claim entirely online through our mobile app</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Details */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">What's Covered?</h2>
                    <div className="grid grid-2">
                        <div className="coverage-box">
                            <h3>✓ Covered</h3>
                            <ul>
                                <li>In-patient hospitalization</li>
                                <li>Pre & post hospitalization (60/180 days)</li>
                                <li>Day care procedures</li>
                                <li>Ambulance charges</li>
                                <li>Room rent & ICU charges</li>
                                <li>Doctor's consultation fees</li>
                                <li>Diagnostic tests</li>
                                <li>Medicines & pharmacy bills</li>
                            </ul>
                        </div>
                        <div className="coverage-box exclusion">
                            <h3>✗ Not Covered</h3>
                            <ul>
                                <li>Cosmetic or plastic surgery</li>
                                <li>Self-inflicted injuries</li>
                                <li>Drug or alcohol abuse</li>
                                <li>War or nuclear risks</li>
                                <li>Pre-existing diseases (initial 36 months)</li>
                                <li>Dental treatment (unless accident)</li>
                                <li>Congenital anomalies</li>
                                <li>Eyeglasses & contact lenses</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2>Get Your Health Insurance Today</h2>
                        <p>Compare plans, get instant quotes, and buy online in minutes</p>
                        <button className="btn btn-outline">Get Free Quote</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HealthInsurance;
