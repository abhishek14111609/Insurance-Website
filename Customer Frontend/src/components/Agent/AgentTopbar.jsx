import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './AgentTopbar.css';

const AgentTopbar = () => {
    const { user } = useAuth();

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <header className="agent-topbar">
            {/* <div className="topbar-search">
                <input type="text" placeholder="Search policies, customers..." />
            </div> */}

            <div className="topbar-actions">
                <button className="icon-btn">🔔</button>
                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{user?.fullName || 'Agent'}</span>
                        <span className="user-role">
                            {user?.level ? `Level ${user.level} Agent` : 'Agent Partner'}
                        </span>
                    </div>
                    <div className="user-avatar">
                        {getInitials(user?.fullName)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AgentTopbar;
