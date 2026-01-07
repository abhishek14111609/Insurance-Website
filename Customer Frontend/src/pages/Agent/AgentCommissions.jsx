import './AgentDashboard.css';

const AgentCommissions = () => {
    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>My Earnings</h1>
                    <p>Track your commissions and payouts</p>
                </div>
                <button className="btn btn-primary">Request Payout</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Available Balance</div>
                        <div className="stat-value text-success">₹24,500</div>
                        <div className="stat-change">Ready to withdraw</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Pending Clearance</div>
                        <div className="stat-value">₹8,100</div>
                        <div className="stat-change">Est. 3 days</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Lifetime Earnings</div>
                        <div className="stat-value">₹8,42,000</div>
                    </div>
                </div>
            </div>

            <div className="table-container fade-in">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Policy Type</th>
                            <th>Policy No</th>
                            <th>Premium</th>
                            <th>Commission (15%)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2024-03-15</td>
                            <td>Car Insurance</td>
                            <td>POL-8821</td>
                            <td>₹12,000</td>
                            <td className="font-medium text-success">+ ₹1,800</td>
                            <td><span className="status-badge active">Paid</span></td>
                        </tr>
                        <tr>
                            <td>2024-03-12</td>
                            <td>Health Insurance</td>
                            <td>POL-9932</td>
                            <td>₹15,000</td>
                            <td className="font-medium text-success">+ ₹2,250</td>
                            <td><span className="status-badge pending">Pending</span></td>
                        </tr>
                        <tr>
                            <td>2024-03-10</td>
                            <td>Travel Insurance</td>
                            <td>POL-1122</td>
                            <td>₹2,000</td>
                            <td className="font-medium text-success">+ ₹300</td>
                            <td><span className="status-badge active">Paid</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentCommissions;
