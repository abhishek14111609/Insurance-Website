import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AgentSidebar.css';

const AgentSidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isKycVerified = user?.kycStatus?.toLowerCase() === 'verified';

    const handleLogout = (e) => {
        e.preventDefault();
        if (window.innerWidth <= 1024 && onClose) {
            onClose();
        }
        logout();
        navigate('/login');
    };

    // Close sidebar when clicking a link on mobile
    const handleNavClick = () => {
        if (window.innerWidth <= 1024 && onClose) {
            onClose();
        }
    };

    return (
        <aside className={`agent-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>🛡️ Pashudhan Suraksha</h2>
                <span>Agent Portal</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <h3>Main</h3>
                    <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">📊</span> Dashboard
                    </NavLink>
                    <NavLink to="/sell" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">➕</span> Sell Policy
                    </NavLink>
                    <NavLink to="/policies" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">📄</span> Policies
                    </NavLink>
                    <NavLink to="/renewals" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">🔄</span> Renewals
                    </NavLink>
                    <NavLink to="/analytics" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">📊</span> Analytics
                    </NavLink>
                    <NavLink to="/customers" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">👥</span> Customers
                    </NavLink>
                    <NavLink to="/wallet" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">💰</span> Wallet {!isKycVerified && <span className="restricted-badge">!</span>}
                    </NavLink>
                    <NavLink to="/team" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">🌳</span> My Team
                    </NavLink>
                    <NavLink to="/notifications" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">🔔</span> Notifications
                    </NavLink>
                </div>

                <div className="nav-group">
                    <h3>Support</h3>
                    <NavLink to="/profile" onClick={handleNavClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">👤</span> My Profile
                    </NavLink>
                    <button onClick={handleLogout} className="nav-item logout" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                        <span className="icon">🚪</span> Logout
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default AgentSidebar;
