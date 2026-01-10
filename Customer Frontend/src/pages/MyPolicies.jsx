import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCustomerPolicies } from '../utils/authUtils';
import './MyPolicies.css';

const MyPolicies = () => {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const customerPolicies = getCustomerPolicies();
        setPolicies(customerPolicies);
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'status-pending', icon: '🟡', text: 'Pending Approval' },
            APPROVED: { class: 'status-approved', icon: '🟢', text: 'Active' },
            REJECTED: { class: 'status-rejected', icon: '🔴', text: 'Rejected' },
            EXPIRED: { class: 'status-expired', icon: '⚪', text: 'Expired' }
        };
        return badges[status] || badges.PENDING;
    };

    const filteredPolicies = filter === 'ALL'
        ? policies
        : policies.filter(p => p.status === filter);

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
                        Pending ({policies.filter(p => p.status === 'PENDING').length})
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
                                        <span className="policy-number">{policy.policyNumber}</span>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon} {badge.text}
                                        </span>
                                    </div>

                                    <div className="policy-card-body">
                                        <div className="cattle-info">
                                            <span className="cattle-icon">
                                                {policy.petType === 'cow' ? '🐄' : '🐃'}
                                            </span>
                                            <div>
                                                <strong>{policy.tagId || policy.petName}</strong>
                                                <p>{policy.petBreed} • {policy.petAge} years</p>
                                            </div>
                                        </div>

                                        <div className="policy-details">
                                            <div className="detail-row">
                                                <span>Coverage:</span>
                                                <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Premium:</span>
                                                <strong>₹{policy.premium?.toLocaleString()}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Period:</span>
                                                <span>{policy.startDate} to {policy.endDate}</span>
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
                                                <button className="btn btn-sm btn-outline">
                                                    Download PDF
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate('/claims/new', { state: { policy } })}
                                                >
                                                    File Claim
                                                </button>
                                            </>
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
