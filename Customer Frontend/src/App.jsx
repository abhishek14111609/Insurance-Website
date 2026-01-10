import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CustomerProfile from './pages/CustomerProfile';

// Insurance Pages
// import HealthInsurance from './pages/HealthInsurance';
// import CarInsurance from './pages/CarInsurance';
// import BikeInsurance from './pages/BikeInsurance';
// import TravelInsurance from './pages/TravelInsurance';
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

import './App.css';
import { isCustomerLoggedIn } from './utils/authUtils';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!isCustomerLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/become-partner" element={<AgentLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Product Routes - Only Cattle Enabled */}
          {/* <Route path="/health-insurance" element={<HealthInsurance />} /> */}
          {/* <Route path="/car-insurance" element={<CarInsurance />} /> */}
          {/* <Route path="/bike-insurance" element={<BikeInsurance />} /> */}
          {/* <Route path="/travel-insurance" element={<TravelInsurance />} /> */}

          {/* Cattle Insurance - Main route */}
          <Route path="/policies" element={<AnimalInsurance />} />
          {/* Backward compatibility */}
          <Route path="/animal-insurance" element={<AnimalInsurance />} />

          {/* Protected Customer Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-policies"
            element={
              <ProtectedRoute>
                <MyPolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims"
            element={
              <ProtectedRoute>
                <Claims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/renewals"
            element={
              <ProtectedRoute>
                <Renewals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/renew"
            element={
              <ProtectedRoute>
                <RenewalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims/new"
            element={
              <ProtectedRoute>
                <ClaimForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/animal-policy-form"
            element={
              <ProtectedRoute>
                <AnimalPolicyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-failure"
            element={
              <ProtectedRoute>
                <PaymentFailure />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policy/:policyId"
            element={
              <ProtectedRoute>
                <PolicyDetails />
              </ProtectedRoute>
            }
          />

          {/* Agent Public Routes */}
          <Route path="/become-agent" element={<AgentLanding />} />
          <Route path="/agent/login" element={<AgentLogin />} />

          {/* Agent Dashboard Routes (Protected) */}
          <Route path="/agent" element={<AgentLayout />}>
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="policies" element={<AgentPolicies />} />
            <Route path="customers" element={<AgentCustomers />} />
            <Route path="wallet" element={<AgentWallet />} />
            <Route path="team" element={<AgentTeam />} />
            <Route path="profile" element={<AgentProfile />} />
            <Route path="reports" element={<AgentReports />} />
            <Route path="commissions" element={<AgentCommissions />} />
          </Route>
        </Routes>
      </main>

      {showNavFooter && <Footer />}
    </div>
  );
}

export default App;
