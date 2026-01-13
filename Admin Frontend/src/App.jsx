import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { isAdminLoggedIn, logoutAdmin } from './utils/authUtils';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import AdminLogin from './pages/Auth/AdminLogin';

// Dashboard
import Dashboard from './pages/Dashboard';

// Agents
import AllAgents from './pages/Agents/AllAgents';
import AddAgent from './pages/Agents/AddAgent';
import EditAgent from './pages/Agents/EditAgent';
import AgentDetails from './pages/Agents/AgentDetails';
import AgentApprovals from './pages/AgentApprovals';

// Policies
import AllPolicyPlans from './pages/Policies/AllPolicyPlans';
import AddPolicyPlan from './pages/Policies/AddPolicyPlan';
import EditPolicyPlan from './pages/Policies/EditPolicyPlan';
import PolicyApprovals from './pages/PolicyApprovals';

// Financial
import CommissionSettings from './pages/CommissionSettings';
import WithdrawalApprovals from './pages/WithdrawalApprovals';
import ClaimApprovals from './pages/ClaimApprovals';
import AllCustomers from './pages/AllCustomers';
import CommissionHistory from './pages/CommissionHistory';
import CustomerDetails from './pages/CustomerDetails';
import DatabaseSetup from './pages/DatabaseSetup';

import './App.css';

const AdminLayout = ({ children }) => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutAdmin();
      window.location.href = '/login';
    }
  };

  return (
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

          <div className="nav-section">Agent Management</div>

          <NavLink
            to="/agents"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">👥</span>
            All Agents
          </NavLink>

          <NavLink
            to="/agents/add"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">➕</span>
            Add Agent
          </NavLink>

          <NavLink
            to="/agent-approvals"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">✅</span>
            Agent Approvals
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">👤</span>
            All Customers
          </NavLink>

          <div className="nav-section">Policy Management</div>

          <NavLink
            to="/policy-plans"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">📋</span>
            Policy Plans
          </NavLink>

          <NavLink
            to="/policy-approvals"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">✅</span>
            Policy Approvals
          </NavLink>

          <NavLink
            to="/claim-approvals"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">🩺</span>
            Claim Approvals
          </NavLink>

          <div className="nav-section">Financial</div>

          <NavLink
            to="/commission-settings"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">⚙️</span>
            Commission Settings
          </NavLink>

          <NavLink
            to="/commission-history"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">📜</span>
            Commission History
          </NavLink>

          <NavLink
            to="/withdrawal-approvals"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">💳</span>
            Withdrawals
          </NavLink>

          <div className="nav-section">System</div>

          <NavLink
            to="/database-setup"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <span className="icon">🛠️</span>
            Database Setup
          </NavLink>

          <div className="nav-section">Account</div>

          <button
            onClick={handleLogout}
            className="admin-nav-item logout-btn"
          >
            <span className="icon">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAdminLoggedIn() ? <Navigate to="/" replace /> : <AdminLogin />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />

                  {/* Agents */}
                  <Route path="/agents" element={<AllAgents />} />
                  <Route path="/agents/add" element={<AddAgent />} />
                  <Route path="/agents/edit/:id" element={<EditAgent />} />
                  <Route path="/agents/details/:id" element={<AgentDetails />} />
                  <Route path="/agent-approvals" element={<AgentApprovals />} />
                  <Route path="/customers" element={<AllCustomers />} />
                  <Route path="/customers/:id" element={<CustomerDetails />} />

                  {/* Policies */}
                  <Route path="/policy-plans" element={<AllPolicyPlans />} />
                  <Route path="/policy-plans/add" element={<AddPolicyPlan />} />
                  <Route path="/policy-plans/edit/:id" element={<EditPolicyPlan />} />
                  <Route path="/policy-approvals" element={<PolicyApprovals />} />

                  {/* Financial */}
                  <Route path="/commission-settings" element={<CommissionSettings />} />
                  <Route path="/commission-history" element={<CommissionHistory />} />
                  <Route path="/withdrawal-approvals" element={<WithdrawalApprovals />} />
                  <Route path="/claim-approvals" element={<ClaimApprovals />} />
                  <Route path="/database-setup" element={<DatabaseSetup />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
