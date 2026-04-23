import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import MacTopBar from './components/MacTopBar';
import AuthModal from './components/AuthModal';
import Hero from './components/Hero';
import ScrollToTop from './components/ScrollToTop';

import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import DossierPage from './pages/DossierPage';
import Footer from './components/Footer';
import Marquee from './components/Marquee';
import Cursor from './components/Cursor';
import NoiseOverlay from './components/NoiseOverlay';
import ScrollProgress from './components/ScrollProgress';
import ErrorBoundary from './components/ErrorBoundary';
import StickySidebar from './components/StickySidebar';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LicenseAgreement from './components/LicenseAgreement';
import RefundPolicy from './components/RefundPolicy';
import NotFound from './components/NotFound';
import Admin from './components/Admin';

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Services = React.lazy(() => import('./pages/Services'));
const CareersPage = React.lazy(() => import('./pages/CareersPage'));
const ApplyPage = React.lazy(() => import('./pages/ApplyPage'));
const ContractPage = React.lazy(() => import('./pages/ContractPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const ToolsPage = React.lazy(() => import('./pages/ToolsPage'));

// Utility & Lab Pages
const AILabPage = React.lazy(() => import('./pages/AILabPage'));
const CaptionWriterPage = React.lazy(() => import('./pages/CaptionWriterPage'));
const ThumbnailAnalyserPage = React.lazy(() => import('./pages/ThumbnailAnalyserPage'));
const WallpaperLab = React.lazy(() => import('./pages/WallpaperLab'));
const HexCodeHeroPage = React.lazy(() => import('./pages/HexCodeHeroPage'));
const PalettePickerPage = React.lazy(() => import('./pages/PalettePickerPage'));
const ReflexGamePage = React.lazy(() => import('./pages/ReflexGamePage'));
const TypeRacerPage = React.lazy(() => import('./pages/TypeRacerPage'));
const SafeZonePage = React.lazy(() => import('./pages/SafeZonePage'));
const EstimatePage = React.lazy(() => import('./pages/EstimatePage'));

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
      '/': 'RE-RENDER | Creative Agency',
      '/work': 'Our Work | RE-RENDER',
      '/get-in-touch': 'Contact Us | RE-RENDER',
      '/about': 'About | RE-RENDER',
      '/careers': 'Join the Team | RE-RENDER',
      '/apply': 'Apply | RE-RENDER',
      '/admin': 'Admin Panel | RE-RENDER',
      '/privacy': 'Privacy Policy | RE-RENDER',
      '/terms': 'Terms of Service | RE-RENDER',
      '/refund': 'Refund Policy | RE-RENDER',
      '/license': 'License Agreement | RE-RENDER',
    };

    document.title = titleMap[location.pathname] || 'RE-RENDER | Elite Creative Agency';
  }, [location]);

  return null;
};

const DigitalLoader = () => {
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isReady ? 0 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => isReady}
            style={{
                width: '100vw', height: '100vh',
                backgroundColor: '#000',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'fixed', inset: 0, zIndex: 9999,
                overflow: 'hidden',
                pointerEvents: isReady ? 'none' : 'all'
            }}
        >
            {/* Subtle radial glow behind spinner */}
            <div style={{
                position: 'absolute',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                pointerEvents: 'none'
            }} />

            {/* Apple-style spinning ring */}
            <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '2.5rem' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ animation: 'appleSpinLoader 1s linear infinite' }}>
                    <defs>
                        <linearGradient id="loader-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#39FF14" stopOpacity="1" />
                            <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="2.5"
                    />
                    <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke="url(#loader-gradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="80 45.66"
                    />
                </svg>
            </div>

            {/* Pulsing wordmark */}
            <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.35em',
                    color: '#fff',
                    fontWeight: 700,
                    userSelect: 'none'
                }}
            >
                RE — RENDER
            </motion.div>

            {/* Inline keyframes */}
            <style>{`
                @keyframes appleSpinLoader {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdminLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
 
  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<DigitalLoader />}>
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TransitionWipe><Home /></TransitionWipe>} />
        <Route path="/work" element={<TransitionWipe><PortfolioPage /></TransitionWipe>} />
        <Route path="/get-in-touch" element={<TransitionWipe><Services /></TransitionWipe>} />
        <Route path="/about" element={<TransitionWipe><AboutPage /></TransitionWipe>} />
        
        {isAdminLocal && <Route path="/admin" element={<TransitionWipe><Admin /></TransitionWipe>} />}
        
        <Route path="/careers" element={<TransitionWipe><CareersPage /></TransitionWipe>} />
        <Route path="/apply" element={<TransitionWipe><ApplyPage /></TransitionWipe>} />
        <Route path="/apply/:jobId" element={<TransitionWipe><ApplyPage /></TransitionWipe>} />
        <Route path="/profile" element={<TransitionWipe><ProfilePage /></TransitionWipe>} />
        <Route path="/dossier" element={<TransitionWipe><DossierPage /></TransitionWipe>} />
        <Route path="/tools" element={<TransitionWipe><ToolsPage /></TransitionWipe>} />
        
        {/* Lab & Utility Routes */}
        <Route path="/lab/ai-agent" element={<TransitionWipe><AILabPage /></TransitionWipe>} />
        <Route path="/lab/caption-writer" element={<TransitionWipe><CaptionWriterPage /></TransitionWipe>} />
        <Route path="/lab/thumbnail-analyser" element={<TransitionWipe><ThumbnailAnalyserPage /></TransitionWipe>} />
        <Route path="/lab/safe-zone" element={<TransitionWipe><SafeZonePage /></TransitionWipe>} />
        <Route path="/estimate" element={<TransitionWipe><EstimatePage /></TransitionWipe>} />
        
        {/* Arcade / Experiment Routes (Migrated to Tools) */}
        <Route path="/arcade/wallpaper-lab" element={<TransitionWipe><WallpaperLab /></TransitionWipe>} />
        <Route path="/arcade/hex-code-hero" element={<TransitionWipe><HexCodeHeroPage /></TransitionWipe>} />
        <Route path="/arcade/palette-picker" element={<TransitionWipe><PalettePickerPage /></TransitionWipe>} />
        <Route path="/arcade/type-racer" element={<TransitionWipe><TypeRacerPage /></TransitionWipe>} />
        <Route path="/arcade/reflex" element={<TransitionWipe><ReflexGamePage /></TransitionWipe>} />
        <Route path="/legal/portfolio-agreement" element={<TransitionWipe><ContractPage /></TransitionWipe>} />
        <Route path="/privacy" element={<TransitionWipe><PrivacyPolicy /></TransitionWipe>} />
        <Route path="/terms" element={<TransitionWipe><TermsOfService /></TransitionWipe>} />
        <Route path="/license" element={<TransitionWipe><LicenseAgreement /></TransitionWipe>} />
        <Route path="/refund" element={<TransitionWipe><RefundPolicy /></TransitionWipe>} />
        <Route path="/services" element={<Navigate to="/get-in-touch" replace />} />
        <Route path="*" element={<TransitionWipe><NotFound /></TransitionWipe>} />

      </Routes>
      </React.Suspense>
    </AnimatePresence>
  );
};



const MainApp = () => {
    const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();

    return (
        <ThemeProvider>
            <Router>
                <TitleManager />
                <ScrollToTop />
                <GlobalAudio />
                <div className="app" style={{ position: 'relative', paddingTop: '28px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <MacTopBar />
                    <Cursor />
                    <ScrollProgress />
                    <Navbar />

                    <AnimatedRoutes />

                    <Footer />
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                </div>
            </Router>
        </ThemeProvider>
    );
};

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
