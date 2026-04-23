import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Magnetic from './Animations/Magnetic';
import './Hero.css';

export default function Hero() {
    const ref = useRef(null);
    const navigate = useNavigate();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);





    const routeToServices = () => {
        navigate('/get-in-touch');
    };

    return (
        <section className="hero" ref={ref} id="home">


            {/* Hero GIF Background */}
            <div className="hero-bg-media">
                <img 
                    src="/hero.gif" 
                    alt="Hero animation" 
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

                    
                    {/* Massive static headline */}
                    <h1 className="hero-title editorial reduced">
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
                                className="hero-title-line-1"
                                style={{ display: 'block' }}
                            >
                                RE-RENDERING YOUR
                            </motion.span>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.4 }}
                                className="hero-title-line-1"
                                style={{ color: 'var(--color-accent)', display: 'block' }}
                            >
                                DIGITAL DOMINANCE.
                            </motion.span>
                        </div>
                    </h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2.5rem' }}>
                        {/* Psychologically loaded subtitle */}
                        <motion.p 
                            className="hero-subtitle editorial-para"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            >
                                The top 1% of brands never settle for average creative. We build premium websites, cinematic videos, and 3D experiences that make your competitors irrelevant.
                            </motion.p>

                            {/* Scarcity-driven CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className="hero-cta-group"
                            >
                                <Magnetic strength={0.2} padding={80}>
                                    <button
                                        className="hero-cta editorial-cta"
                                        onClick={routeToServices}
                                    >
                                        START PROJECT
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </Magnetic>
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
