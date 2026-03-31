import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Magnetic from './Animations/Magnetic';
import DotGrid from './DotGrid';
import { useTheme } from '../context/ThemeContext';
import './Hero.css';

const ROTATING_WORDS = ['UNFORGETTABLE', 'UNSTOPPABLE', 'UNIGNORABLE'];

export default function Hero() {
    const ref = useRef(null);
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [wordIndex, setWordIndex] = useState(0);
    const [viewerCount] = useState(() => Math.floor(Math.random() * 12) + 14); // 14-25 simulated

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    const dotBase = isDarkMode ? '#222222' : '#E0E0E0';
    const dotActive = isDarkMode ? '#39FF14' : '#5227FF';

    // Rotate words every 2.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const routeToServices = () => {
        navigate('/get-in-touch');
    };

    return (
        <section className="hero" ref={ref} id="home">
            {/* Shutter Entrance */}
            <motion.div 
                className="shutter-top"
                initial={{ y: 0 }}
                animate={{ y: '-100%' }}
                transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1], delay: 0.5 }}
            />
            <motion.div 
                className="shutter-bottom"
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1], delay: 0.5 }}
            />

            {/* Cinematic letterbox bars */}
            <div className="hero-letterbox hero-letterbox-top" />
            <div className="hero-letterbox hero-letterbox-bottom" />

            {/* Background Marquee */}
            <div className="hero-marquee-container">
                <div className="hero-marquee-track">
                    WEBSITES • VIDEO • 3D • WEBSITES • VIDEO • 3D • WEBSITES • VIDEO • 3D •
                </div>
            </div>

            {/* Interactive Dot Grid */}
            <DotGrid 
                baseColor={dotBase} 
                activeColor={dotActive} 
                dotSize={2} 
                gap={35} 
                proximity={200}
                returnDuration={2}
            />

            {/* Hero GIF Background — cinematic */}
            <div className="hero-bg-media">
                <img 
                    src="/hero.gif" 
                    alt="" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                <div className="hero-bg-overlay" />
            </div>
            
            <motion.div className="hero-content" style={{ opacity }}>
                <motion.div style={{ y: titleY }}>
                    {/* Top meta with live availability */}
                    <div className="hero-editorial-meta">
                        <span className="live-dot" />
                        <span className="mono-label" style={{ color: 'var(--color-accent)' }}>CURRENTLY ACCEPTING PROJECTS</span>
                        <span className="line-sep" />
                        <span className="mono-label">2 SPOTS LEFT</span>
                    </div>
                    
                    {/* Massive headline with rotating word */}
                    <h1 className="hero-title editorial reduced">
                        <motion.span 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="hero-title-line-1"
                        >
                            WE MAKE BRANDS
                        </motion.span>
                        <motion.span 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.0 }}
                            className="hero-title-rotating-wrap"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={ROTATING_WORDS[wordIndex]}
                                    className="hero-rotating-word"
                                    initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {ROTATING_WORDS[wordIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </motion.span>
                    </h1>

                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', marginTop: '2.5rem' }}>
                        <div className="vertical-line" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Psychologically loaded subtitle */}
                            <motion.p 
                                className="hero-subtitle editorial-para"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1.2 }}
                            >
                                The top 1% of brands never settle for average creative. We build premium websites, cinematic videos, and 3D experiences that make your competitors irrelevant.
                            </motion.p>

                            {/* Scarcity-driven CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                                className="hero-cta-group"
                            >
                                <Magnetic strength={0.2} padding={80}>
                                    <button
                                        className="hero-cta editorial-cta"
                                        onClick={routeToServices}
                                    >
                                        CLAIM YOUR SPOT
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </Magnetic>
                                <div className="viewer-counter">
                                    <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                                    {viewerCount} people viewing right now
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Stats with psychological anchoring */}
                    <div className="hero-stats editorial-flow">
                        <motion.div
                            className="hero-stat"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 1.6 }}
                        >
                            <div className="hero-stat-number">50<span style={{ color: 'var(--color-accent)', fontSize: '60%' }}>+</span></div>
                            <div className="hero-stat-label">Projects Delivered</div>
                        </motion.div>
                        <motion.div
                            className="hero-stat"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 1.8 }}
                        >
                            <div className="hero-stat-number">100<span style={{ color: 'var(--color-accent)', fontSize: '60%' }}>%</span></div>
                            <div className="hero-stat-label">Client Satisfaction</div>
                        </motion.div>
                        <motion.div
                            className="hero-stat"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 2.0 }}
                        >
                            <div className="hero-stat-number">0<span style={{ color: 'var(--color-accent)', fontSize: '60%' }}>%</span></div>
                            <div className="hero-stat-label">Refund Requests</div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            <div 
                className="hero-scroll" 
                onClick={() => {
                    const nextSection = document.getElementById('work');
                    if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ cursor: 'pointer' }}
            >
                <div className="hero-scroll-line" />
            </div>
        </section>
    );
}
