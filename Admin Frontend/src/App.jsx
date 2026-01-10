import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PolicyApprovals from './pages/PolicyApprovals';
import AgentApprovals from './pages/AgentApprovals';
import WithdrawalApprovals from './pages/WithdrawalApprovals';
import CommissionSettings from './pages/CommissionSettings';
import CommissionApprovals from './pages/CommissionApprovals';
import AgentManagement from './pages/AgentManagement';
import './App.css';

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

            <div className="nav-section">Approvals</div>

            <NavLink
              to="/policy-approvals"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">📋</span>
              Policy Approvals
            </NavLink>

            <NavLink
              to="/agent-approvals"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">👥</span>
              Agent Approvals
            </NavLink>

            <NavLink
              to="/withdrawal-approvals"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">💳</span>
              Withdrawal Approvals
            </NavLink>

            <NavLink
              to="/commissions"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">💰</span>
              Commission Approvals
            </NavLink>

            <div className="nav-section">Management</div>

            <NavLink
              to="/commission-settings"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">⚙️</span>
              Commission Settings
            </NavLink>

            <NavLink
              to="/agents"
              className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            >
              <span className="icon">👤</span>
              Agent Management
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/policy-approvals" element={<PolicyApprovals />} />
            <Route path="/agent-approvals" element={<AgentApprovals />} />
            <Route path="/withdrawal-approvals" element={<WithdrawalApprovals />} />
            <Route path="/commission-settings" element={<CommissionSettings />} />
            <Route path="/commissions" element={<CommissionApprovals />} />
            <Route path="/agents" element={<AgentManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
