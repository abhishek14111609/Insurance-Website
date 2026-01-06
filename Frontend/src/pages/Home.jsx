import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title fade-in-up">
                        Protect What Matters Most
                    </h1>
                    <p className="hero-subtitle fade-in-up">
                        Comprehensive insurance solutions for your health, vehicles, travel, and family.
                        Get instant quotes and 24/7 claims support.
                    </p>
                    <div className="hero-buttons fade-in-up">
                        <Link to="/health-insurance" className="btn btn-primary">Get Started</Link>
                        <Link to="/about-us" className="btn btn-outline">Learn More</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">5M+</span>
                            <span className="stat-text">Happy Customers</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">15,000+</span>
                            <span className="stat-text">Network Hospitals</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">10,000+</span>
                            <span className="stat-text">Cashless Garages</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Insurance Products Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Our Insurance Products</h2>
                    <p className="section-subtitle">
                        Choose from our wide range of insurance plans tailored to your needs
                    </p>
                    <div className="grid grid-4">
                        <Link to="/health-insurance" className="product-card">
                            <div className="product-icon">🏥</div>
                            <h3>Health Insurance</h3>
                            <p>Comprehensive coverage with cashless hospitalization at 15,000+ network hospitals</p>
                            <ul className="product-features">
                                <li>✓ Cashless Treatment</li>
                                <li>✓ No Claim Bonus</li>
                                <li>✓ Tax Benefits</li>
                            </ul>
                            <span className="product-link">Explore Plans →</span>
                        </Link>

                        <Link to="/car-insurance" className="product-card">
                            <div className="product-icon">🚗</div>
                            <h3>Car Insurance</h3>
                            <p>Zero depreciation cover with instant claim settlement at 10,000+ garages</p>
                            <ul className="product-features">
                                <li>✓ Zero Depreciation</li>
                                <li>✓ Roadside Assistance</li>
                                <li>✓ Quick Settlement</li>
                            </ul>
                            <span className="product-link">Get Quote →</span>
                        </Link>

                        <Link to="/bike-insurance" className="product-card">
                            <div className="product-icon">🏍️</div>
                            <h3>Bike Insurance</h3>
                            <p>Affordable two-wheeler insurance with comprehensive coverage and add-ons</p>
                            <ul className="product-features">
                                <li>✓ Personal Accident</li>
                                <li>✓ Theft Protection</li>
                                <li>✓ Engine Protection</li>
                            </ul>
                            <span className="product-link">View Plans →</span>
                        </Link>

                        <Link to="/travel-insurance" className="product-card">
                            <div className="product-icon">✈️</div>
                            <h3>Travel Insurance</h3>
                            <p>Travel worry-free with coverage for medical emergencies and trip cancellations</p>
                            <ul className="product-features">
                                <li>✓ Medical Coverage</li>
                                <li>✓ Baggage Loss</li>
                                <li>✓ Trip Cancellation</li>
                            </ul>
                            <span className="product-link">Buy Now →</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Why Choose SecureLife?</h2>
                    <p className="section-subtitle">
                        We're committed to making insurance simple, affordable, and reliable
                    </p>
                    <div className="grid grid-3">
                        <div className="feature-card">
                            <div className="icon-box">🎯</div>
                            <h3>Instant Policy Issuance</h3>
                            <p>Get your insurance policy instantly online with just a few clicks. No paperwork hassle.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">💰</div>
                            <h3>Best Prices Guaranteed</h3>
                            <p>Compare quotes from multiple insurers and get the best price for your insurance needs.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">⚡</div>
                            <h3>Quick Claim Settlement</h3>
                            <p>24/7 claims support with fast processing and settlement within 3-7 working days.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">🏆</div>
                            <h3>20+ Years of Trust</h3>
                            <p>Serving India with technology-driven insurance solutions backed by human care.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">🔒</div>
                            <h3>100% Secure</h3>
                            <p>Your data is completely secure with industry-standard encryption and compliance.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">🤝</div>
                            <h3>Expert Guidance</h3>
                            <p>Get personalized advice from our insurance experts at every step of your journey.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Testimonials */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">What Our Customers Say</h2>
                    <p className="section-subtitle">
                        Real experiences from real people who trust us
                    </p>
                    <div className="grid grid-3">
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "The claim process was incredibly smooth. HDFC SecureLife team was there at every step.
                                Got my claim settled within 4 days!"
                            </p>
                            <div className="testimonial-author">
                                <strong>Priya Sharma</strong>
                                <span>Health Insurance Customer</span>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "Best car insurance I've ever had. Zero depreciation cover saved me thousands.
                                Cashless repairs at my doorstep!"
                            </p>
                            <div className="testimonial-author">
                                <strong>Rahul Verma</strong>
                                <span>Car Insurance Customer</span>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "Affordable premiums and excellent coverage. The online process was simple and quick.
                                Highly recommend!"
                            </p>
                            <div className="testimonial-author">
                                <strong>Anita Desai</strong>
                                <span>Family Health Insurance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Get Protected?</h2>
                    <p>Get instant quotes and buy insurance online in minutes</p>
                    <div className="cta-buttons">
                        <Link to="/health-insurance" className="btn btn-primary">Get Free Quote</Link>
                        <Link to="/contact-us" className="btn btn-outline">Talk to Expert</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
