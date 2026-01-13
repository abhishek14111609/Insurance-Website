import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import './AgentPolicies.css';

const AgentPolicies = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchPolicies();
    }, [isAgent, navigate]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getPolicies();
            if (response.success) {
                setPolicies(response.data.policies || []);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPolicies = filter === 'all'
        ? policies
        : policies.filter(p => p.status === filter);

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'status-pending', text: 'Pending' },
            PENDING_APPROVAL: { class: 'status-pending', text: 'Pending Approval' },
            APPROVED: { class: 'status-approved', text: 'Active' },
            REJECTED: { class: 'status-rejected', text: 'Rejected' },
            EXPIRED: { class: 'status-expired', text: 'Expired' }
        };
        return badges[status] || badges.PENDING;
    };

    if (loading) {
        return (
            <div className="agent-policies">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading policies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-policies">
            <div className="policies-header">
                <h1>My Policies</h1>
                <p>Policies sold by you</p>
            </div>

            {/* Stats */}
            <div className="policies-stats">
                <div className="stat-item">
                    <span>Total Policies</span>
                    <strong>{policies.length}</strong>
                </div>
                <div className="stat-item">
                    <span>Active</span>
                    <strong>{policies.filter(p => p.status === 'APPROVED').length}</strong>
                </div>
                <div className="stat-item">
                    <span>Pending</span>
                    <strong>{policies.filter(p => p.status === 'PENDING_APPROVAL').length}</strong>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({policies.length})
                </button>
                <button
                    className={filter === 'PENDING_APPROVAL' ? 'active' : ''}
                    onClick={() => setFilter('PENDING_APPROVAL')}
                >
                    Pending ({policies.filter(p => p.status === 'PENDING_APPROVAL').length})
                </button>
                <button
                    className={filter === 'APPROVED' ? 'active' : ''}
                    onClick={() => setFilter('APPROVED')}
                >
                    Active ({policies.filter(p => p.status === 'APPROVED').length})
                </button>
            </div>

            {/* Policies Grid */}
            {filteredPolicies.length > 0 ? (
                <div className="policies-grid">
                    {filteredPolicies.map((policy) => {
                        const badge = getStatusBadge(policy.status);
                        return (
                            <div key={policy.id} className="policy-card">
                                <div className="policy-header">
                                    <div>
                                        <h3>{policy.policyNumber || 'Processing...'}</h3>
                                        <p>{policy.cattleType === 'cow' ? '🐄' : '🐃'} {policy.tagId}</p>
                                    </div>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.text}
                                    </span>
                                </div>

                                <div className="policy-details">
                                    <div className="detail-row">
                                        <span>Customer</span>
                                        <strong>{policy.ownerName}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Coverage</span>
                                        <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Premium</span>
                                        <strong>₹{policy.premium?.toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Duration</span>
                                        <strong>{policy.duration}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Created</span>
                                        <strong>{new Date(policy.createdAt).toLocaleDateString()}</strong>
                                    </div>
                                </div>

                                <div className="policy-footer">
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => navigate(`/policy/${policy.id}`)}
                                    >
                                        View Details
                                    </button>
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
                        {filter === 'all'
                            ? "You haven't sold any policies yet."
                            : `No ${filter.toLowerCase().replace('_', ' ')} policies found.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgentPolicies;
