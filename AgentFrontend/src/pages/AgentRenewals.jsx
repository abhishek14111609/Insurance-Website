import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI, policyAPI } from '../services/api.service';
import { exportToCSV, formatPoliciesForExport } from '../utils/exportUtils';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import './AgentRenewals.css';

const AgentRenewals = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, expiring-soon, expired, renewed
    const [stats, setStats] = useState({
        total: 0,
        expiringSoon: 0,
        expired: 0,
        renewed: 0
    });

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }
        fetchRenewalData();
    }, [isAgent, navigate]);

    const fetchRenewalData = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getPolicies();
            if (response.success) {
                const allPolicies = response.data.policies || [];

                // Calculate renewal status for each policy
                const policiesWithRenewal = allPolicies.map(policy => {
                    const renewalStatus = calculateRenewalStatus(policy);
                    return { ...policy, renewalStatus };
                });

                setPolicies(policiesWithRenewal);
                calculateStats(policiesWithRenewal);
            }
        } catch (error) {
            console.error('Error fetching renewal data:', error);
            toast.error('Failed to load renewal data');
        } finally {
            setLoading(false);
        }
    };

    const calculateRenewalStatus = (policy) => {
        if (!policy.endDate) return { status: 'unknown', daysLeft: null };

        const endDate = new Date(policy.endDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (policy.status === 'RENEWED') {
            return { status: 'renewed', daysLeft: null };
        } else if (daysLeft < 0) {
            return { status: 'expired', daysLeft };
        } else if (daysLeft <= 30) {
            return { status: 'expiring-soon', daysLeft };
        } else {
            return { status: 'active', daysLeft };
        }
    };

    const calculateStats = (policiesData) => {
        const stats = {
            total: policiesData.length,
            expiringSoon: policiesData.filter(p => p.renewalStatus.status === 'expiring-soon').length,
            expired: policiesData.filter(p => p.renewalStatus.status === 'expired').length,
            renewed: policiesData.filter(p => p.renewalStatus.status === 'renewed').length
        };
        setStats(stats);
    };

    const handleRenewal = async (policyId) => {
        try {
            toast.loading('Processing renewal...');
            // This would call a renewal API endpoint
            // const response = await agentAPI.renewPolicy(policyId);

            // Simulated for now
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.dismiss();
            toast.success('Renewal initiated! Customer will be notified.');
            fetchRenewalData();
        } catch (error) {
            toast.dismiss();
            console.error('Renewal error:', error);
            toast.error('Failed to initiate renewal');
        }
    };

    const handleDownload = async (policy) => {
        try {
            toast.loading('Downloading document...');
            const blob = await policyAPI.downloadDocument(policy.id);

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
            toast.error(error.message || 'Failed to download document');
        }
    };

    const handleExport = () => {
        // ... (existing export logic)
        try {
            if (filteredPolicies.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatPoliciesForExport(filteredPolicies);
            exportToCSV(formattedData, 'renewal_policies');
            toast.success(`Exported ${filteredPolicies.length} policies successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const filteredPolicies = filter === 'all'
        ? policies
        : policies.filter(p => p.renewalStatus.status === filter);

    const getStatusBadge = (renewalStatus) => {
        // ... (existing badge logic)
        const badges = {
            'expiring-soon': { class: 'status-warning', text: `${renewalStatus.daysLeft} days left`, icon: '⚠️' },
            'expired': { class: 'status-expired', text: 'Expired', icon: '❌' },
            'renewed': { class: 'status-renewed', text: 'Renewed', icon: '✅' },
            'active': { class: 'status-active', text: `${renewalStatus.daysLeft} days left`, icon: '✓' },
            'unknown': { class: 'status-unknown', text: 'Unknown', icon: '?' }
        };
        return badges[renewalStatus.status] || badges.unknown;
    };

    // ... (existing loading check)
    if (loading) {
        return (
            <div className="agent-renewals">
                <div className="renewals-header">
                    <div>
                        <h1>Policy Renewals</h1>
                        <p>Track and manage policy renewals</p>
                    </div>
                </div>
                <div className="skeleton-stats-grid">
                    <SkeletonLoader type="stat" count={4} />
                </div>
                <SkeletonLoader type="policy-card" count={6} />
            </div>
        );
    }

    return (
        <div className="agent-renewals">
            <div className="renewals-header">
                <div>
                    <h1>Policy Renewals</h1>
                    <p>Track and manage policy renewals</p>
                </div>
                <button onClick={handleExport} className="btn btn-primary">
                    📥 Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="renewal-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3>Total Policies</h3>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>Expiring Soon</h3>
                        <p className="stat-value">{stats.expiringSoon}</p>
                        <small>Within 30 days</small>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <h3>Expired</h3>
                        <p className="stat-value">{stats.expired}</p>
                        <small>Need renewal</small>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Renewed</h3>
                        <p className="stat-value">{stats.renewed}</p>
                        <small>This period</small>
                    </div>
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
                    className={filter === 'expiring-soon' ? 'active warning' : ''}
                    onClick={() => setFilter('expiring-soon')}
                >
                    ⚠️ Expiring Soon ({stats.expiringSoon})
                </button>
                <button
                    className={filter === 'expired' ? 'active danger' : ''}
                    onClick={() => setFilter('expired')}
                >
                    ❌ Expired ({stats.expired})
                </button>
                <button
                    className={filter === 'renewed' ? 'active success' : ''}
                    onClick={() => setFilter('renewed')}
                >
                    ✅ Renewed ({stats.renewed})
                </button>
            </div>

            {/* Policies Grid */}
            {filteredPolicies.length > 0 ? (
                <div className="renewals-grid">
                    {filteredPolicies.map((policy) => {
                        const badge = getStatusBadge(policy.renewalStatus);
                        const canRenew = policy.renewalStatus.status === 'expiring-soon' ||
                            policy.renewalStatus.status === 'expired';

                        return (
                            <div key={policy.id} className={`renewal-card ${policy.renewalStatus.status}`}>
                                <div className="renewal-header">
                                    <div>
                                        <h3>{policy.policyNumber || 'Processing...'}</h3>
                                        <p className="customer-name">{policy.ownerName}</p>
                                    </div>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.icon} {badge.text}
                                    </span>
                                </div>

                                <div className="renewal-details">
                                    <div className="detail-row">
                                        <span>Coverage</span>
                                        <strong>₹{policy.coverageAmount?.toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Premium</span>
                                        <strong>₹{policy.premium?.toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Start Date</span>
                                        <strong>{new Date(policy.startDate).toLocaleDateString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>End Date</span>
                                        <strong>{new Date(policy.endDate).toLocaleDateString()}</strong>
                                    </div>
                                </div>

                                <div className="renewal-footer">
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => navigate(`/policy/${policy.id}`)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleDownload(policy)}
                                    >
                                        📄 PDF
                                    </button>
                                    {canRenew && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleRenewal(policy.id)}
                                        >
                                            🔄 Renew
                                        </button>
                                    )}
                                </div>

                                {policy.renewalStatus.status === 'expiring-soon' && (
                                    <div className="renewal-alert">
                                        <span className="alert-icon">⏰</span>
                                        <span>Action needed! Contact customer for renewal.</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <h3>No Policies Found</h3>
                    <p>
                        {filter === 'all'
                            ? "No policies available for renewal tracking."
                            : `No ${filter.replace('-', ' ')} policies found.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgentRenewals;
