import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.service';
import './CommissionHistory.css';

const CommissionHistory = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pending: 0,
        paid: 0
    });

    useEffect(() => {
        loadCommissions();
    }, []);

    const loadCommissions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllCommissions();
            if (response.success) {
                const data = response.data.commissions || [];
                setCommissions(data);

                // Calculate totals
                const total = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                const pending = data.filter(item => item.status === 'pending').reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                const paid = data.filter(item => item.status === 'paid').reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

                setStats({
                    totalEarned: total,
                    pending: pending,
                    paid: paid
                });
            }
        } catch (error) {
            console.error('Error loading commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading commission history...</div>;

    return (
        <div className="commissions-history-page">
            <div className="page-header">
                <div>
                    <h1>💰 Commission History</h1>
                    <p>Track all earnings and distribution across the agent network</p>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <span className="card-label">Total Commissions</span>
                    <span className="card-value">₹{stats.totalEarned.toLocaleString()}</span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Pending Payouts</span>
                    <span className="card-value warning">₹{stats.pending.toLocaleString()}</span>
                </div>
                <div className="summary-card">
                    <span className="card-label">Successfully Paid</span>
                    <span className="card-value success">₹{stats.paid.toLocaleString()}</span>
                </div>
            </div>

            <div className="table-container">
                <table className="commissions-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Agent</th>
                            <th>Policy / Customer</th>
                            <th>Amount</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.length > 0 ? (
                            commissions.map(item => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>
                                        <div className="agent-col">
                                            <span className="agent-name">{item.agent?.user?.fullName || 'N/A'}</span>
                                            <span className="agent-code">{item.agent?.agentCode}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="policy-col">
                                            <span className="policy-id">Policy #{item.policyId}</span>
                                            <span className="customer-name">{item.policy?.ownerName || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="amount">₹{item.amount}</span>
                                    </td>
                                    <td>
                                        <span className={`level-badge L${item.level}`}>
                                            Level {item.level}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${item.status}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No commission records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionHistory;
