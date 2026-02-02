import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI } from '../services/api.service';
import { exportToCSV, formatTeamMembersForExport } from '../utils/exportUtils';
import toast from 'react-hot-toast';
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

    const handleUpdateTraining = async (memberId, trainingData) => {
        try {
            const response = await agentAPI.updateSubAgentTraining(memberId, trainingData);
            if (response.success) {
                fetchTeamMembers(); // Refresh to see changes
            }
        } catch (error) {
            console.error('Error updating training:', error);
        }
    };

    const handleExport = () => {
        try {
            if (filteredMembers.length === 0) {
                toast.error('No data to export');
                return;
            }
            const formattedData = formatTeamMembersForExport(filteredMembers);
            exportToCSV(formattedData, 'my_team');
            toast.success(`Exported ${filteredMembers.length} team members successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const filteredMembers = filter === 'all'
        ? teamMembers
        : teamMembers.filter(m => m.relativeLevel === parseInt(filter));

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={handleExport} className="btn btn-primary">
                        📥 Export CSV
                    </button>
                    <div className="team-stats">
                        <div className="stat-item">
                            <span>Total Members</span>
                            <strong>{teamMembers.length}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Direct</span>
                            <strong>{teamMembers.filter(m => m.relativeLevel === 1).length}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Indirect</span>
                            <strong>{teamMembers.filter(m => m.relativeLevel > 1).length}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral Info */}
            <div className="referral-card">
                <h3 style={{ color: 'white' }}>Your Referral Code</h3>
                <div className="referral-code-display">
                    <code>{user?.agentCode || 'Loading...'}</code>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                            navigator.clipboard.writeText(user?.agentCode || '');
                            toast.success('Referral code copied!');
                        }}
                    >
                        Copy
                    </button>
                </div>
                <p style={{ "color": 'white' }}>Share this code with new agents to build your team</p>

                <div className="referral-link-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '0.5rem' }}>OR Share Referral Link</h4>
                    <div className="referral-code-display">
                        <input
                            type="text"
                            readOnly
                            value={`https://agent.pashudhansuraksha.com/register?ref=${user?.agentCode || ''}`}
                            style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.9rem',
                                color: 'white',
                                textOverflow: 'ellipsis'
                            }}
                        />
                        <button style={{ color: 'white' }}
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                                const link = `https://agent.pashudhansuraksha.com/register?ref=${user?.agentCode || ''}`;
                                navigator.clipboard.writeText(link);
                                toast.success('Referral link copied!');
                            }}
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
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
                    Level 1 ({teamMembers.filter(m => m.relativeLevel === 1).length})
                </button>
                <button
                    className={filter === '2' ? 'active' : ''}
                    onClick={() => setFilter('2')}
                >
                    Level 2 ({teamMembers.filter(m => m.relativeLevel === 2).length})
                </button>
                <button
                    className={filter === '3' ? 'active' : ''}
                    onClick={() => setFilter('3')}
                >
                    Level 3 ({teamMembers.filter(m => m.relativeLevel === 3).length})
                </button>
                <button
                    className={filter === '4' ? 'active' : ''}
                    onClick={() => setFilter('4')}
                >
                    Level 4 ({teamMembers.filter(m => m.relativeLevel === 4).length})
                </button>
                <button
                    className={filter === '5' ? 'active' : ''}
                    onClick={() => setFilter('5')}
                >
                    Level 5 ({teamMembers.filter(m => m.relativeLevel === 5).length})
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
                                        <strong>Level {member.relativeLevel}</strong>
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

                                {/* Training Section - Only for Direct Downline (Level 1) */}
                                {member.relativeLevel === 1 && (
                                    <div className="training-section">
                                        <div className="section-label">Training Progress</div>
                                        <div className="progress-container">
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${member.trainingProgress || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text">{member.trainingProgress || 0}%</span>
                                        </div>
                                        <div className="training-controls">
                                            <select
                                                value={member.trainingStatus || 'not_started'}
                                                onChange={(e) => handleUpdateTraining(member.id, { status: e.target.value })}
                                                className="training-select"
                                            >
                                                <option value="not_started">Not Started</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={member.trainingProgress || 0}
                                                onChange={(e) => handleUpdateTraining(member.id, { progress: parseInt(e.target.value) })}
                                                className="training-range"
                                            />
                                        </div>
                                    </div>
                                )}
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
