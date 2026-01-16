import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-column">
                        <h3 className="footer-logo">🛡️ SecureLife Insurance</h3>
                        <p className="footer-description" style={{color: "white"}}>
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
                            <li><Link to="/animal-insurance" style={{color: "white"}}>Cattle Insurance</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Partner with Us</h4>
                        <ul>
                            <li><Link to="/become-agent" style={{ fontWeight: 600, color: 'var(--secondary-light)' }}>Become a POSP Agent</Link></li>
                        </ul>
                        <h4 style={{ marginTop: '1.5rem' }}>Quick Links</h4>
                        <ul>
                            <li><Link to="/about-us" style={{color: "white"}}>About Us</Link></li>
                            <li><Link to="/contact-us" style={{color: "white"}}>Contact Us</Link></li>
                            <li><Link to="/login" style={{color: "white"}}>Farmer Login</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="tel:1800-123-4567" style={{color: "white"}}>📞 1800-123-4567</a></li>
                            <li><a href="mailto:support@securelife.com" style={{color: "white"}}>✉️ support@securelife.com</a></li>
                            <li>🕐 24/7 Farmer Support</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-legal">
                    <p style={{color: "white"}}>&copy; 2026 SecureLife Insurance. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#" style={{color: "white"}}>Privacy Policy</a>
                        <span>|</span>
                        <a href="#" style={{color: "white"}}>Terms & Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
