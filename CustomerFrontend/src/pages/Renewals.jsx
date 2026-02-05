import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI } from '../services/api.service';
import './Renewals.css';

const Renewals = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();
    const [expiringPolicies, setExpiringPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
            return;
        }

        const fetchPolicies = async () => {
            try {
                setLoading(true);
                const response = await policyAPI.getAll();
                if (response.success) {
                    const policies = response.data.policies || [];
                    const today = new Date();

                    const eligible = policies.filter(policy => {
                        // Filter out irrelevant statuses
                        if (policy.status === 'RENEWED' || policy.status === 'CANCELLED' || policy.status === 'REJECTED' || policy.status === 'PENDING') return false;

                        const endDate = new Date(policy.endDate);
                        const daysToExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                        // Logic:
                        // 1. Policy is Expired (daysToExpiry < 0)
                        // 2. Policy is expiring soon (e.g., within 60 days) to give users ample time
                        // For testing purposes, we can even show policies expiring within 365 days if needed, but 60 is standard.
                        // Let's set it to 60 days.

                        return daysToExpiry <= 60;
                    });

                    setExpiringPolicies(eligible);
                }
            } catch (error) {
                console.error('Error fetching policies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, [isAgent, navigate]);

    const getDaysUntilExpiry = (endDate) => {
        const today = new Date();
        const expiry = new Date(endDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="renewals-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading renewals...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="renewals-page">
            <div className="container">
                <div className="page-header">
                    <h1>Policy Renewals</h1>
                    <p>Renew your policies before they expire to ensure continuous coverage.</p>
                </div>

                {expiringPolicies.length > 0 ? (
                    <div className="renewals-grid">
                        {expiringPolicies.map((policy) => {
                            const daysLeft = getDaysUntilExpiry(policy.endDate);
                            const isExpired = daysLeft < 0;
                            const isUrgent = daysLeft <= 15 && !isExpired;

                            return (
                                <div key={policy.id} className={`renewal-card ${isExpired ? 'expired' : ''} ${isUrgent ? 'urgent' : ''}`}>
                                    {isUrgent && (
                                        <div className="urgent-badge">⚠️ Expires in {daysLeft} days</div>
                                    )}
                                    {isExpired && (
                                        <div className="expired-badge">❌ Expired</div>
                                    )}

                                    <div className="renewal-header">
                                        <h3>{policy.policyNumber}</h3>
                                        <span className={`expiry-date ${isExpired ? 'text-danger' : ''}`}>
                                            {isExpired ? 'Expired on:' : 'Expires:'} {new Date(policy.endDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="renewal-body">
                                        <div className="cattle-info">
                                            <span className="cattle-icon">{policy.cattleType === 'cow' ? '🐄' : '🐃'}</span>
                                            <div>
                                                <strong>{policy.tagId}</strong>
                                                <p>{policy.breed || 'Unknown Breed'}</p>
                                            </div>
                                        </div>

                                        <div className="renewal-details">
                                            <div className="detail-row">
                                                <span>Coverage:</span>
                                                <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Type:</span>
                                                <strong>{policy.cattleType}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={() => navigate('/renew', { state: { policy } })}
                                    >
                                        {isExpired ? 'Renew Expired Policy' : 'Renew Now'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">✅</span>
                        <h3>No Renewals Due</h3>
                        <p>Great! All your active policies are up to date. Renewals will appear here 60 days before expiry.</p>
                        <button className="btn btn-secondary" onClick={() => navigate('/my-policies')}>
                            View All Policies
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Renewals;
