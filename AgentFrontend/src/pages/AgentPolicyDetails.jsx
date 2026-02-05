import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { policyAPI, BASE_URL } from '../services/api.service';
import { formatCurrency } from '../utils/numberUtils';
import toast from 'react-hot-toast';
import './AgentPolicyDetails.css';

const AgentPolicyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchPolicyDetails(id);
        }
    }, [id]);

    const fetchPolicyDetails = async (policyId) => {
        try {
            setLoading(true);
            // agentAPI doesn't have getById, but policyAPI does. 
            // Usually agents can view policies they own (or sold). 
            // If policyAPI.getById is restricted to "owner", we might need a specific agent endpoint.
            // But let's try policyAPI.getById first or use agentAPI.getPolicies and filter (inefficient but safe if endpoints missing).
            // Actually, looking at api.service.js, policyAPI.getById calls /policies/:id. 
            // If the backend allows agents to view their sold policies via this endpoint, it's fine.
            const response = await policyAPI.getById(policyId);
            if (response.success) {
                // Fix: Access response.data.policy, not just response.data
                setPolicy(response.data.policy);
            } else {
                toast.error('Could not fetch policy details');
                navigate('/policies');
            }
        } catch (error) {
            console.error('Error fetching policy details:', error);
            const msg = error.response?.data?.message || 'Failed to load policy';
            toast.error(msg);
            navigate('/policies');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!policy) return;
        try {
            toast.loading('Downloading document...');
            const blob = await policyAPI.downloadDocument(policy.id || policy._id); // Handle both id formats

            if (blob.type === 'application/json') {
                const text = await blob.text();
                const json = JSON.parse(text);
                throw new Error(json.message || 'Download failed');
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Policy-${policy.policyNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.dismiss();
            toast.success('Document downloaded successfully');
        } catch (error) {
            toast.dismiss();
            console.error("Download error:", error);
            const msg = error.message === 'Policy is not approved yet'
                ? 'Policy must be approved before downloading.'
                : (error.message || 'Failed to download document');
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className="loading-wrapper">
                <div className="spinner"></div>
                <p>Loading policy details...</p>
            </div>
        );
    }

    if (!policy) return null;

    return (
        <div className="agent-policy-details">
            <button className="btn-back" onClick={() => navigate(-1)}>
                ← Back to Policies
            </button>

            <div className="details-header">
                <div className="header-content">
                    <h1>Policy #{policy.policyNumber}</h1>
                    <div className="header-meta">
                        <span>Created: {new Date(policy.createdAt).toLocaleDateString()}</span>
                        <span className="meta-divider">•</span>
                        <span className={`status-text ${policy.status?.toLowerCase()}`}>
                            {policy.status?.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    {policy.status === 'APPROVED' && (
                        <button onClick={handleDownload} className="btn btn-primary">
                            📄 Download PDF
                        </button>
                    )}
                </div>
            </div>

            <div className="details-grid">
                {/* Customer Info Card */}
                <div className="details-card">
                    <div className="card-title">
                        <span className="card-icon">👤</span>
                        Customer Information
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Name</span>
                            <span className="info-value">{policy.ownerName || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Phone</span>
                            <span className="info-value">{policy.ownerPhone || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value">{policy.ownerEmail || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Address</span>
                            <span className="info-value">
                                {[policy.ownerAddress, policy.ownerCity, policy.ownerState]
                                    .filter(Boolean).join(', ') || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cattle Details Card */}
                <div className="details-card">
                    <div className="card-title">
                        <span className="card-icon">🐄</span>
                        Cattle Details
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Tag ID</span>
                            <span className="info-value">{policy.tagId || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Category</span>
                            <span className="info-value">{policy.cattleType || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Breed</span>
                            <span className="info-value">{policy.breed || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Age / Gender</span>
                            <span className="info-value">
                                {policy.age} Years / {policy.gender || 'Female'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Market Value</span>
                            <span className="info-value">{formatCurrency(policy.marketValue)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Milk Yield</span>
                            <span className="info-value">{policy.milkYield ? `${policy.milkYield} L/day` : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Policy Terms Card */}
                <div className="details-card">
                    <div className="card-title">
                        <span className="card-icon">🛡️</span>
                        Policy Terms
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Status</span>
                            <div>
                                <span className={`status-badge status-${policy.status?.toLowerCase()}`}>
                                    {policy.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Plan</span>
                            <span className="info-value">{policy.planId?.name || 'Standard Plan'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Sum Insured</span>
                            <span className="info-value">{formatCurrency(policy.coverageAmount)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Premium Paid</span>
                            <span className="info-value price-value">{formatCurrency(policy.premium)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Duration</span>
                            <span className="info-value">{policy.duration} Year(s)</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Validity</span>
                            <div className="info-value">
                                {policy.startDate ? (
                                    <>
                                        {new Date(policy.startDate).toLocaleDateString()}
                                        <br />
                                        to
                                        <br />
                                        {new Date(policy.endDate).toLocaleDateString()}
                                    </>
                                ) : 'Pending Activation'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Photos Section */}
                {policy.photos && Object.keys(policy.photos).length > 0 && (
                    <div className="details-card photos-section">
                        <div className="card-title">
                            <span className="card-icon">📷</span>
                            Cattle Photos
                        </div>
                        <div className="photos-grid">
                            {Object.entries(policy.photos).map(([key, url]) => {
                                if (!url) return null;
                                // Handle relative paths
                                const imgSrc = url.startsWith('http') || url.startsWith('data:') ? url : `${BASE_URL}/${url}`;

                                return (
                                    <div key={key} className="photo-card">
                                        <img src={imgSrc} alt={key} className="policy-photo"
                                            onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }} />
                                        <div className="photo-caption">{key.toUpperCase()} View</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentPolicyDetails;
