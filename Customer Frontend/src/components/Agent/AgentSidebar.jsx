import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AgentSidebar.css';

const AgentSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    return (
        <aside className="agent-sidebar">
            <div className="sidebar-header">
                <h2>🛡️ SecureLife</h2>
                <span>Agent Portal</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <h3>Main</h3>
                    <NavLink to="/agent/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">📊</span> Dashboard
                    </NavLink>
                    <NavLink to="/agent/policies" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">📄</span> Policies
                    </NavLink>
                    <NavLink to="/agent/customers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">👥</span> Customers
                    </NavLink>
                    <NavLink to="/agent/wallet" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">💰</span> Wallet
                    </NavLink>
                    <NavLink to="/agent/team" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">🌳</span> My Team
                    </NavLink>
                </div>

                <div className="nav-group">
                    <h3>Support</h3>
                    <NavLink to="/agent/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
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
