import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import CustomerProfile from './pages/CustomerProfile';
import NotFound from './pages/NotFound';

// Insurance Pages
import AnimalInsurance from './pages/AnimalInsurance';
import AnimalPolicyForm from './pages/AnimalPolicyForm';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PolicyDetails from './pages/PolicyDetails';

// Customer Dashboard Pages
import Dashboard from './pages/Dashboard';
import MyPolicies from './pages/MyPolicies';
import Claims from './pages/Claims';
import Renewals from './pages/Renewals';
import RenewalForm from './pages/RenewalForm';
import ClaimForm from './pages/ClaimForm';

// Agent Pages
import AgentDashboard from './pages/Agent/AgentDashboard';
import AgentPolicies from './pages/Agent/AgentPolicies';
import AgentCustomers from './pages/Agent/AgentCustomers';
import AgentReports from './pages/Agent/AgentReports';
import AgentCommissions from './pages/Agent/AgentCommissions';
import AgentWallet from './pages/Agent/AgentWallet';
import AgentTeam from './pages/Agent/AgentTeam';
import AgentProfile from './pages/Agent/AgentProfile';
import AgentLayout from './components/Agent/AgentLayout';
import AgentLanding from './pages/Agent/AgentLanding';
import AgentLogin from './pages/Agent/AgentLogin';

// Role-based protected routes
import {
  ProtectedRoute,
  ProtectedCustomerRoute,
  ProtectedAgentRoute,
  GuestRoute
} from './components/ProtectedRoutes';

import './App.css';

function App() {
  const location = useLocation();
  const isAgentRoute = location.pathname.startsWith('/agent');
  const isAgentPublicRoute = ['/become-agent', '/agent/login'].includes(location.pathname);

  // Don't show Navbar/Footer on agent dashboard routes
  const showNavFooter = !isAgentRoute && !isAgentPublicRoute;

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      {showNavFooter && <Navbar />}

      <main className="main-content">
        <Routes>
          {/* Public Routes - Accessible to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/become-partner" element={<AgentLanding />} />
          <Route path="/policies" element={<AnimalInsurance />} />
          {/* Backward compatibility */}
          <Route path="/animal-insurance" element={<AnimalInsurance />} />

          {/* Guest Routes - Only for unauthenticated users */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Agent Public Routes */}
          <Route path="/become-agent" element={<AgentLanding />} />
          <Route
            path="/agent/login"
            element={
              <GuestRoute allowedRoles={['agent']}>
                <AgentLogin />
              </GuestRoute>
            }
          />

          {/* ==================== CUSTOMER ROUTES ==================== */}
          {/* Only customers can access these routes */}

          <Route
            path="/profile"
            element={
              <ProtectedCustomerRoute>
                <CustomerProfile />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedCustomerRoute>
                <Dashboard />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/my-policies"
            element={
              <ProtectedCustomerRoute>
                <MyPolicies />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/claims"
            element={
              <ProtectedCustomerRoute>
                <Claims />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/renewals"
            element={
              <ProtectedCustomerRoute>
                <Renewals />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/renew"
            element={
              <ProtectedCustomerRoute>
                <RenewalForm />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/claims/new"
            element={
              <ProtectedCustomerRoute>
                <ClaimForm />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/animal-policy-form"
            element={
              <ProtectedCustomerRoute>
                <AnimalPolicyForm />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedCustomerRoute>
                <PaymentPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedCustomerRoute>
                <PaymentSuccess />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/payment-failure"
            element={
              <ProtectedCustomerRoute>
                <PaymentFailure />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/policy/:policyId"
            element={
              <ProtectedCustomerRoute>
                <PolicyDetails />
              </ProtectedCustomerRoute>
            }
          />

          {/* ==================== AGENT ROUTES ==================== */}
          {/* Only agents can access these routes */}

          <Route
            path="/agent"
            element={
              <ProtectedAgentRoute>
                <AgentLayout />
              </ProtectedAgentRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <ProtectedAgentRoute>
                  <AgentDashboard />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="policies"
              element={
                <ProtectedAgentRoute>
                  <AgentPolicies />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="customers"
              element={
                <ProtectedAgentRoute>
                  <AgentCustomers />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="wallet"
              element={
                <ProtectedAgentRoute>
                  <AgentWallet />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="team"
              element={
                <ProtectedAgentRoute>
                  <AgentTeam />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedAgentRoute>
                  <AgentProfile />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedAgentRoute>
                  <AgentReports />
                </ProtectedAgentRoute>
              }
            />
            <Route
              path="commissions"
              element={
                <ProtectedAgentRoute>
                  <AgentCommissions />
                </ProtectedAgentRoute>
              }
            />
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showNavFooter && <Footer />}
    </div>
  );
}

export default App;

