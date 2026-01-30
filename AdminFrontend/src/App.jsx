import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteLoader from './components/RouteLoader';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

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
import CommissionApprovals from './pages/CommissionApprovals';
import CustomerDetails from './pages/CustomerDetails';
import Inquiries from './pages/Inquiries';
import DatabaseSetup from './pages/DatabaseSetup';
import PolicyHistory from './pages/PolicyHistory';
import TransactionHistory from './pages/TransactionHistory';
import ClaimHistory from './pages/ClaimHistory';
import AuditLogs from './pages/AuditLogs';

import './App.css';

import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCircle,
  Mail,
  ClipboardList,
  CheckSquare,
  History,
  Stethoscope,
  HeartPulse,
  Settings2,
  ScrollText,
  CircleDollarSign,
  Wallet,
  ArrowLeftRight,
  LogOut,
  ShieldCheck,
  Shield,
  ChevronRight,
  Database,
  Search
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span className={`hamburger ${isSidebarOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <div className="mobile-brand">
          <ShieldCheck size={24} color="var(--primary)" />
          <span>Admin Panel</span>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <ShieldCheck size={32} />
          </div>
          <div className="brand-text">
            <h2>Pashudhan</h2>
            <span>Suraksha Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={closeSidebar}
            end
          >
            <LayoutDashboard size={20} className="icon" />
            <span>Dashboard</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <div className="nav-section">Agent & Users</div>

          <NavLink to="/agents" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Users size={20} className="icon" />
            <span>All Agents</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/agent-approvals" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <UserCheck size={20} className="icon" />
            <span>Agent Approvals</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/customers" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <UserCircle size={20} className="icon" />
            <span>All Customers</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/inquiries" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Mail size={20} className="icon" />
            <span>Inquiries</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <div className="nav-section">Policy & Claims</div>

          <NavLink to="/policy-plans" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <ClipboardList size={20} className="icon" />
            <span>Policy Plans</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/policy-approvals" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <CheckSquare size={20} className="icon" />
            <span>Policy Approvals</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/policy-history" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <History size={20} className="icon" />
            <span>Policy History</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/claim-approvals" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Stethoscope size={20} className="icon" />
            <span>Claim Approvals</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/claim-history" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <HeartPulse size={20} className="icon" />
            <span>Claim History</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <div className="nav-section">Financials</div>

          <NavLink to="/commission-settings" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Settings2 size={20} className="icon" />
            <span>Commission Matrix</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/commission-approvals" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <CircleDollarSign size={20} className="icon" />
            <span>Commissions</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/withdrawal-approvals" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Wallet size={20} className="icon" />
            <span>Withdrawals</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/transactions" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <ArrowLeftRight size={20} className="icon" />
            <span>Transactions</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <div className="nav-section">System</div>

          <NavLink to="/audit-logs" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Shield size={20} className="icon" />
            <span>Audit Logs</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <NavLink to="/database-setup" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'} onClick={closeSidebar}>
            <Database size={20} className="icon" />
            <span>Database Setup</span>
            <ChevronRight size={14} className="arrow" />
          </NavLink>

          <button onClick={handleLogout} className="admin-nav-item logout-nav-btn">
            <LogOut size={20} className="icon" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className="header-actions">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.fullName || 'Super Admin'}</span>
                <span className="user-role">Administrator</span>
              </div>
              <div className="user-avatar">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <RouteLoader />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              fontSize: '14px'
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated && isAdmin ? <Navigate to="/" replace /> : <AdminLogin />}
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
                    <Route path="/policy-history" element={<PolicyHistory />} />

                    {/* Financial */}
                    <Route path="/commission-settings" element={<CommissionSettings />} />
                    <Route path="/commission-history" element={<CommissionHistory />} />
                    <Route path="/commission-approvals" element={<CommissionApprovals />} />
                    <Route path="/withdrawal-approvals" element={<WithdrawalApprovals />} />
                    <Route path="/transactions" element={<TransactionHistory />} />
                    <Route path="/claim-approvals" element={<ClaimApprovals />} />
                    <Route path="/claim-history" element={<ClaimHistory />} />
                    <Route path="/inquiries" element={<Inquiries />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/database-setup" element={<DatabaseSetup />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 