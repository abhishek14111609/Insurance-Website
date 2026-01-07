import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HealthInsurance from './pages/HealthInsurance';
import CarInsurance from './pages/CarInsurance';
import BikeInsurance from './pages/BikeInsurance';
import TravelInsurance from './pages/TravelInsurance';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Claims from './pages/Claims';
import FAQ from './pages/FAQ';
import ComparePlans from './pages/ComparePlans';
import Renewals from './pages/Renewals';
import Login from './pages/Login';

// Agent Pages
import AgentDashboard from './pages/Agent/AgentDashboard';
import AgentPolicies from './pages/Agent/AgentPolicies';
import AgentCustomers from './pages/Agent/AgentCustomers';
import AgentReports from './pages/Agent/AgentReports';
import AgentCommissions from './pages/Agent/AgentCommissions';
import AgentLayout from './components/Agent/AgentLayout';
import AgentLanding from './pages/Agent/AgentLanding';
import AgentLogin from './pages/Agent/AgentLogin';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MainLayout() {
  const location = useLocation();
  // We want the AgentLayout ONLY for the authenticated dashboard pages
  const isAgentDashboard = location.pathname.startsWith('/agent') && !location.pathname.startsWith('/agent/login') && !location.pathname.startsWith('/become-agent');

  if (isAgentDashboard) {
    return (
      <Routes>
        <Route path="/agent" element={<AgentLayout />}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="policies" element={<AgentPolicies />} />
          <Route path="customers" element={<AgentCustomers />} />
          <Route path="reports" element={<AgentReports />} />
          <Route path="commissions" element={<AgentCommissions />} />
        </Route>
      </Routes>
    );
  }

  // Check if we should hide the standard Navbar/Footer
  const isAgentLogin = location.pathname === '/agent/login';

  return (
    <div className="app">
      {!isAgentLogin && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health-insurance" element={<HealthInsurance />} />
          <Route path="/car-insurance" element={<CarInsurance />} />
          <Route path="/bike-insurance" element={<BikeInsurance />} />
          <Route path="/travel-insurance" element={<TravelInsurance />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/compare-plans" element={<ComparePlans />} />
          <Route path="/renewals" element={<Renewals />} />
          <Route path="/login" element={<Login />} />

          {/* Public Agent Routes */}
          <Route path="/become-agent" element={<AgentLanding />} />
          <Route path="/agent/login" element={<AgentLogin />} />
        </Routes>
      </main>
      {!isAgentLogin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout />
    </Router>
  );
}

export default App;
