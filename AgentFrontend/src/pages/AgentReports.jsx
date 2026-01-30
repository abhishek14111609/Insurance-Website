import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { agentAPI } from '../services/api.service';
import './AgentDashboard.css';

const AgentReports = () => {
    const navigate = useNavigate();
    const { isAgent } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAgent) {
            navigate('/');
            return;
        }

        fetchReports();
    }, [isAgent, navigate]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await agentAPI.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="agent-page-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>Sales Reports</h1>
                    <p>Performance analytics and monthly trends</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    Download PDF
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Earnings</div>
                        <div className="stat-value">₹{stats?.totalEarnings?.toLocaleString() || '0'}</div>
                        <div className="stat-change text-success">
                            {stats?.thisMonth?.commissions > 0 ? `+₹${stats.thisMonth.commissions} this month` : 'No earnings this month'}
                        </div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Policies Sold</div>
                        <div className="stat-value">{stats?.totalPolicies || 0}</div>
                        <div className="stat-change text-success">
                            {stats?.thisMonth?.policies > 0 ? `+${stats.thisMonth.policies} this month` : 'No sales this month'}
                        </div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Team Size</div>
                        <div className="stat-value">{stats?.teamSize || 0}</div>
                        <div className="stat-change text-success">Active Members</div>
                    </div>
                </div>
            </div>

            <div className="table-container fade-in" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <h3>Monthly Performance</h3>
                <div style={{
                    padding: '2rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    border: '1px dashed #ccc'
                }}>
                    <p>Detailed sales charts and analytics will appear here.</p>
                    <small>Currently collecting data...</small>
                </div>
            </div>
        </div>
    );
};

export default AgentReports;
