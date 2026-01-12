import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { agentAPI } from '../../services/api.service';
import './AgentTeam.css';

const AgentTeam = () => {
    const navigate = useNavigate();
    const { user, isAgent } = useAuth();

    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchTeamMembers();
    }, [isAgent, navigate]);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getTeam();
            if (response.success) {
                setTeamMembers(response.data.team || []);
            }
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = filter === 'all'
        ? teamMembers
        : teamMembers.filter(m => m.level === parseInt(filter));

    const getStatusBadge = (status) => {
        const badges = {
            active: { class: 'status-active', text: 'Active' },
            inactive: { class: 'status-inactive', text: 'Inactive' },
            pending: { class: 'status-pending', text: 'Pending' }
        };
        return badges[status] || badges.pending;
    };

    if (loading) {
        return (
            <div className="agent-team">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading team...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-team">
            <div className="team-header">
                <div>
                    <h1>My Team</h1>
                    <p>Manage your agent network</p>
                </div>
                <div className="team-stats">
                    <div className="stat-item">
                        <span>Total Members</span>
                        <strong>{teamMembers.length}</strong>
                    </div>
                    <div className="stat-item">
                        <span>Direct</span>
                        <strong>{teamMembers.filter(m => m.level === 1).length}</strong>
                    </div>
                    <div className="stat-item">
                        <span>Indirect</span>
                        <strong>{teamMembers.filter(m => m.level > 1).length}</strong>
                    </div>
                </div>
            </div>

            {/* Referral Info */}
            <div className="referral-card">
                <h3>Your Referral Code</h3>
                <div className="referral-code-display">
                    <code>{user?.agentCode || 'Loading...'}</code>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                            navigator.clipboard.writeText(user?.agentCode || '');
                            alert('Referral code copied!');
                        }}
                    >
                        Copy
                    </button>
                </div>
                <p>Share this code with new agents to build your team</p>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({teamMembers.length})
                </button>
                <button
                    className={filter === '1' ? 'active' : ''}
                    onClick={() => setFilter('1')}
                >
                    Level 1 ({teamMembers.filter(m => m.level === 1).length})
                </button>
                <button
                    className={filter === '2' ? 'active' : ''}
                    onClick={() => setFilter('2')}
                >
                    Level 2 ({teamMembers.filter(m => m.level === 2).length})
                </button>
                <button
                    className={filter === '3' ? 'active' : ''}
                    onClick={() => setFilter('3')}
                >
                    Level 3 ({teamMembers.filter(m => m.level === 3).length})
                </button>
            </div>

            {/* Team Members List */}
            {filteredMembers.length > 0 ? (
                <div className="team-grid">
                    {filteredMembers.map((member) => {
                        const badge = getStatusBadge(member.status);
                        return (
                            <div key={member.id} className="team-member-card">
                                <div className="member-header">
                                    <div className="member-avatar">
                                        {member.user?.fullName?.charAt(0) || 'A'}
                                    </div>
                                    <div className="member-info">
                                        <h3>{member.user?.fullName}</h3>
                                        <p>Agent Code: {member.agentCode}</p>
                                    </div>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.text}
                                    </span>
                                </div>

                                <div className="member-details">
                                    <div className="detail-item">
                                        <span>Level</span>
                                        <strong>Level {member.level}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Policies Sold</span>
                                        <strong>{member.policiesSold || 0}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Total Earnings</span>
                                        <strong>₹{member.totalEarnings?.toLocaleString() || '0'}</strong>
                                    </div>
                                    <div className="detail-item">
                                        <span>Joined</span>
                                        <strong>{new Date(member.createdAt).toLocaleDateString()}</strong>
                                    </div>
                                </div>

                                <div className="member-contact">
                                    <p>📧 {member.user?.email}</p>
                                    <p>📱 {member.user?.phone}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <h3>No Team Members</h3>
                    <p>
                        {filter === 'all'
                            ? "You haven't recruited any agents yet. Share your referral code to build your team!"
                            : `No Level ${filter} team members found.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgentTeam;
