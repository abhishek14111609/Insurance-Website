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
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar />
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
