import { useState } from 'react';
import './Claims.css';

const Claims = () => {
    const [claimType, setClaimType] = useState('health');
    const [trackingNumber, setTrackingNumber] = useState('');

    const handleClaimSubmit = (e) => {
        e.preventDefault();
        alert('Claim submitted successfully! Your claim number is CLM-2024-' + Math.floor(Math.random() * 10000));
    };

    const handleTrackClaim = (e) => {
        e.preventDefault();
        alert('Tracking claim: ' + trackingNumber);
    };

    return (
        <div className="claims">
            {/* Hero Section */}
            <section className="page-hero">
                <div className="container">
                    <h1>Claims Support</h1>
                    <p>We're here to help you through the claims process with 24/7 support</p>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="grid grid-4">
                        <button className="action-card">
                            <div className="action-icon">📝</div>
                            <h3>File a Claim</h3>
                            <p>Submit a new claim online</p>
                        </button>
                        <button className="action-card">
                            <div className="action-icon">🔍</div>
                            <h3>Track Claim</h3>
                            <p>Check your claim status</p>
                        </button>
                        <button className="action-card">
                            <div className="action-icon">📄</div>
                            <h3>Upload Documents</h3>
                            <p>Submit required documents</p>
                        </button>
                        <button className="action-card">
                            <div className="action-icon">📞</div>
                            <h3>Call Support</h3>
                            <p>Speak to our claims team</p>
                        </button>
                    </div>
                </div>
            </section>

            {/* File Claim Section */}
            <section className="section bg-light">
                <div className="container">
                    <div className="claims-form-container">
                        <h2>File a New Claim</h2>
                        <div className="claim-tabs">
                            <button
                                className={`tab-btn ${claimType === 'health' ? 'active' : ''}`}
                                onClick={() => setClaimType('health')}
                            >
                                Health Insurance
                            </button>
                            <button
                                className={`tab-btn ${claimType === 'car' ? 'active' : ''}`}
                                onClick={() => setClaimType('car')}
                            >
                                Car Insurance
                            </button>
                            <button
                                className={`tab-btn ${claimType === 'bike' ? 'active' : ''}`}
                                onClick={() => setClaimType('bike')}
                            >
                                Bike Insurance
                            </button>
                            <button
                                className={`tab-btn ${claimType === 'travel' ? 'active' : ''}`}
                                onClick={() => setClaimType('travel')}
                            >
                                Travel Insurance
                            </button>
                        </div>

                        <form onSubmit={handleClaimSubmit} className="claim-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Policy Number *</label>
                                    <input type="text" placeholder="Enter policy number" required />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number *</label>
                                    <input type="tel" placeholder="Enter mobile number" required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" placeholder="Enter email address" required />
                                </div>
                                <div className="form-group">
                                    <label>Date of Incident *</label>
                                    <input type="date" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Claim Type *</label>
                                <select required>
                                    <option value="">Select Claim Type</option>
                                    {claimType === 'health' && (
                                        <>
                                            <option value="hospitalization">Hospitalization</option>
                                            <option value="reimbursement">Reimbursement</option>
                                            <option value="critical">Critical Illness</option>
                                        </>
                                    )}
                                    {claimType === 'car' && (
                                        <>
                                            <option value="accident">Accident</option>
                                            <option value="theft">Theft</option>
                                            <option value="natural">Natural Calamity</option>
                                        </>
                                    )}
                                    {claimType === 'bike' && (
                                        <>
                                            <option value="accident">Accident</option>
                                            <option value="theft">Theft</option>
                                            <option value="damage">Own Damage</option>
                                        </>
                                    )}
                                    {claimType === 'travel' && (
                                        <>
                                            <option value="medical">Medical Emergency</option>
                                            <option value="baggage">Baggage Loss</option>
                                            <option value="cancellation">Trip Cancellation</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea rows="4" placeholder="Describe the incident" required></textarea>
                            </div>
                            <div className="form-group">
                                <label>Upload Documents</label>
                                <input type="file" multiple />
                                <small>Upload relevant documents (FIR, bills, medical reports, etc.)</small>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit Claim</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Track Claim Section */}
            <section className="section">
                <div className="container">
                    <div className="track-claim-container">
                        <h2>Track Your Claim</h2>
                        <form onSubmit={handleTrackClaim} className="track-form">
                            <div className="track-input-group">
                                <input
                                    type="text"
                                    placeholder="Enter Claim Number or Policy Number"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary">Track</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Claims Process */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Our Claims Process</h2>
                    <div className="process-timeline">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <h3>Report Claim</h3>
                            <p>Notify us immediately through app, website, or call</p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <h3>Submit Documents</h3>
                            <p>Upload required documents online or visit branch</p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <h3>Verification</h3>
                            <p>Our team reviews and verifies your claim</p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <h3>Approval</h3>
                            <p>Claim approved after successful verification</p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">5</div>
                            <h3>Settlement</h3>
                            <p>Amount credited to your account within 3-7 days</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Required Documents */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Required Documents</h2>
                    <div className="grid grid-2">
                        <div className="document-card">
                            <h3>🏥 Health Insurance Claims</h3>
                            <ul>
                                <li>Duly filled claim form</li>
                                <li>Original bills and receipts</li>
                                <li>Discharge summary</li>
                                <li>Medical reports and prescriptions</li>
                                <li>Diagnostic test reports</li>
                                <li>Policy copy</li>
                                <li>ID proof</li>
                            </ul>
                        </div>
                        <div className="document-card">
                            <h3>🚗 Motor Insurance Claims</h3>
                            <ul>
                                <li>Duly filled claim form</li>
                                <li>FIR copy (for theft/major accident)</li>
                                <li>Driving license copy</li>
                                <li>RC copy</li>
                                <li>Repair estimates</li>
                                <li>Policy copy</li>
                                <li>Photos of damage</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Claims Support</h2>
                    <div className="grid grid-3">
                        <div className="support-card">
                            <div className="support-icon">📞</div>
                            <h3>24/7 Helpline</h3>
                            <p className="support-number">1800-123-7890</p>
                            <p>For immediate claims assistance</p>
                        </div>
                        <div className="support-card">
                            <div className="support-icon">✉️</div>
                            <h3>Email Support</h3>
                            <p className="support-number">claims@securelife.com</p>
                            <p>Response within 24 hours</p>
                        </div>
                        <div className="support-card">
                            <div className="support-icon">💬</div>
                            <h3>Live Chat</h3>
                            <p className="support-number">Chat Now</p>
                            <p>Instant support from our experts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2>Need Help with Your Claim?</h2>
                        <p>Our claims team is available 24/7 to assist you</p>
                        <button className="btn btn-outline">Call 1800-123-7890</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Claims;
