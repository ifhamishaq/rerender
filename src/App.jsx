import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Cursor from './components/Cursor';
import ScrollToTop from './components/ScrollToTop';
import TransitionWipe from './components/Animations/TransitionWipe';
import ScrollProgress from './components/ScrollProgress';
import MacTopBar from './components/MacTopBar';
import SmoothScroll from './components/SmoothScroll';

// Pages
import Home from './pages/Home';
import OracleWorkspacePage from './pages/OracleWorkspacePage';
import PortfolioPage from './pages/PortfolioPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import Admin from './components/Admin';
import CareersPage from './pages/CareersPage';
import ApplyPage from './pages/ApplyPage';
import ProfilePage from './pages/ProfilePage';
import RechargePage from './pages/RechargePage';
import ToolsPage from './pages/ToolsPage';
import AILabPage from './pages/AILabPage';
import CaptionWriterPage from './pages/CaptionWriterPage';
import ThumbnailAnalyserPage from './pages/ThumbnailAnalyserPage';
import WallpaperLab from './pages/WallpaperLab';
import HexCodeHeroPage from './pages/HexCodeHeroPage';
import PalettePickerPage from './pages/PalettePickerPage';
import TypeRacerPage from './pages/TypeRacerPage';
import ReflexGamePage from './pages/ReflexGamePage';
import ContractPage from './pages/ContractPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LicenseAgreement from './components/LicenseAgreement';
import RefundPolicy from './components/RefundPolicy';
import NotFound from './components/NotFound';

const DigitalLoader = () => {
    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem'
            }}
        >
            {/* Spinning Apple-style loader */}
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'appleSpinLoader 0.8s linear infinite'
            }} />
            
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
 
  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<DigitalLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<TransitionWipe><Home /></TransitionWipe>} />
          <Route path="/work" element={<TransitionWipe><PortfolioPage /></TransitionWipe>} />
          <Route path="/get-in-touch" element={<TransitionWipe><ContactPage /></TransitionWipe>} />
          <Route path="/about" element={<TransitionWipe><AboutPage /></TransitionWipe>} />
          
          <Route path="/admin" element={<TransitionWipe><Admin /></TransitionWipe>} />
          
          <Route path="/careers" element={<TransitionWipe><CareersPage /></TransitionWipe>} />
          <Route path="/apply" element={<TransitionWipe><ApplyPage /></TransitionWipe>} />
          <Route path="/apply/:jobId" element={<TransitionWipe><ApplyPage /></TransitionWipe>} />
          <Route path="/profile" element={<TransitionWipe><ProfilePage /></TransitionWipe>} />
          <Route path="/recharge" element={<TransitionWipe><RechargePage /></TransitionWipe>} />
          <Route path="/dossier" element={<Navigate to="/profile" replace />} />
          <Route path="/tools" element={<TransitionWipe><ToolsPage /></TransitionWipe>} />
          
          {/* Lab & Utility Routes */}
          <Route path="/lab/oracle-workspace" element={<TransitionWipe><OracleWorkspacePage /></TransitionWipe>} />
          <Route path="/lab/oracle2.0" element={<Navigate to="/lab/oracle-workspace" replace />} />
          <Route path="/lab/ai-agent" element={<Navigate to="/lab/oracle-workspace" replace />} />
          <Route path="/lab/caption-writer" element={<TransitionWipe><CaptionWriterPage /></TransitionWipe>} />
          <Route path="/lab/thumbnail-analyser" element={<TransitionWipe><ThumbnailAnalyserPage /></TransitionWipe>} />

          {/* Tools / Creative Lab Routes */}
          <Route path="/tools/wallpaper-lab" element={<TransitionWipe><WallpaperLab /></TransitionWipe>} />
          <Route path="/tools/hex-code-hero" element={<TransitionWipe><HexCodeHeroPage /></TransitionWipe>} />
          <Route path="/tools/palette-picker" element={<TransitionWipe><PalettePickerPage /></TransitionWipe>} />
          <Route path="/tools/type-racer" element={<TransitionWipe><TypeRacerPage /></TransitionWipe>} />
          <Route path="/tools/reflex" element={<TransitionWipe><ReflexGamePage /></TransitionWipe>} />
          
          <Route path="/arcade/*" element={<Navigate to="/tools" replace />} />
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

const AppContent = () => {
    const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();

    return (
        <div className="app" style={{ position: 'relative', paddingTop: '28px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <MacTopBar />
            <Cursor />
            <ScrollProgress />
            <Navbar />

            <AnimatedRoutes />

            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

import { OracleProvider } from './context/OracleContext';

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <OracleProvider>
                    <Router>
                        <SmoothScroll>
                            <ScrollToTop />
                            <AppContent />
                        </SmoothScroll>
                    </Router>
                </OracleProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
