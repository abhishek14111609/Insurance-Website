import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/numberUtils';
import './MyPolicies.css';

const MyPolicies = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();
    const [policies, setPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/policies');
            return;
        }
        const fetchPolicies = async () => {
            try {
                setIsLoading(true);
                const response = await policyAPI.getAll();
                if (response.success) {
                    setPolicies(response.data.policies);
                }
            } catch (err) {
                console.error('Error fetching policies:', err);
                setError('Failed to load policies. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'status-pending', icon: '⏳', text: 'Payment Pending' },
            PENDING_APPROVAL: { class: 'status-pending', icon: '🕑', text: 'Approval Pending' },
            APPROVED: { class: 'status-approved', icon: '✅', text: 'Active Policy' },
            REJECTED: { class: 'status-rejected', icon: '❌', text: 'Rejected' },
            EXPIRED: { class: 'status-expired', icon: '⚠️', text: 'Expired' }
        };
        return badges[status] || badges.PENDING;
    };

    const filteredPolicies = filter === 'ALL'
        ? policies
        : policies.filter(p => {
            if (filter === 'PENDING') return p.status === 'PENDING' || p.status === 'PENDING_APPROVAL';
            return p.status === filter;
        });

    if (isLoading) {
        return (
            <div className="my-policies-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your policies...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-policies-page">
                <div className="container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="buy-policy-btn" onClick={() => window.location.reload()}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-policies-page">
            <div className="container">
                <header className="page-header">
                    <h1>My Policies</h1>
                    <button className="buy-policy-btn" onClick={() => navigate('/policies')}>
                        <span>+</span> Buy New Policy
                    </button>
                </header>

                <div className="filter-tabs">
                    <button
                        className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        All Policies ({policies.length})
                    </button>
                    <button
                        className={`tab-btn ${filter === 'PENDING' ? 'active' : ''}`}
                        onClick={() => setFilter('PENDING')}
                    >
                        Pending ({policies.filter(p => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length})
                    </button>
                    <button
                        className={`tab-btn ${filter === 'APPROVED' ? 'active' : ''}`}
                        onClick={() => setFilter('APPROVED')}
                    >
                        Active ({policies.filter(p => p.status === 'APPROVED').length})
                    </button>
                    <button
                        className={`tab-btn ${filter === 'EXPIRED' ? 'active' : ''}`}
                        onClick={() => setFilter('EXPIRED')}
                    >
                        Expired ({policies.filter(p => p.status === 'EXPIRED').length})
                    </button>
                </div>

                {filteredPolicies.length > 0 ? (
                    <div className="policies-grid">
                        {filteredPolicies.map((policy) => {
                            const badge = getStatusBadge(policy.status);
                            return (
                                <div key={policy.id} className="policy-card">
                                    <div className="policy-card-header">
                                        <span className="policy-number">#{policy.policyNumber || 'PROCESSING'}</span>
                                        <div className={`status-badge ${badge.class}`}>
                                            <span>{badge.icon}</span>
                                            {badge.text}
                                        </div>
                                    </div>

                                    <div className="policy-card-body">
                                        <div className="cattle-info">
                                            <div className="cattle-icon-wrapper">
                                                {policy.cattleType === 'cow' ? '🐄' : '🐃'}
                                            </div>
                                            <div className="cattle-details">
                                                <h3>Tag: {policy.tagId}</h3>
                                                <p className="cattle-breed">{policy.breed} • {policy.age} Years</p>
                                            </div>
                                        </div>

                                        <div className="policy-details">
                                            <div className="detail-row">
                                                <span className="label">Start Date</span>
                                                <span className="value">{new Date(policy.startDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">End Date</span>
                                                <span className="value">{new Date(policy.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Sum Insured</span>
                                                <span className="value">{formatCurrency(policy.coverageAmount)}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Premium</span>
                                                <span className="value amount">{formatCurrency(policy.premium)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="policy-card-footer">
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`/policy/${policy.id}`)}
                                        >
                                            View Details
                                        </button>

                                        {policy.status === 'APPROVED' && (
                                            <button
                                                className="btn-action"
                                                onClick={() => navigate('/claims/new', { state: { policy } })}
                                            >
                                                File Claim
                                            </button>
                                        )}
                                        {policy.status === 'PENDING' && (
                                            <button
                                                className="btn-action"
                                                onClick={() => navigate('/payment', { state: { policyId: policy.id } })}
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">🛡️</span>
                        <h3>No Policies Found</h3>
                        <p>
                            {filter === 'ALL'
                                ? "You haven't purchased any insurance policies yet."
                                : `You don't have any ${filter.toLowerCase()} policies.`
                            }
                        </p>
                        <button className="buy-policy-btn" onClick={() => navigate('/policies')}>
                            Protect Your Cattle Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPolicies;
