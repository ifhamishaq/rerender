import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollToTop from './components/ScrollToTop';

import Shop from './components/Shop';
import CTA from './components/CTA';
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
      <ScrollToTop />
      <div className="app">
        <NoiseOverlay />
        <Cursor />
        <ScrollProgress />
        <Navbar />

        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Marquee />
              <main>
                <Shop />
                <CTA />
              </main>
            </>
          } />
          <Route path="/features" element={<Features />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/license" element={<LicenseAgreement />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
