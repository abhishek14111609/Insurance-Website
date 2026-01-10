import React from 'react';
import { NavLink } from 'react-router-dom';
import './AgentSidebar.css';

const AgentSidebar = () => {
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

                {/* <div className="nav-group">
                    <h3>Analytics</h3>
                    <NavLink to="/agent/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">📈</span> Sales Reports
                    </NavLink>
                    <NavLink to="/agent/commissions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">💰</span> Commissions
                    </NavLink>
                </div> */}

                <div className="nav-group">
                    <h3>Support</h3>
                    <NavLink to="/agent/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="icon">👤</span> My Profile
                    </NavLink>
                    <NavLink to="/login" className="nav-item logout">
                        <span className="icon">🚪</span> Logout
                    </NavLink>
                </div>
            </nav>
        </aside>
    );
};

export default AgentSidebar;
