import React from 'react';
import './AgentTopbar.css';

const AgentTopbar = () => {
    return (
        <header className="agent-topbar">
            <div className="topbar-search">
                <input type="text" placeholder="Search policies, customers..." />
            </div>

            <div className="topbar-actions">
                <button className="icon-btn">🔔<span className="badge">3</span></button>
                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">Alex Smith</span>
                        <span className="user-role">Senior Agent</span>
                    </div>
                    <div className="user-avatar">AS</div>
                </div>
            </div>
        </header>
    );
};

export default AgentTopbar;
