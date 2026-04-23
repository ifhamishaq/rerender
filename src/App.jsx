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
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const CareersPage = React.lazy(() => import('./pages/CareersPage'));
const ApplyPage = React.lazy(() => import('./pages/ApplyPage'));
const ContractPage = React.lazy(() => import('./pages/ContractPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));

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
    const [progress, setProgress] = React.useState(0);
    const [status, setStatus] = React.useState('SYS_BOOT');

    React.useEffect(() => {
        const statuses = ['SYNCING', 'LOADING', 'RE-RENDER', 'DESIGNING', 'READY'];
        let statusIdx = 0;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const inc = Math.floor(Math.random() * 5) + 1;
                if (prev % 20 === 0) setStatus(statuses[statusIdx++ % statuses.length]);
                return Math.min(prev + inc, 100);
            });
        }, 40);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            width: '100vw', height: '100vh',
            backgroundColor: '#000', color: 'var(--color-accent)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            position: 'fixed', inset: 0, zIndex: 9999,
            overflow: 'hidden'
        }}>
            {/* Retro Scanning Line */}
            <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', left: 0, right: 0, height: '2px',
                    background: 'var(--color-accent)', opacity: 0.2, boxShadow: '0 0 20px var(--color-accent)'
                }}
            />

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.4em', marginBottom: '1rem', opacity: 0.8 }}>
                    &gt; {status}
                </div>
                
                <div style={{ 
                    fontSize: 'clamp(3rem, 15vw, 8rem)', 
                    fontWeight: 900, 
                    fontFamily: 'var(--font-display)', 
                    lineHeight: 1,
                    display: 'flex', alignItems: 'baseline',
                    color: '#fff', textShadow: '0 0 10px var(--color-accent)'
                }}>
                    {progress.toString().padStart(3, '0')}
                    <span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontWeight: 'bold' }}>%</span>
                </div>

                <div style={{ 
                    width: 'min(80vw, 400px)', height: '1px', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    marginTop: '2rem', position: 'relative'
                }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ height: '100%', backgroundColor: 'var(--color-accent)', boxShadow: '0 0 10px var(--color-accent)' }}
                    />
                </div>

                <div style={{ marginTop: '1.5rem', fontSize: '0.5rem', opacity: 0.4, maxWidth: '200px', marginInline: 'auto' }}>
                    RE-RENDER CREATIVE AGENCY // QUALITY DESIGN
                </div>
            </div>

            {/* Faint Grid Overlay */}
            <div style={{ 
                position: 'absolute', inset: 0, 
                backgroundImage: 'linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)',
                backgroundSize: '30px 30px', pointerEvents: 'none'
            }} />
        </div>
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
