import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isCustomerLoggedIn, getCurrentCustomer, logoutCustomer } from '../utils/authUtils';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [customer, setCustomer] = useState(null);

    // Check login status on mount and when navigating
    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = isCustomerLoggedIn();
            if (loggedIn) {
                setCustomer(getCurrentCustomer());
            } else {
                setCustomer(null);
            }
        };

        checkLogin();

        // Listen for storage events (multi-tab support)
        window.addEventListener('storage', checkLogin);
        return () => window.removeEventListener('storage', checkLogin);
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleLogout = () => {
        logoutCustomer();
        setCustomer(null);
        closeMenu();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    🛡️ SecureLife
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>

                    {/* Exclusive Cattle Insurance Link */}
                    <Link to="/animal-insurance" className="navbar-link highlight-link" onClick={closeMenu}>
                        🐮 Cattle Insurance
                    </Link>

                    {customer ? (
                        <>
                            <div className={`navbar-dropdown profile-dropdown ${isProfileOpen ? 'active' : ''}`}>
                                <span className="navbar-link dropdown-trigger profile-trigger" onClick={toggleProfile}>
                                    <div className="nav-avatar">
                                        {customer.fullName.charAt(0)}
                                    </div>
                                    <span className="dropdown-arrow">▼</span>
                                </span>
                                <div className="dropdown-content right-aligned">
                                    <div className="dropdown-header">
                                        <strong>{customer.fullName}</strong>
                                        <small>{customer.email}</small>
                                    </div>
                                    <Link to="/profile" onClick={closeMenu}>👤 My Profile</Link>
                                    <Link to="/profile" state={{ activeTab: 'policies' }} onClick={closeMenu}>📄 My Policies</Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/become-agent" className="navbar-link" onClick={closeMenu}>Become a Partner</Link>
                            <Link to="/login" className="navbar-link" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="navbar-btn" onClick={closeMenu}>
                                Sign Up (Farmer)
                            </Link>
                        </>
                    )}

                    {!customer && (
                        <Link to="/contact-us" className="navbar-btn-outline" onClick={closeMenu}>
                            Contact Us
                        </Link>
                    )}
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
