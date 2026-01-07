import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    🛡️ SecureLife
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>

                    <div className={`navbar-dropdown ${isDropdownOpen ? 'active' : ''}`}>
                        <span className="navbar-link dropdown-trigger" onClick={toggleDropdown}>
                            Products
                            <span className="dropdown-arrow">▼</span>
                        </span>
                        <div className="dropdown-content">
                            <Link to="/health-insurance" onClick={closeMenu}>🏥 Health Insurance</Link>
                            <Link to="/car-insurance" onClick={closeMenu}>🚗 Car Insurance</Link>
                            <Link to="/bike-insurance" onClick={closeMenu}>🏍️ Bike Insurance</Link>
                            <Link to="/travel-insurance" onClick={closeMenu}>✈️ Travel Insurance</Link>
                        </div>
                    </div>
                    <Link to="/services" className="navbar-link" onClick={closeMenu}>Services</Link>
                    <Link to="/faq" className="navbar-link" onClick={closeMenu}>FAQ</Link>
                    
                    <Link to="/compare-plans" className="navbar-link" onClick={closeMenu}>Compare</Link>
                    <Link to="/renewals" className="navbar-link" onClick={closeMenu}>Renewals</Link>
                    <Link to="/claims" className="navbar-link" onClick={closeMenu}>Claims</Link>
                    <Link to="/about-us" className="navbar-link" onClick={closeMenu}>About</Link>

                    <Link to="/contact-us" className="navbar-btn" onClick={closeMenu}>
                        Contact Us
                    </Link>
                </div>

                <div className="navbar-toggle" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
