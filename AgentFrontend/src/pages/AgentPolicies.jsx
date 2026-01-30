import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI, policyAPI } from '../services/api.service';
import { exportToCSV, formatPoliciesForExport } from '../utils/exportUtils';
import toast from 'react-hot-toast';
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

    const handleDownload = async (policy) => {
        try {
            // Loading toast could be added here
            const blob = await policyAPI.downloadDocument(policy.id);

            // Check if response is actually JSON error (edge case where blob is returned but contains error json)
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

            toast.success('Document downloaded successfully');
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || 'Failed to download document');
        }
    };

    const handleExport = () => {
        try {
            if (filteredPolicies.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatPoliciesForExport(filteredPolicies);
            exportToCSV(formattedData, 'my_policies');
            toast.success(`Exported ${filteredPolicies.length} policies successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
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
                <div>
                    <h1>My Policies</h1>
                    <p>Policies sold by you</p>
                </div>
                <button onClick={handleExport} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                    📥 Export CSV
                </button>
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
                                    {policy.status === 'APPROVED' && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(policy);
                                            }}
                                        >
                                            📄 Download PDF
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
