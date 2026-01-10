import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isCustomerLoggedIn, getCurrentCustomer, logoutCustomer } from '../utils/authUtils';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [customer, setCustomer] = useState(null);

    // Check login status on mount, location change, and custom events
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

        // Listen for custom login event
        window.addEventListener('customerLogin', checkLogin);

        return () => {
            window.removeEventListener('storage', checkLogin);
            window.removeEventListener('customerLogin', checkLogin);
        };
    }, [location]); // Re-run when location changes

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
                    <Link to="/policies" className="navbar-link" onClick={closeMenu}>Policies</Link>

                    {customer ? (
                        <>
                            {/* Top-level navigation items for logged-in users */}
                            <Link to="/my-policies" className="navbar-link" onClick={closeMenu}>
                                My Policies
                            </Link>
                            <Link to="/claims" className="navbar-link" onClick={closeMenu}>
                                Claims
                            </Link>
                            <Link to="/renewals" className="navbar-link" onClick={closeMenu}>
                                Renewals
                            </Link>
                            <Link to="/about-us" className="navbar-link" onClick={closeMenu}>
                                About Us
                            </Link>
                            <Link to="/contact-us" className="navbar-link" onClick={closeMenu}>
                                Contact Us
                            </Link>

                            {/* Profile Dropdown - simplified */}
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
                                    <Link to="/dashboard" onClick={closeMenu}>📊 Dashboard</Link>
                                    <Link to="/profile" onClick={closeMenu}>⚙️ Profile Settings</Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>

                            {/* Notification Bell */}
                            <NotificationBell />
                        </>
                    ) : (
                        <>
                            <Link to="/about-us" className="navbar-link" onClick={closeMenu}>About Us</Link>
                            <Link to="/contact-us" className="navbar-link" onClick={closeMenu}>Contact Us</Link>
                            <Link to="/become-partner" className="navbar-link" onClick={closeMenu}>Become Partner</Link>
                            <Link to="/login" className="navbar-link" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="navbar-btn" onClick={closeMenu}>
                                Sign Up
                            </Link>
                        </>
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
