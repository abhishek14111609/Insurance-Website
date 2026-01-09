import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import CommissionApprovals from './pages/CommissionApprovals';
import AgentManagement from './pages/AgentManagement';
import './App.css';

const AdminDashboard = () => {
  const stats = {
    totalAgents: JSON.parse(localStorage.getItem('agent_hierarchy') || '[]').length,
    pendingCommissions: JSON.parse(localStorage.getItem('commission_records') || '[]')
      .filter(c => c.status === 'pending').length,
    totalPolicies: JSON.parse(localStorage.getItem('my_animal_policies') || '[]').length,
    pendingAgents: JSON.parse(localStorage.getItem('agent_hierarchy') || '[]')
      .filter(a => a.status === 'pending').length
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of system activity and pending actions</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Agents</h3>
          <div className="value">{stats.totalAgents}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Commissions</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.pendingCommissions}</div>
        </div>
        <div className="stat-card">
          <h3>Total Policies</h3>
          <div className="value">{stats.totalPolicies}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Agents</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.pendingAgents}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <NavLink to="/commissions" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Approve Commissions</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{stats.pendingCommissions} pending</div>
            </div>
          </NavLink>
          <NavLink to="/agents" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Agents</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{stats.totalAgents} total agents</div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <h2>🛡️ SecureLife</h2>
          <div className="subtitle">Admin Panel</div>

          <nav className="admin-nav">
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
              end
            >
              <span className="icon">📊</span>
              Dashboard
            </NavLink>
            <NavLink
              to="/commissions"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">💰</span>
              Commission Approvals
            </NavLink>
            <NavLink
              to="/agents"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">👥</span>
              Agent Management
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/commissions" element={<CommissionApprovals />} />
            <Route path="/agents" element={<AgentManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
