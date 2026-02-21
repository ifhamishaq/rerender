import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const Navbar = () => {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <motion.nav
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100,
                    backgroundColor: isScrolled || isMobileMenuOpen ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                    backdropFilter: (isScrolled || isMobileMenuOpen) ? 'blur(10px)' : 'none',
                    borderBottom: (isScrolled || isMobileMenuOpen) ? '1px solid #121212' : 'none',
                    transition: 'all 0.3s ease',
                }}
            >
                <a href="/" style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    letterSpacing: '-0.05em',
                    position: 'relative',
                    zIndex: 102,
                    textDecoration: 'none',
                    color: 'inherit'
                }}>
                    RE-RENDER
                </a>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', alignItems: 'center' }}>
                    <a href="/#shop">SHOP</a>
                    <a href="/prompts">PROMPTS</a>
                    <a href="/submit-prompt">SUBMIT</a>
                    <a href="mailto:real.re.render@gmail.com">CONTACT</a>

                    <a href="/?filter=FREE#shop" style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-text)',
                        padding: '0.75rem 1.5rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        boxShadow: '4px 4px 0px var(--color-text)',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                        cursor: 'pointer',
                        display: 'inline-block'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-2px, -2px)';
                            e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-text)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(0, 0)';
                            e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-text)';
                        }}
                    >
                        DOWNLOAD FREE
                    </a>
                </div>

                {/* Hamburger Button */}
                <button
                    className="hamburger-btn"
                    onClick={toggleMenu}
                    style={{
                        display: 'none',
                        flexDirection: 'column',
                        gap: '6px',
                        zIndex: 102,
                        cursor: 'pointer'
                    }}
                >
                    <motion.div
                        animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                        style={{ width: '30px', height: '2px', backgroundColor: '#121212' }}
                    />
                    <motion.div
                        animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                        style={{ width: '30px', height: '2px', backgroundColor: '#121212' }}
                    />
                    <motion.div
                        animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                        style={{ width: '30px', height: '2px', backgroundColor: '#121212' }}
                    />
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <motion.div
                initial={{ opacity: 0, y: '-100%' }}
                animate={isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#FFFFFF',
                    zIndex: 101,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem'
                }}
            >
                <a href="/#shop" onClick={toggleMenu}>SHOP</a>
                <a href="/prompts" onClick={toggleMenu}>PROMPTS</a>
                <a href="/submit-prompt" onClick={toggleMenu}>SUBMIT</a>
                <a href="mailto:real.re.render@gmail.com" onClick={toggleMenu}>CONTACT</a>
                <a href="/?filter=FREE#shop" onClick={toggleMenu} style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-text)',
                    padding: '1rem 2rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    boxShadow: '4px 4px 0px var(--color-text)',
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                }}
                >
                    DOWNLOAD FREE
                </a>
            </motion.div>
        </>
    );
};

export default Navbar;
