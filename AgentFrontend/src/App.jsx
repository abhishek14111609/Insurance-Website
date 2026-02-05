import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import RouteLoader from './components/RouteLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Components
import AgentLayout from './components/AgentLayout';
import { ProtectedAgentRoute, GuestRoute } from './components/ProtectedRoutes';

// Pages
import AgentDashboard from './pages/AgentDashboard';
import AgentPolicies from './pages/AgentPolicies';
import AgentCustomers from './pages/AgentCustomers';
import AgentReports from './pages/AgentReports';
import AgentCommissions from './pages/AgentCommissions';
import AgentWallet from './pages/AgentWallet';
import AgentTeam from './pages/AgentTeam';
import AgentProfile from './pages/AgentProfile';
import AgentNotifications from './pages/AgentNotifications';
import AgentAddPolicy from './pages/AgentAddPolicy';
import AgentPayment from './pages/AgentPayment';
import AgentLanding from './pages/AgentLanding';
import AgentLogin from './pages/AgentLogin';
import AgentRenewals from './pages/AgentRenewals';
import AgentAnalytics from './pages/AgentAnalytics';
import AgentPolicyDetails from './pages/AgentPolicyDetails';

import './App.css';

// Simple NotFound if not copied
const NotFoundPage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>404</h1>
    <p>Page Not Found</p>
  </div>
);

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app">
          <RouteLoader />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '16px',
              },
            }}
          />

          <main className="main-content">
            <Routes>
              {/* Public/Guest Routes */}
              <Route
                path="/login"
                element={
                  <GuestRoute allowedRoles={['agent']}>
                    <AgentLogin />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute allowedRoles={['agent']}>
                    <AgentLanding />
                  </GuestRoute>
                }
              />

              {/* Redirect /become-partner to /register for compatibility if needed, or just use register */}
              <Route path="/become-partner" element={<Navigate to="/register" replace />} />

              {/* Protected Agent Routes */}
              <Route
                path="/"
                element={
                  <ProtectedAgentRoute>
                    <AgentLayout />
                  </ProtectedAgentRoute>
                }
              >
                <Route index element={<AgentDashboard />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />

                <Route path="policies" element={<AgentPolicies />} />
                <Route path="renewals" element={<AgentRenewals />} />
                <Route path="analytics" element={<AgentAnalytics />} />
                <Route path="sell" element={<AgentAddPolicy />} />
                <Route path="payment" element={<AgentPayment />} />
                <Route path="customers" element={<AgentCustomers />} />
                <Route path="wallet" element={<AgentWallet />} />
                <Route path="team" element={<AgentTeam />} />
                <Route path="profile" element={<AgentProfile />} />
                <Route path="notifications" element={<AgentNotifications />} />
                <Route path="reports" element={<AgentReports />} />
                <Route path="commissions" element={<AgentCommissions />} />
                <Route path="policy/:id" element={<AgentPolicyDetails />} />
              </Route>

              {/* Redirect legacy /agent/* routes */}
              <Route path="/agent/policies" element={<Navigate to="/policies" replace />} />

              {/* Catch all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
