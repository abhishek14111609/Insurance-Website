import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/numberUtils';
import './Claims.css';

const Claims = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
            return;
        }
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await claimAPI.getAll();
            if (response.success) {
                setClaims(response.data.claims || []);
            }
        } catch (err) {
            console.error('Error fetching claims:', err);
            setError('Failed to load claims. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'status-pending', icon: '🟡', text: 'Pending' },
            under_review: { class: 'status-review', icon: '🔍', text: 'Under Review' },
            approved: { class: 'status-approved', icon: '✅', text: 'Approved' },
            rejected: { class: 'status-rejected', icon: '❌', text: 'Rejected' },
            paid: { class: 'status-settled', icon: '💰', text: 'Paid' }
        };
        return badges[status] || badges.pending;
    };

    const filteredClaims = filter === 'all'
        ? claims
        : claims.filter(c => c.status === filter);

    if (loading) {
        return (
            <div className="claims-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your claims...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="claims-page">
                <div className="container">
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchClaims}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="claims-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Claims</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/claims/new')}
                    >
                        + File New Claim
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({claims.length})
                    </button>
                    <button
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({claims.filter(c => c.status === 'pending').length})
                    </button>
                    <button
                        className={filter === 'under_review' ? 'active' : ''}
                        onClick={() => setFilter('under_review')}
                    >
                        Under Review ({claims.filter(c => c.status === 'under_review').length})
                    </button>
                    <button
                        className={filter === 'approved' ? 'active' : ''}
                        onClick={() => setFilter('approved')}
                    >
                        Approved ({claims.filter(c => c.status === 'approved').length})
                    </button>
                    <button
                        className={filter === 'paid' ? 'active' : ''}
                        onClick={() => setFilter('paid')}
                    >
                        Paid ({claims.filter(c => c.status === 'paid').length})
                    </button>
                </div>

                {filteredClaims.length > 0 ? (
                    <div className="claims-list">
                        {filteredClaims.map((claim) => {
                            const badge = getStatusBadge(claim.status);
                            return (
                                <div key={claim.id} className="claim-card">
                                    <div className="claim-header">
                                        <div>
                                            <h3>Claim #{claim.claimNumber}</h3>
                                            <p>Policy: {claim.policy?.policyNumber || 'N/A'}</p>
                                        </div>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon} {badge.text}
                                        </span>
                                    </div>

                                    <div className="claim-body">
                                        <div className="claim-detail">
                                            <span>Claim Type:</span>
                                            <strong>{claim.claimType}</strong>
                                        </div>
                                        <div className="claim-detail">
                                            <span>Incident Date:</span>
                                            <span>{new Date(claim.incidentDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="claim-detail">
                                            <span>Claimed Amount:</span>
                                            <strong>{formatCurrency(claim.claimAmount)}</strong>
                                        </div>
                                        {claim.approvedAmount && (
                                            <div className="claim-detail">
                                                <span>Approved Amount:</span>
                                                <strong className="text-success">{formatCurrency(claim.approvedAmount)}</strong>
                                            </div>
                                        )}
                                        <div className="claim-detail">
                                            <span>Filed On:</span>
                                            <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => navigate(`/claims/${claim.id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">🏥</span>
                        <h3>No Claims Found</h3>
                        <p>
                            {filter === 'all'
                                ? "You have no active or past claims."
                                : `No ${filter.replace('_', ' ')} claims found.`
                            }
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/claims/new')}
                        >
                            File Your First Claim
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Claims;
