import './AgentDashboard.css';

const AgentReports = () => {
    return (
        <div className="agent-page-container">
            <div className="page-header">
                <div>
                    <h1>Sales Reports</h1>
                    <p>Performance analytics and monthly trends</p>
                </div>
                <button className="btn btn-primary">Download PDF</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Total Sales (YTD)</div>
                        <div className="stat-value">₹12,45,000</div>
                        <div className="stat-change text-success">↑ 15% vs last year</div>
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#fff' }}>
                    <div className="stat-content">
                        <div className="stat-title">Policies Sold</div>
                        <div className="stat-value">142</div>
                        <div className="stat-change text-success">↑ 8% vs last year</div>
                    </div>
                </div>
            </div>

            <div className="table-container fade-in" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <h3>Performance Chart Placeholder</h3>
                <div style={{
                    height: '300px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1rem'
                }}>
                    [ Detailed Analytics Graph ]
                </div>
            </div>
        </div>
    );
};

export default AgentReports;
