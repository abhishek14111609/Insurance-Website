import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <h3 className="footer-logo">🛡️ Pashudhan Suraksha</h3>
                        <p className="footer-description" style={{ color: "white" }}>
                            India's most trusted Cattle Insurance provider. Protecting your livestock, securing your livelihood.
                        </p>
                        {/* <div className="footer-social">
                            <a href="#" aria-label="Facebook"></a>
                            <a href="#" aria-label="Twitter"></a>
                            <a href="#" aria-label="Instagram"></a>
                        </div> */}
                    </div>

                    <div className="footer-column">
                        <h4>Our Product</h4>
                        <ul>
                            <li><Link to="/animal-insurance" style={{ color: "white" }}>Cattle Insurance</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Partner with Us</h4>
                        <ul>
                            <li><Link to="/become-agent" style={{ fontWeight: 600, color: 'var(--secondary-light)' }}>Become a POSP Agent</Link></li>
                        </ul>
                        <h4 style={{ marginTop: '1.5rem' }}>Quick Links</h4>
                        <ul>
                            <li><Link to="/about-us" style={{ color: "white" }}>About Us</Link></li>
                            <li><Link to="/contact-us" style={{ color: "white" }}>Contact Us</Link></li>
                            <li><Link to="/login" style={{ color: "white" }}>Farmer Login</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="tel:7990339567" style={{ color: "white" }}>📞 79903 39567</a></li>
                            <li><a href="tel:8347946718" style={{ color: "white" }}>📞 83479 46718 (Claims)</a></li>
                            <li><a href="mailto:pashudhansuraksha2026@gmail.com" style={{ color: "white" }}>✉️ pashudhansuraksha2026@gmail.com</a></li>
                            <li>
                                <p style={{ color: "white", display: 'flex', alignItems: 'flex-start', gap: '5px', margin: 0 }}>
                                    <span>📍</span>
                                    <span>Shop No-10, Second Floor, Suvidhi Solitaire, TB Road, Vijapur, Gujarat - 384570</span>
                                </p>
                            </li>
                            <li>🕐 24/7 Farmer Support</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-legal">
                    <p style={{ color: "white" }}>&copy; 2026 Pashudhan Suraksha. All rights reserved.</p>
                    <div className="footer-links">
                        <Link to="/privacy" style={{ color: "white" }}>Privacy Policy</Link>
                        <span>|</span>
                        <Link to="/terms" style={{ color: "white" }}>Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
