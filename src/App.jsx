import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollToTop from './components/ScrollToTop';

import Shop from './components/Shop';
import Footer from './components/Footer';
import Marquee from './components/Marquee';
import Cursor from './components/Cursor';
import NoiseOverlay from './components/NoiseOverlay';
import ScrollProgress from './components/ScrollProgress';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LicenseAgreement from './components/LicenseAgreement';
import RefundPolicy from './components/RefundPolicy';
import Features from './components/Features';
import NotFound from './components/NotFound';
import Admin from './components/Admin';
import Prompts from './components/Prompts';
import SubmitPrompt from './components/SubmitPrompt';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';

import TransitionWipe from './components/Animations/TransitionWipe';

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/': 'RE-RENDER | Digital Agency & Assets',
      '/about': 'About | RE-RENDER',
      '/shop': 'Shop | RE-RENDER',
      '/services': 'Services | RE-RENDER',
      '/features': 'Features | RE-RENDER',
      '/prompts': 'Prompt Lab | RE-RENDER',
      '/submit-prompt': 'Submit Prompt | RE-RENDER',
      '/admin': 'Admin Panel | RE-RENDER',
      '/privacy': 'Privacy Policy | RE-RENDER',
      '/terms': 'Terms of Service | RE-RENDER',
      '/license': 'License Agreement | RE-RENDER',
      '/refund': 'Refund Policy | RE-RENDER',
    };

    document.title = titleMap[location.pathname] || 'RE-RENDER | Digital Agency & Assets';
  }, [location]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TransitionWipe><Home /></TransitionWipe>} />
        <Route path="/services" element={<TransitionWipe><Services /></TransitionWipe>} />
        <Route path="/shop" element={<TransitionWipe><ShopPage /></TransitionWipe>} />
        <Route path="/about" element={<TransitionWipe><AboutPage /></TransitionWipe>} />
        <Route path="/features" element={<TransitionWipe><Features /></TransitionWipe>} />
        <Route path="/prompts" element={<TransitionWipe><Prompts /></TransitionWipe>} />
        <Route path="/submit-prompt" element={<TransitionWipe><SubmitPrompt /></TransitionWipe>} />
        <Route path="/admin" element={<TransitionWipe><Admin /></TransitionWipe>} />
        <Route path="/privacy" element={<TransitionWipe><PrivacyPolicy /></TransitionWipe>} />
        <Route path="/terms" element={<TransitionWipe><TermsOfService /></TransitionWipe>} />
        <Route path="/license" element={<TransitionWipe><LicenseAgreement /></TransitionWipe>} />
        <Route path="/refund" element={<TransitionWipe><RefundPolicy /></TransitionWipe>} />
        <Route path="*" element={<TransitionWipe><NotFound /></TransitionWipe>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <TitleManager />
      <ScrollToTop />
      <div className="app">
        <NoiseOverlay />
        <Cursor />
        <ScrollProgress />
        <Navbar />

        <AnimatedRoutes />

        <Footer />
      </div>
    </Router>
  );
}

export default App;
