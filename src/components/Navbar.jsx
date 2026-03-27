import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { User, LogOut, Wallet } from 'lucide-react';

const Navbar = () => {
    const { user, profile, signOut, setIsAuthModalOpen } = useAuth();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const location = useLocation();

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
        { href: '/work', label: 'Work' },
        { href: '/get-in-touch', label: 'Get In Touch' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/shop', label: 'Shop' },
        { href: '/tools', label: 'Tools' },
        { href: '/arcade', label: 'Arcade' },
        { href: '/blog', label: 'Blog' },
        { href: '/about', label: 'About' },
    ];

    const isActive = (href) => location.pathname === href;
    const isArcade = location.pathname === '/arcade';
    const accentColor = isArcade ? '#E8111A' : 'var(--color-accent)';

    return (
        <>
            <motion.nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 'var(--nav-height)',
                    padding: '0 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100,
                    backgroundColor: isScrolled || isMobileMenuOpen
                        ? isDarkMode ? 'rgba(8,8,8,0.97)' : 'rgba(248,246,241,0.97)'
                        : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
                    color: 'var(--color-text)',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 102 }}>
                    <Link to="/" style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        letterSpacing: '-0.04em',
                        textDecoration: 'none',
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}>
                        RE<span style={{ color: 'var(--color-accent)' }}>-</span>RENDER
                    </Link>

                    {/* Mobile Credit Badge (Always Visible if logged in) */}
                    <AnimatePresence>
                        {user && profile && (
                            <Link to="/dossier" className="mobile-only" style={{ textDecoration: 'none', display: 'none' }}>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.55rem',
                                        color: 'var(--color-accent)',
                                        backgroundColor: 'rgba(57,255,20,0.05)',
                                        padding: '0.2rem 0.4rem',
                                        border: '1px solid var(--color-accent)',
                                        borderRadius: '2px',
                                        fontWeight: 700
                                    }}
                                >
                                    <Wallet size={10} />
                                    <span>{profile.credits}</span>
                                </motion.div>
                            </Link>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Nav Links */}
                <div className="desktop-menu" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2.5rem',
                }}>
                    {navLinks.map(({ href, label }) => (
                        <Link
                            key={href}
                            to={href}
                            className="nav-link"
                            style={{
                                color: 'var(--color-text)',
                                opacity: isActive(href) ? 1 : 0.6,
                                fontWeight: isActive(href) ? 700 : 400,
                            }}
                        >
                            {label.toUpperCase()}
                            {isActive(href) && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    left: 0,
                                    width: '100%',
                                    height: '2px',
                                    backgroundColor: accentColor,
                                }} />
                            )}
                        </Link>
                    ))}

                    {/* Contact CTA */}
                    <a
                        href="mailto:real.re.render@gmail.com"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: '0.5rem 1.25rem',
                            border: '1px solid var(--color-text)',
                            color: 'var(--color-text)',
                            textDecoration: 'none',
                            transition: 'background 0.2s, color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-text)';
                            e.currentTarget.style.color = 'var(--color-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text)';
                        }}
                    >
                        HIRE US
                    </a>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        {/* Credits Badge */}
                        <AnimatePresence>
                            {user && profile && (
                                <Link to="/dossier" style={{ textDecoration: 'none' }}>
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.65rem',
                                            color: 'var(--color-accent)',
                                            backgroundColor: 'rgba(57,255,20,0.05)',
                                            padding: '0.3rem 0.6rem',
                                            border: '1px solid var(--color-accent)',
                                            borderRadius: '2px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Wallet size={12} />
                                        <span>{profile.credits} CR</span>
                                    </motion.div>
                                </Link>
                            )}
                        </AnimatePresence>

                        {/* Auth Button */}
                        <button
                            onClick={user ? signOut : () => setIsAuthModalOpen(true)}
                            title={user ? 'Sign Out' : 'Login'}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--color-border)',
                                width: '32px',
                                height: '32px',
                                color: user ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                background: 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            {user ? <LogOut size={14} /> : <User size={14} />}
                        </button>

                        <button
                            onClick={toggleAudio}
                            title={isPlaying ? 'Pause Music' : 'Play Music'}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                color: isPlaying ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                background: 'none',
                                transition: 'color 0.2s',
                            }}
                        >
                            {isPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
                        </button>

                        <button
                            onClick={toggleTheme}
                             title="Toggle Theme"
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                color: 'var(--color-text-secondary)',
                                background: 'none',
                                transition: 'color 0.2s',
                            }}
                        >
                            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                        </button>
                    </div>
                </div>

                {/* Hamburger */}
                <button
                    className="hamburger-btn"
                    onClick={toggleMenu}
                    style={{ display: 'none', flexDirection: 'column', gap: '5px', zIndex: 102, cursor: 'pointer' }}
                >
                    <motion.div animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                        style={{ width: '24px', height: '1.5px', backgroundColor: 'var(--color-text)' }} />
                    <motion.div animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                        style={{ width: '24px', height: '1.5px', backgroundColor: 'var(--color-text)' }} />
                    <motion.div animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                        style={{ width: '24px', height: '1.5px', backgroundColor: 'var(--color-text)' }} />
                </button>
            </motion.nav>

            {/* Mobile Menu */}
            <motion.div
                initial={false}
                animate={isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: '-100%' }}
                transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'var(--color-bg)',
                    zIndex: 101,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '2rem',
                    gap: '0',
                    pointerEvents: isMobileMenuOpen ? 'all' : 'none',
                }}
            >
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '2rem',
                    textTransform: 'uppercase'
                }}>
                    Navigation
                </div>
                {navLinks.map(({ href, label }, i) => (
                    <Link
                        key={href}
                        to={href}
                        onClick={toggleMenu}
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.5rem, 10vw, 5rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            color: isActive(href) ? 'var(--color-accent)' : 'var(--color-text)',
                            textDecoration: 'none',
                            lineHeight: 1.05,
                            borderTop: i === 0 ? '1px solid var(--color-border)' : 'none',
                            borderBottom: '1px solid var(--color-border)',
                            padding: '0.6rem 0',
                            opacity: isActive(href) ? 1 : 0.85,
                        }}
                    >
                        {label}
                    </Link>
                ))}
                    {/* Mobile Audio / Theme / Auth */}
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <button onClick={user ? signOut : () => setIsAuthModalOpen(true)} style={{ border: '1px solid var(--color-border)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user ? 'var(--color-accent)' : 'var(--color-text)' }}>
                            {user ? <LogOut size={16} /> : <User size={16} />}
                        </button>
                        <button onClick={toggleAudio} style={{ border: '1px solid var(--color-border)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPlaying ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                            {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        <button onClick={toggleTheme} style={{ border: '1px solid var(--color-border)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>

                    <a href="mailto:real.re.render@gmail.com" onClick={toggleMenu}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'underline', marginTop: '1rem' }}>
                        real.re.render@gmail.com
                    </a>
            </motion.div>
        </>
    );
};

export default Navbar;
