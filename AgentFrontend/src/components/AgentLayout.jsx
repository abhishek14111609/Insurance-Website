import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AgentSidebar from './AgentSidebar';
import AgentTopbar from './AgentTopbar';
import './AgentLayout.css';

const AgentLayout = () => {
    const { user, loading, refreshUser } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        refreshUser();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Don't show warnings while loading or if user data is missing
    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

    const isKycVerified = user?.kycStatus?.toLowerCase() === 'verified';

    return (
        <div className="agent-layout">
            <AgentSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Overlay for mobile */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <div className="agent-main">
                <AgentTopbar onToggleSidebar={toggleSidebar} />
                {!isKycVerified && (
                    <div className="kyc-banner">
                        <span className="banner-icon">⚠️</span>
                        <div className="banner-content">
                            <strong>KYC Verification Required:</strong> {user?.kycStatus === 'pending'
                                ? 'Your documents are currently under review. Some features may be restricted.'
                                : 'Please complete your KYC to unlock all features like policy issuance and withdrawals.'}
                            {user?.kycStatus !== 'pending' && <a href="/profile" className="kyc-link">Complete KYC Now</a>}
                        </div>
                    </div>
                )}
                <div className="agent-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AgentLayout;
