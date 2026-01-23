import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, claimAPI } from '../services/api.service';
import { CardSkeleton } from '../components/Loader';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isAgent } = useAuth();

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
        }
    }, [isAgent, navigate]);

    const [policies, setPolicies] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPolicies: 0,
        activePolicies: 0,
        pendingPolicies: 0,
        totalCoverage: 0,
        totalClaims: 0,
        pendingClaims: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch policies
            const policiesResponse = await policyAPI.getAll();
            if (policiesResponse.success) {
                const customerPolicies = policiesResponse.data.policies;
                setPolicies(customerPolicies);

                const totalPolicies = customerPolicies.length;
                const activePolicies = customerPolicies.filter(p => p.status === 'APPROVED').length;
                const pendingPolicies = customerPolicies.filter(p => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length;
                const totalCoverage = customerPolicies
                    .filter(p => p.status === 'APPROVED')
                    .reduce((sum, p) => sum + (parseFloat(p.coverageAmount) || 0), 0);

                setStats(prev => ({ ...prev, totalPolicies, activePolicies, pendingPolicies, totalCoverage }));
            }

            // Fetch claims
            const claimsResponse = await claimAPI.getAll();
            if (claimsResponse.success) {
                const customerClaims = claimsResponse.data.claims;
                setClaims(customerClaims);

                const totalClaims = customerClaims.length;
                const pendingClaims = customerClaims.filter(c => c.status === 'pending' || c.status === 'under_review').length;

                setStats(prev => ({ ...prev, totalClaims, pendingClaims }));
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Welcome back, {user?.fullName || 'Customer'}!</h1>
                    <p>Here's an overview of your insurance portfolio</p>
                </div>

                <div className="stats-grid">
                    {loading ? (
                        <>
                            <CardSkeleton count={1} />
                            <CardSkeleton count={1} />
                            <CardSkeleton count={1} />
                            <CardSkeleton count={1} />
                            <CardSkeleton count={1} />
                            <CardSkeleton count={1} />
                        </>
                    ) : (
                        <>
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
                                    <p>Pending Actions</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-content">
                                    <h3>₹{stats.totalCoverage.toLocaleString()}</h3>
                                    <p>Total Coverage</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🏥</div>
                                <div className="stat-content">
                                    <h3>{stats.totalClaims}</h3>
                                    <p>Total Claims</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🔍</div>
                                <div className="stat-content">
                                    <h3>{stats.pendingClaims}</h3>
                                    <p>Pending Claims</p>
                                </div>
                            </div>
                        </>
                    )}
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
                        <button className="action-card" onClick={() => navigate('/claims')}>
                            <span className="action-icon">�</span>
                            <span>View Claims</span>
                        </button>
                    </div>
                </div>

                {policies.length > 0 && (
                    <div className="recent-policies">
                        <div className="section-header">
                            <h2>Recent Policies</h2>
                            <button className="view-all-btn" onClick={() => navigate('/my-policies')}>
                                View All →
                            </button>
                        </div>
                        <div className="policies-list">
                            {policies.slice(0, 3).map((policy) => (
                                <div key={policy.id} className="policy-item" onClick={() => navigate(`/policy/${policy.id}`)}>
                                    <div className="policy-info">
                                        <strong>{policy.policyNumber || 'Processing...'}</strong>
                                        <span>{policy.tagId || policy.cattleType}</span>
                                    </div>
                                    <div className="policy-status">
                                        <span className={`badge ${policy.status ? policy.status.toLowerCase() : 'pending'}`}>
                                            {policy.status === 'PENDING_APPROVAL' ? 'In Review' : policy.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {claims.length > 0 && (
                    <div className="recent-claims">
                        <div className="section-header">
                            <h2>Recent Claims</h2>
                            <button className="view-all-btn" onClick={() => navigate('/claims')}>
                                View All →
                            </button>
                        </div>
                        <div className="claims-list">
                            {claims.slice(0, 3).map((claim) => (
                                <div key={claim.id} className="claim-item">
                                    <div className="claim-info">
                                        <strong>Claim #{claim.claimNumber}</strong>
                                        <span>{claim.claimType}</span>
                                    </div>
                                    <div className="claim-status">
                                        <span className={`badge ${claim.status}`}>
                                            {claim.status}
                                        </span>
                                        <span className="claim-amount">₹{claim.claimAmount?.toLocaleString()}</span>
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
