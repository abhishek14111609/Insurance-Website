import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title fade-in-up">
                        Protect Your Cattle, Secure Your Future
                    </h1>
                    <p className="hero-subtitle fade-in-up">
                        Comprehensive insurance for Cows and Buffaloes. Death, disease, and accident cover starting at just 4%.
                    </p>
                    <div className="hero-buttons fade-in-up">
                        <Link to="/animal-insurance" className="btn btn-primary" style={{ color: 'white', border: "1px solid white" }}>Get Cattle Quote</Link>
                        <Link to="/register" className="btn btn-outline" style={{ color: 'white', border: "1px solid white" }}>Farmer Registration</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">5 Lakh+</span>
                            <span className="stat-text">Cattle Insured</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">₹10 Cr+</span>
                            <span className="stat-text">Claims Paid</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">24/7</span>
                            <span className="stat-text">Vet Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Product Section - Single Cattle Focus */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title" style={{ justifyContent: 'center', color: 'black' }}>Why Insure Your Livestock?</h2>

                    <div className="product-showcase-single">
                        <div className="featured-card-large animate-fade-in">
                            <div className="card-content">
                                <div className="icon-large">🐄</div>
                                <h3>Comprehensive Cattle Protection</h3>
                                <p>Our all-in-one policy covers Cows (Gau Mata) and Buffaloes against all major risks.</p>

                                <div className="features-grid">
                                    <div className="feature">
                                        <span className="check">✓</span>
                                        <strong>Death due to Disease</strong>
                                        <p>Covers HS, BQ, FMD & other diseases.</p>
                                    </div>
                                    <div className="feature">
                                        <span className="check">✓</span>
                                        <strong>Accidental Death</strong>
                                        <p>Road/Rail accidents, drowning, snake bite.</p>
                                    </div>
                                    <div className="feature">
                                        <span className="check">✓</span>
                                        <strong>Natural Calamities</strong>
                                        <p>Flood, cyclone, lightning, earthquake.</p>
                                    </div>
                                    <div className="feature">
                                        <span className="check">✓</span>
                                        <strong>Permanent Disability</strong>
                                        <p>Total disability preventing milk production.</p>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <Link to="/animal-insurance" className="btn btn-primary btn-large">Calculate Premium Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Farmers Trust SecureLife?</h2>

                    <div className="grid grid-3">
                        <div className="feature-card">
                            <div className="icon-box">⚡</div>
                            <h3>Fastest Claims</h3>
                            <p>Direct bank transfer within 7 days of claim approval. Minimal paperwork.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">💰</div>
                            <h3>Affordable Rates</h3>
                            <p>Low premiums starting from just 4% of cattle value per year.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">🏷️</div>
                            <h3>Tagging Support</h3>
                            <p>Our agents help with RFID ear tagging and valuation certification.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2 style={{ color: 'white' }}>Don't Wait for Mishaps</h2>
                    <p style={{ color: 'white' }}>Insure your Cow or Buffalo in less than 5 minutes.</p>
                    <div className="cta-buttons">
                        <Link to="/animal-insurance" className="btn btn-primary" style={{ color: 'white', border: "8px solid white", fontSize: '20px' }}>Buy Policy Now</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
