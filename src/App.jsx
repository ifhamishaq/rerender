import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import GlobalOracle from './components/GlobalOracle';
import Hero from './components/Hero';
import ScrollToTop from './components/ScrollToTop';

import Shop from './components/Shop';
import Footer from './components/Footer';
import Marquee from './components/Marquee';
import Cursor from './components/Cursor';
import NoiseOverlay from './components/NoiseOverlay';
import ScrollProgress from './components/ScrollProgress';
import StickySidebar from './components/StickySidebar';
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
const CareersPage = React.lazy(() => import('./pages/CareersPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const AILabPage = React.lazy(() => import('./pages/AILabPage'));
const SafeZonePage = React.lazy(() => import('./pages/SafeZonePage'));
const EstimatePage = React.lazy(() => import('./pages/EstimatePage'));
const CaptionWriterPage = React.lazy(() => import('./pages/CaptionWriterPage'));
const ThumbnailAnalyserPage = React.lazy(() => import('./pages/ThumbnailAnalyserPage'));

// Standalone AI Tools Section
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
      '/': 'RE-RENDER | Creative Agency',
      '/careers': 'Join the Team | RE-RENDER',
      '/about': 'About | RE-RENDER',
      '/shop': 'Shop | RE-RENDER',
      '/get-in-touch': 'Get In Touch | RE-RENDER',
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
      '/refund': 'Refund Policy | RE-RENDER',
      '/blog': 'RE-RENDER Blog',
      '/blog/:slug': 'Article | RE-RENDER',
      '/license': 'License Agreement | RE-RENDER',
      '/lab/caption-writer': 'Caption Writer | RE-RENDER',
      '/lab/thumbnail-analyser': 'Thumbnail Analyser | RE-RENDER',

    };

    document.title = titleMap[location.pathname] || 'RE-RENDER | Digital Agency & Assets';
  }, [location]);

  return null;
};

const DigitalLoader = () => {
    const [progress, setProgress] = React.useState(0);
    const [status, setStatus] = React.useState('SYS_BOOT');

    React.useEffect(() => {
        const statuses = ['SUBSYSTEM_SYNC', 'CORE_INIT', 'RE-RENDER_LOAD', 'ALGORITHMIC_BIAS', 'READY'];
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
                    RE-RENDER CREATIVE AGENCY // DATA_STREAM_STABLE
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

  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<DigitalLoader />}>
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TransitionWipe><Home /></TransitionWipe>} />
        <Route path="/work" element={<TransitionWipe><PortfolioPage /></TransitionWipe>} />
        <Route path="/get-in-touch" element={<TransitionWipe><Services /></TransitionWipe>} />
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
        <Route path="/careers" element={<TransitionWipe><CareersPage /></TransitionWipe>} />
        <Route path="/privacy" element={<TransitionWipe><PrivacyPolicy /></TransitionWipe>} />
        <Route path="/terms" element={<TransitionWipe><TermsOfService /></TransitionWipe>} />
        <Route path="/license" element={<TransitionWipe><LicenseAgreement /></TransitionWipe>} />
        <Route path="/refund" element={<TransitionWipe><RefundPolicy /></TransitionWipe>} />
        <Route path="/blog" element={<TransitionWipe><BlogPage /></TransitionWipe>} />
        <Route path="/blog/:slug" element={<TransitionWipe><BlogPostPage /></TransitionWipe>} />
        <Route path="/lab/ai-agent" element={<TransitionWipe><AILabPage /></TransitionWipe>} />
        <Route path="/lab/safe-zone" element={<TransitionWipe><SafeZonePage /></TransitionWipe>} />
        <Route path="/estimate" element={<TransitionWipe><EstimatePage /></TransitionWipe>} />
        <Route path="/lab/caption-writer" element={<TransitionWipe><CaptionWriterPage /></TransitionWipe>} />
        <Route path="/lab/thumbnail-analyser" element={<TransitionWipe><ThumbnailAnalyserPage /></TransitionWipe>} />
        <Route path="/dossier" element={<TransitionWipe><DossierPage /></TransitionWipe>} />
        <Route path="/services" element={<Navigate to="/get-in-touch" replace />} />
        <Route path="*" element={<TransitionWipe><NotFound /></TransitionWipe>} />

      </Routes>
      </React.Suspense>
    </AnimatePresence>
  );
};

import DossierPage from './pages/DossierPage';

const MainApp = () => {
    const { isAuthModalOpen, setIsAuthModalOpen } = useAuth();

    return (
        <ThemeProvider>
            <Router>
                <TitleManager />
                <ScrollToTop />
                <GlobalAudio />
                <div className="app" style={{ position: 'relative' }}>
                    <Cursor />
                    <ScrollProgress />
                    <Navbar />
                    <GlobalOracle />

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
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
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
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
