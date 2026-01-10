import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerPolicies } from '../utils/authUtils';
import './Renewals.css';

const Renewals = () => {
    const navigate = useNavigate();
    const [expiringPolicies, setExpiringPolicies] = useState([]);

    useEffect(() => {
        const policies = getCustomerPolicies();
        const today = new Date();
        const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const expiring = policies.filter(policy => {
            const endDate = new Date(policy.endDate);
            return endDate >= today && endDate <= thirtyDaysLater;
        });

        setExpiringPolicies(expiring);
    }, []);

    const getDaysUntilExpiry = (endDate) => {
        const today = new Date();
        const expiry = new Date(endDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="renewals-page">
            <div className="container">
                <div className="page-header">
                    <h1>Policy Renewals</h1>
                    <p>Renew your policies before they expire</p>
                </div>

                {expiringPolicies.length > 0 ? (
                    <div className="renewals-grid">
                        {expiringPolicies.map((policy) => {
                            const daysLeft = getDaysUntilExpiry(policy.endDate);
                            const isUrgent = daysLeft <= 7;

                            return (
                                <div key={policy.id} className={`renewal-card ${isUrgent ? 'urgent' : ''}`}>
                                    {isUrgent && (
                                        <div className="urgent-badge">⚠️ Expires in {daysLeft} days</div>
                                    )}

                                    <div className="renewal-header">
                                        <h3>{policy.policyNumber}</h3>
                                        <span className="expiry-date">
                                            Expires: {policy.endDate}
                                        </span>
                                    </div>

                                    <div className="renewal-body">
                                        <div className="cattle-info">
                                            <span>{policy.petType === 'cow' ? '🐄' : '🐃'}</span>
                                            <div>
                                                <strong>{policy.tagId || policy.petName}</strong>
                                                <p>{policy.petBreed}</p>
                                            </div>
                                        </div>

                                        <div className="renewal-details">
                                            <div className="detail-row">
                                                <span>Coverage:</span>
                                                <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Days Left:</span>
                                                <strong className={isUrgent ? 'text-error' : ''}>
                                                    {daysLeft} days
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={() => navigate('/renew', { state: { policy } })}
                                    >
                                        Renew Now
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">🔄</span>
                        <h3>No Renewals Due</h3>
                        <p>All your policies are up to date! Check back later.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/my-policies')}>
                            View My Policies
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Renewals;
