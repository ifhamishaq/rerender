import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Magnetic from './Animations/Magnetic'; // Project's internal magnetic component
import DotGrid from './DotGrid';
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
        navigate('/services');
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
                    DIGITAL ASSETS • CREATIVE STUDIO • NEXT GEN WEB • DIGITAL ASSETS • CREATIVE STUDIO • NEXT GEN WEB •
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
            
            <motion.div className="hero-content" style={{ opacity }}>
                <motion.div style={{ y: titleY }}>
                    <div className="hero-label">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 1 }}
                        >
                            Vol. 3 &mdash; The Digital Renaissance
                        </motion.span>
                    </div>
                    
                    <h1 className="hero-title">
                        <motion.span 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: 'block' }}
                        >
                            Intelligence
                        </motion.span>
                        <motion.em 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: 'inline-block' }}
                        >
                            Artfully Applied.
                        </motion.em>
                    </h1>

                    <motion.p 
                        className="hero-subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.4 }}
                    >
                        Transforming raw concepts into cinematic digital experiences through technical mastery and artistic vision. We engineer the next generation of visual storytelling.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Magnetic strength={0.2} padding={80}>
                        <button
                            className="hero-cta"
                            onClick={routeToServices}
                        >
                            Work With Agency
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </Magnetic>
                </motion.div>
            </motion.div>

            {/* Stats */}
            <div className="hero-stats">
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

            <div className="hero-scroll">
                <div className="hero-scroll-line" />
            </div>
        </section>
    );
}
