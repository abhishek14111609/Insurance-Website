import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAgent, logout } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        logout();
        closeMenu();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    Pashudhan Suraksha
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>Home</Link>
                    <Link to="/policies" className={`navbar-link ${location.pathname === '/policies' ? 'active' : ''}`} onClick={closeMenu}>Policies</Link>

                    {user ? (
                        <>
                            {isAgent ? (
                                <Link to="/agent/dashboard" className={`navbar-link portal-link ${location.pathname.startsWith('/agent') ? 'active' : ''}`} onClick={closeMenu}>
                                    💼 Agent Portal
                                </Link>
                            ) : (
                                <>
                                    <Link to="/my-policies" className={`navbar-link ${location.pathname === '/my-policies' ? 'active' : ''}`} onClick={closeMenu}>
                                        My Policies
                                    </Link>
                                    <Link to="/claims" className={`navbar-link ${location.pathname === '/claims' ? 'active' : ''}`} onClick={closeMenu}>
                                        Claims
                                    </Link>
                                    <Link to="/renewals" className={`navbar-link ${location.pathname === '/renewals' ? 'active' : ''}`} onClick={closeMenu}>
                                        Renewals
                                    </Link>
                                </>
                            )}

                            <Link to="/about-us" className={`navbar-link ${location.pathname === '/about-us' ? 'active' : ''}`} onClick={closeMenu}>
                                About Us
                            </Link>
                            <Link to="/contact-us" className={`navbar-link ${location.pathname === '/contact-us' ? 'active' : ''}`} onClick={closeMenu}>
                                Contact Us
                            </Link>

                            {/* Profile Dropdown - simplified */}
                            <div className={`navbar-dropdown profile-dropdown ${isProfileOpen ? 'active' : ''}`}>
                                <span className="navbar-link dropdown-trigger profile-trigger" onClick={toggleProfile}>
                                    <div className="nav-avatar">
                                        {user.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <span className="dropdown-arrow">▼</span>
                                </span>
                                <div className="dropdown-content right-aligned">
                                    <div className="dropdown-header">
                                        <strong>{user.fullName}</strong>
                                        <small>{user.email}</small>
                                        {isAgent && <span className="role-tag" style={{ background: 'var(--primary-color)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px' }}>Agent</span>}
                                    </div>
                                    {isAgent ? (
                                        <Link to="/agent/dashboard" onClick={closeMenu}>📊 Agent Dashboard</Link>
                                    ) : (
                                        <Link to="/dashboard" onClick={closeMenu}>📊 My Dashboard</Link>
                                    )}
                                    <Link to={isAgent ? "/agent/profile" : "/profile"} onClick={closeMenu}>⚙️ Profile Settings</Link>
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
                            <Link to="/about-us" className={`navbar-link ${location.pathname === '/about-us' ? 'active' : ''}`} onClick={closeMenu}>About Us</Link>
                            <Link to="/contact-us" className={`navbar-link ${location.pathname === '/contact-us' ? 'active' : ''}`} onClick={closeMenu}>Contact Us</Link>
                            <Link to="/become-partner" className={`navbar-link ${location.pathname === '/become-partner' ? 'active' : ''}`} onClick={closeMenu}>Become Partner</Link>
                            <Link to="/login" className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>Login</Link>
                            <Link to="/register" className={`navbar-btn ${location.pathname === '/register' ? 'active' : ''}`} onClick={closeMenu}>
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
