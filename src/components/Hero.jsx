import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Magnetic from './Animations/Magnetic'; // Project's internal magnetic component
import GlitchText from './Animations/GlitchText';
import DotGrid from './DotGrid';
import Hero3D from './3D/Hero3D';
import { useTheme } from '../context/ThemeContext';
import './Hero.css';

export default function Hero() {
    const ref = useRef(null);
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    // Derived theme variables for the GSAP canvas which can't read CSS vars easily
    const dotBase = isDarkMode ? '#222222' : '#E0E0E0';
    const dotActive = isDarkMode ? '#39FF14' : '#5227FF';

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

            {/* Massive background Infinite Marquee */}
            <div className="hero-marquee-container">
                <div className="hero-marquee-track">
                    WEBSITES • VIDEO • 3D • WEBSITES • VIDEO • 3D • WEBSITES • VIDEO • 3D •
                </div>
            </div>

            {/* Interactive Dot Grid Background */}
            <DotGrid 
                baseColor={dotBase} 
                activeColor={dotActive} 
                dotSize={2} 
                gap={35} 
                proximity={200}
                returnDuration={2}
            />

            {/* Hero GIF Background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 0,
                opacity: 0.4,
                pointerEvents: 'none'
            }}>
                <img 
                    src="/hero.gif" 
                    alt="" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>
            
            <motion.div className="hero-content" style={{ opacity }}>
                <motion.div style={{ y: titleY }}>
                    <div className="hero-editorial-meta">
                        <span className="mono-label">VOL. 03</span>
                        <span className="line-sep" />
                        <span className="mono-label">ISSUE 2026</span>
                    </div>
                    
                    <h1 className="hero-title editorial reduced">
                        <motion.span 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="serif-italic"
                        >
                            MODERN DESIGN
                        </motion.span>
                        <motion.span 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.0 }}
                            className="sans-outline"
                        >
                            & VIDEO
                        </motion.span>
                    </h1>

                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', marginTop: '2.5rem' }}>
                        <div className="vertical-line" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <motion.p 
                                className="hero-subtitle editorial-para"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1.2 }}
                            >
                                We are a creative studio that helps your brand grow. We make high-quality videos and modern designs that get results.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Magnetic strength={0.2} padding={80}>
                                    <button
                                        className="hero-cta editorial-cta"
                                        onClick={routeToServices}
                                    >
                                        Get In Touch
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </Magnetic>
                            </motion.div>
                        </div>
                    </div>

                    {/* Stats integrated into flow to prevent overlap */}
                    <div className="hero-stats editorial-flow">
                        <motion.div
                            className="hero-stat"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 1.6 }}
                        >
                            <div className="hero-stat-number">5+</div>
                            <div className="hero-stat-label">Years Experience</div>
                        </motion.div>
                        <motion.div
                            className="hero-stat"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 1.8 }}
                        >
                            <div className="hero-stat-number">20+</div>
                            <div className="hero-stat-label">Clients</div>
                        </motion.div>
                        <motion.div
                            className="hero-stat"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 2.0 }}
                        >
                            <div className="hero-stat-number">100+</div>
                            <div className="hero-stat-label">Digital Assets</div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            <Hero3D isDarkMode={isDarkMode} />

            <div 
                className="hero-scroll" 
                onClick={() => {
                    const nextSection = document.getElementById('approach');
                    if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ cursor: 'pointer' }}
            >
                <div className="hero-scroll-line" />
            </div>
        </section>
    );
}
