import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentCustomer, getCustomerPolicies } from '../utils/authUtils';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [stats, setStats] = useState({
        totalPolicies: 0,
        activePolicies: 0,
        pendingPolicies: 0,
        totalCoverage: 0
    });

    useEffect(() => {
        const user = getCurrentCustomer();
        setCustomer(user);

        const customerPolicies = getCustomerPolicies();
        setPolicies(customerPolicies);

        const totalPolicies = customerPolicies.length;
        const activePolicies = customerPolicies.filter(p => p.status === 'APPROVED').length;
        const pendingPolicies = customerPolicies.filter(p => p.status === 'PENDING').length;
        const totalCoverage = customerPolicies
            .filter(p => p.status === 'APPROVED')
            .reduce((sum, p) => sum + (p.coverageAmount || 0), 0);

        setStats({ totalPolicies, activePolicies, pendingPolicies, totalCoverage });
    }, []);

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Welcome back, {customer?.fullName}!</h1>
                    <p>Here's an overview of your insurance portfolio</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div className="stat-content">
                            <h3>{stats.totalPolicies}</h3>
                            <p>Total Policies</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>{stats.activePolicies}</h3>
                            <p>Active Policies</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>{stats.pendingPolicies}</h3>
                            <p>Pending Approval</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>₹{stats.totalCoverage.toLocaleString()}</h3>
                            <p>Total Coverage</p>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <button className="action-card" onClick={() => navigate('/policies')}>
                            <span className="action-icon">🛡️</span>
                            <span>Buy New Policy</span>
                        </button>
                        <button className="action-card" onClick={() => navigate('/my-policies')}>
                            <span className="action-icon">📋</span>
                            <span>View Policies</span>
                        </button>
                        <button className="action-card" onClick={() => navigate('/claims/new')}>
                            <span className="action-icon">🏥</span>
                            <span>File Claim</span>
                        </button>
                        <button className="action-card" onClick={() => navigate('/renewals')}>
                            <span className="action-icon">🔄</span>
                            <span>Renew Policy</span>
                        </button>
                    </div>
                </div>

                {policies.length > 0 && (
                    <div className="recent-policies">
                        <h2>Recent Policies</h2>
                        <div className="policies-list">
                            {policies.slice(0, 3).map((policy) => (
                                <div key={policy.id} className="policy-item">
                                    <div className="policy-info">
                                        <strong>{policy.policyNumber}</strong>
                                        <span>{policy.tagId || policy.petName}</span>
                                    </div>
                                    <div className="policy-status">
                                        <span className={`badge ${policy.status.toLowerCase()}`}>
                                            {policy.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
