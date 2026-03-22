import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Services = React.lazy(() => import('./pages/Services'));
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const ArcadePage = React.lazy(() => import('./pages/ArcadePage'));
const TypeRacerPage = React.lazy(() => import('./pages/TypeRacerPage'));
const HexCodeHeroPage = React.lazy(() => import('./pages/HexCodeHeroPage'));
const PalettePickerPage = React.lazy(() => import('./pages/PalettePickerPage'));
const ReflexGamePage = React.lazy(() => import('./pages/ReflexGamePage'));
const WallpaperLab = React.lazy(() => import('./pages/WallpaperLab'));
const ToolsPage = React.lazy(() => import('./pages/ToolsPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));

import SlotMachineWidget from './components/SlotMachineWidget';
import TransitionWipe from './components/Animations/TransitionWipe';

// Global persistent audio — lives outside routing so it never resets on page nav
const GlobalAudio = () => {
  useEffect(() => {
    const audio = document.getElementById('bg-audio');
    if (audio) {
      audio.volume = 0.2; // Low ambient volume as requested
      // Intentionally NOT autoplaying as per user request
    }
  }, []);

  return <audio id="bg-audio" loop src="/bg-music.mp3" style={{ display: 'none' }} />;
};

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/': 'RE-RENDER | Digital Agency & Assets',
      '/journey': 'My Journey | RE-RENDER',
      '/about': 'About | RE-RENDER',
      '/shop': 'Shop | RE-RENDER',
      '/services': 'Services | RE-RENDER',
      '/features': 'Features | RE-RENDER',
      '/prompts': 'Prompt Lab | RE-RENDER',
      '/submit-prompt': 'Submit Prompt | RE-RENDER',
      '/arcade': 'The Arcade | RE-RENDER',
      '/arcade/creative-studio': 'Creative Studio | RE-RENDER',
      '/arcade/type-racer': 'Type Racer | RE-RENDER',
      '/arcade/hex-code-hero': 'Hex Code Hero | RE-RENDER',
      '/arcade/palette-thief': 'Palette Thief | RE-RENDER',
      '/arcade/reflex': 'Chrono Strike | RE-RENDER',
      '/arcade/wallpaper-lab': 'AI Wallpaper Lab | RE-RENDER',
      '/tools': 'Utility Labs | RE-RENDER',
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

const FullPageSuspenseLoader = () => (
  <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
    <div className="shimmer-text">INITIALIZING SUBSYSTEM...</div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<FullPageSuspenseLoader />}>
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TransitionWipe><Home /></TransitionWipe>} />
        <Route path="/services" element={<TransitionWipe><Services /></TransitionWipe>} />
        <Route path="/shop" element={<TransitionWipe><ShopPage /></TransitionWipe>} />
        <Route path="/pricing" element={<TransitionWipe><PricingPage /></TransitionWipe>} />
        <Route path="/about" element={<TransitionWipe><AboutPage /></TransitionWipe>} />
        <Route path="/arcade" element={<TransitionWipe><ArcadePage /></TransitionWipe>} />
        <Route path="/arcade/type-racer" element={<TransitionWipe><TypeRacerPage /></TransitionWipe>} />
        <Route path="/arcade/hex-code-hero" element={<TransitionWipe><HexCodeHeroPage /></TransitionWipe>} />
        <Route path="/arcade/palette-thief" element={<TransitionWipe><PalettePickerPage /></TransitionWipe>} />
        <Route path="/arcade/reflex" element={<TransitionWipe><ReflexGamePage /></TransitionWipe>} />
        <Route path="/arcade/wallpaper-lab" element={<TransitionWipe><WallpaperLab /></TransitionWipe>} />
        <Route path="/tools" element={<TransitionWipe><ToolsPage /></TransitionWipe>} />
        <Route path="/features" element={<TransitionWipe><Features /></TransitionWipe>} />
        <Route path="/prompts" element={<TransitionWipe><Prompts /></TransitionWipe>} />
        <Route path="/submit-prompt" element={<TransitionWipe><SubmitPrompt /></TransitionWipe>} />
        <Route path="/admin" element={<TransitionWipe><Admin /></TransitionWipe>} />
        <Route path="/journey" element={<TransitionWipe><PortfolioPage /></TransitionWipe>} />
        <Route path="/privacy" element={<TransitionWipe><PrivacyPolicy /></TransitionWipe>} />
        <Route path="/terms" element={<TransitionWipe><TermsOfService /></TransitionWipe>} />
        <Route path="/license" element={<TransitionWipe><LicenseAgreement /></TransitionWipe>} />
        <Route path="/refund" element={<TransitionWipe><RefundPolicy /></TransitionWipe>} />
        <Route path="*" element={<TransitionWipe><NotFound /></TransitionWipe>} />
      </Routes>
      </React.Suspense>
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
    <ThemeProvider>
      <Router>
        <TitleManager />
        <ScrollToTop />
        <GlobalAudio />
        <div className="app">
          <Cursor />
          <ScrollProgress />
          <Navbar />

          <AnimatedRoutes />

          {/* The SlotMachineWidget is intended to be rendered within the Home component,
              as indicated by the context of the provided Code Edit snippet.
              The instruction "render the widget right above the CTA component on the main page"
              implies a modification to the Home component's structure, not App.jsx directly.
              Since the Home component's content is not provided, this change cannot be
              applied here directly without breaking the App component's structure.
              The "remove the Lucky Render route" instruction is also not applicable
              as no such route exists in the provided AnimatedRoutes. */}

          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
