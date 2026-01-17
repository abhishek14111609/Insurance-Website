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
            PENDING: { class: 'status-pending', icon: '🟡', text: 'Payment Pending' },
            PENDING_APPROVAL: { class: 'status-pending', icon: '⏳', text: 'Pending Approval' },
            APPROVED: { class: 'status-approved', icon: '🟢', text: 'Active' },
            REJECTED: { class: 'status-rejected', icon: '🔴', text: 'Rejected' },
            EXPIRED: { class: 'status-expired', icon: '⚪', text: 'Expired' }
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
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-policies-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Policies</h1>
                    <button className="btn btn-primary" onClick={() => navigate('/policies')}>
                        + Buy New Policy
                    </button>
                </div>

                <div className="filter-tabs">
                    <button
                        className={filter === 'ALL' ? 'active' : ''}
                        onClick={() => setFilter('ALL')}
                    >
                        All ({policies.length})
                    </button>
                    <button
                        className={filter === 'PENDING' ? 'active' : ''}
                        onClick={() => setFilter('PENDING')}
                    >
                        Pending ({policies.filter(p => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length})
                    </button>
                    <button
                        className={filter === 'APPROVED' ? 'active' : ''}
                        onClick={() => setFilter('APPROVED')}
                    >
                        Active ({policies.filter(p => p.status === 'APPROVED').length})
                    </button>
                    <button
                        className={filter === 'EXPIRED' ? 'active' : ''}
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
                                        <span className="policy-number">{policy.policyNumber || 'Processing...'}</span>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon} {badge.text}
                                        </span>
                                    </div>

                                    <div className="policy-card-body">
                                        <div className="cattle-info">
                                            <span className="cattle-icon">
                                                {policy.cattleType === 'cow' ? '🐄' : '🐃'}
                                            </span>
                                            <div>
                                                <strong>{policy.tagId}</strong>
                                                <p>{policy.breed} • {policy.age} years</p>
                                            </div>
                                        </div>

                                        <div className="policy-details">
                                            <div className="detail-row">
                                                <span>Coverage:</span>
                                                <strong>{formatCurrency(policy.coverageAmount)}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Premium:</span>
                                                <strong>{formatCurrency(policy.premium)}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Period:</span>
                                                <span>{new Date(policy.startDate).toLocaleDateString()} to {new Date(policy.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="policy-card-footer">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => navigate(`/policy/${policy.id}`)}
                                        >
                                            View Details
                                        </button>

                                        {policy.status === 'APPROVED' && (
                                            <>
                                                {/* <button className="btn btn-sm btn-outline">
                                                    Download PDF
                                                </button> */}
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate('/claims/new', { state: { policy } })}
                                                >
                                                    File Claim
                                                </button>
                                            </>
                                        )}
                                        {policy.status === 'PENDING' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => navigate('/payment', { state: { policyId: policy.id } })}
                                            >
                                                Complete Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">📄</span>
                        <h3>No Policies Found</h3>
                        <p>
                            {filter === 'ALL'
                                ? "You haven't purchased any policies yet."
                                : `No ${filter.toLowerCase()} policies found.`
                            }
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate('/policies')}>
                            Get Protected Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPolicies;
