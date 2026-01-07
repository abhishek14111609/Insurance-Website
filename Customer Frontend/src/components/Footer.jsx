import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <h3 className="footer-logo">🛡️ SecureLife Insurance</h3>
                        <p className="footer-description">
                            Your trusted partner in providing comprehensive insurance solutions
                            for life, health, vehicles, and travel. Protecting what matters most.
                        </p>
                        <div className="footer-social">
                            <a href="#" aria-label="Facebook">📘</a>
                            <a href="#" aria-label="Twitter">🐦</a>
                            <a href="#" aria-label="LinkedIn">💼</a>
                            <a href="#" aria-label="Instagram">📷</a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Insurance Products</h4>
                        <ul>
                            <li><Link to="/health-insurance">Health Insurance</Link></li>
                            <li><Link to="/car-insurance">Car Insurance</Link></li>
                            <li><Link to="/bike-insurance">Bike Insurance</Link></li>
                            <li><Link to="/travel-insurance">Travel Insurance</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Partner with Us</h4>
                        <ul>
                            <li><Link to="/become-agent" style={{ fontWeight: 600, color: 'var(--secondary-light)' }}>Become a POSP Agent</Link></li>
                            <li><Link to="/become-agent#login">Partner Login</Link></li>
                        </ul>
                        <h4 style={{ marginTop: '1.5rem' }}>Quick Links</h4>
                        <ul>
                            <li><Link to="/about-us">About Us</Link></li>
                            <li><Link to="/compare-plans">Compare Plans</Link></li>
                            <li><Link to="/renewals">Renew Policy</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/claims">File a Claim</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="tel:1800-123-4567">📞 1800-123-4567</a></li>
                            <li><a href="mailto:support@securelife.com">✉️ support@securelife.com</a></li>
                            <li>🕐 24/7 Customer Support</li>
                            <li>📍 Network Hospitals</li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Newsletter</h4>
                        <p className="footer-description">Subscribe to get updates on insurance tips and offers</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Enter your email" />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-stats">
                        <div className="stat-item">
                            <span className="stat-number">5M+</span>
                            <span className="stat-label">Happy Customers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">15000+</span>
                            <span className="stat-label">Network Hospitals</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10000+</span>
                            <span className="stat-label">Cashless Garages</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">20+</span>
                            <span className="stat-label">Years of Service</span>
                        </div>
                    </div>
                </div>

                <div className="footer-legal">
                    <p>&copy; 2026 SecureLife Insurance. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <span>|</span>
                        <a href="#">Terms & Conditions</a>
                        <span>|</span>
                        <a href="#">Disclaimer</a>
                        <span>|</span>
                        <a href="#">Sitemap</a>
                    </div>
                </div>

                <div className="footer-disclaimer">
                    <p>
                        <strong>BEWARE OF FRAUDULENT CALLS:</strong> IRDAI or its officials do not involve in activities
                        like selling insurance policies, announcing bonus or investment of premiums.
                        Public receiving such phone calls are requested to lodge a police complaint.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
