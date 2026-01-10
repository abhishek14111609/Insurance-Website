import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Claims.css';

const Claims = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);

    useEffect(() => {
        const savedClaims = JSON.parse(localStorage.getItem('customer_claims') || '[]');
        setClaims(savedClaims);
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            SUBMITTED: { class: 'status-submitted', text: 'Submitted' },
            UNDER_REVIEW: { class: 'status-review', text: 'Under Review' },
            APPROVED: { class: 'status-approved', text: 'Approved' },
            REJECTED: { class: 'status-rejected', text: 'Rejected' },
            SETTLED: { class: 'status-settled', text: 'Settled' }
        };
        return badges[status] || badges.SUBMITTED;
    };

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

                {claims.length > 0 ? (
                    <div className="claims-list">
                        {claims.map((claim) => {
                            const badge = getStatusBadge(claim.status);
                            return (
                                <div key={claim.id} className="claim-card">
                                    <div className="claim-header">
                                        <div>
                                            <h3>Claim #{claim.claimNumber}</h3>
                                            <p>Policy: {claim.policyNumber}</p>
                                        </div>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.text}
                                        </span>
                                    </div>

                                    <div className="claim-body">
                                        <div className="claim-detail">
                                            <span>Claim Type:</span>
                                            <strong>{claim.claimType}</strong>
                                        </div>
                                        <div className="claim-detail">
                                            <span>Incident Date:</span>
                                            <span>{claim.incidentDate}</span>
                                        </div>
                                        <div className="claim-detail">
                                            <span>Claimed Amount:</span>
                                            <strong>₹{claim.claimedAmount?.toLocaleString()}</strong>
                                        </div>
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
                        <p>You have no active or past claims.</p>
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
