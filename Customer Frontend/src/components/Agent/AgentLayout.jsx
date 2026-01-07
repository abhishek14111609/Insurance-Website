import React from 'react';
import { Outlet } from 'react-router-dom';
import AgentSidebar from './AgentSidebar';
import AgentTopbar from './AgentTopbar';
import './AgentLayout.css';

const AgentLayout = () => {
    return (
        <div className="agent-layout">
            <AgentSidebar />
            <div className="agent-main">
                <AgentTopbar />
                <div className="agent-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AgentLayout;
