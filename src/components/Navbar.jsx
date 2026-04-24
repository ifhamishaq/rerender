import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sun, Moon, User, LogOut, Wallet, X, Home, FolderGit2, Mail, Briefcase, Info, Terminal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
    const { user, profile, signOut, setIsAuthModalOpen } = useAuth();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const location = useLocation();
    const [lastPath, setLastPath] = useState(location.pathname);

    useEffect(() => {
        if (location.pathname !== lastPath) {
            setIsMobileMenuOpen(false);
            setLastPath(location.pathname);
        }
    }, [location.pathname, lastPath]);

    useEffect(() => {
        const audio = document.getElementById('bg-audio');
        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            setIsPlaying(!audio.paused);
            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, []);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setIsScrolled(latest > 20);
    });

    const toggleAudio = () => {
        const audio = document.getElementById('bg-audio');
        if (audio) {
            if (isPlaying) audio.pause();
            else audio.play().catch(() => { });
        }
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navLinks = [
        { href: '/', icon: <Home size={28} strokeWidth={1.5} />, label: 'Home' },
        { href: '/work', icon: <FolderGit2 size={28} strokeWidth={1.5} />, label: 'Work' },
        { href: '/tools', icon: <Terminal size={28} strokeWidth={1.5} />, label: 'Tools' },
        { href: '/get-in-touch', icon: <Mail size={28} strokeWidth={1.5} />, label: 'Contact' },
        { href: '/careers', icon: <Briefcase size={28} strokeWidth={1.5} />, label: 'Careers' },
        { href: '/about', icon: <Info size={28} strokeWidth={1.5} />, label: 'About' },
        { href: '/profile', icon: <User size={28} strokeWidth={1.5} />, label: 'Profile' },
    ];

    const isActive = (href) => location.pathname === href;
    const accentColor = 'var(--color-accent)';

    return (
        <>
            {/* SVG Filter Definition for the Liquid Glass Dock */}
            <svg style={{ display: 'none' }}>
                <filter
                    id="glass-distortion"
                    x="0%"
                    y="0%"
                    width="100%"
                    height="100%"
                    filterUnits="objectBoundingBox"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.01 0.01"
                        numOctaves="1"
                        seed="5"
                        result="turbulence"
                    />
                    <feComponentTransfer in="turbulence" result="mapped">
                        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
                        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
                        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
                    </feComponentTransfer>
                    <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
                    <feSpecularLighting
                        in="softMap"
                        surfaceScale="5"
                        specularConstant="1"
                        specularExponent="100"
                        lightingColor="white"
                        result="specLight"
                    >
                        <fePointLight x="-200" y="-200" z="300" />
                    </feSpecularLighting>
                    <feComposite
                        in="specLight"
                        operator="arithmetic"
                        k1="0"
                        k2="1"
                        k3="1"
                        k4="0"
                        result="litImage"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="softMap"
                        scale="150"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            <motion.div 
                className="wrapper"
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    pointerEvents: 'none', 
                }}
            >
                <div className="liquidGlass-wrapper dock" style={{ pointerEvents: 'auto' }}>
                    <div className="liquidGlass-effect"></div>
                    <div className="liquidGlass-tint"></div>
                    <div className="liquidGlass-shine"></div>
                    <div className="liquidGlass-text">
                        <div className="dock">
                            {navLinks.map((link) => (
                                <Link to={link.href} key={link.label} style={{ textDecoration: 'none' }}>
                                    <motion.div 
                                        whileHover={{ scale: 0.95, y: -6 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                        style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            padding: '0 8px', 
                                            gap: '4px', 
                                            color: isActive(link.href) ? 'var(--color-accent)' : '#fff',
                                            width: 'min-content'
                                        }}
                                    >
                                        <div style={{ transform: 'scale(0.85)' }}>{link.icon}</div>
                                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {link.label}
                                        </span>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

        </>
    );
};

export default Navbar;
