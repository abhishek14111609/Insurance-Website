import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteLoader from './components/RouteLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentRegister from './pages/AgentRegister';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import VerifyEmail from './pages/VerifyEmail';
import CustomerProfile from './pages/CustomerProfile';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Insurance Pages
import AnimalInsurance from './pages/AnimalInsurance';
import AnimalPolicyForm from './pages/AnimalPolicyForm';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PolicyDetails from './pages/PolicyDetails';
import TermsAndConditions from './pages/TermsAndConditions';

// Customer Dashboard Pages
import Dashboard from './pages/Dashboard';
import MyPolicies from './pages/MyPolicies';
import Claims from './pages/Claims';
import Renewals from './pages/Renewals';
import RenewalForm from './pages/RenewalForm';
import ClaimForm from './pages/ClaimForm';

// Agent Pages
// Agent Pages removed

// Role-based protected routes
import {
  ProtectedRoute,
  ProtectedCustomerRoute,
  GuestRoute
} from './components/ProtectedRoutes';

import './App.css';

function App() {
  const location = useLocation();
  /* Agent routes removed */

  // Show Navbar/Footer always for customer app (except special pages if needed)
  const showNavFooter = true;

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
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
              fontSize: '24px',
            },
          }}
        />
        {showNavFooter && <Navbar />}

        <main className="main-content">
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/become-partner" element={<AgentRegister />} />
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
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* Agent Public Routes */}
            {/* Agent Public Routes Removed */}

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
              path="/notifications"
              element={
                <ProtectedCustomerRoute>
                  <Notifications />
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

            {/* ==================== AGENT ROUTES REMOVED ==================== */}

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {showNavFooter && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default App;

