import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero() {
    const ref = useRef(null);
    const navigate = useNavigate();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const contentY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <section className="hero-premium" ref={ref} id="home">
            {/* Full background GIF */}
            <div className="hero-bg-media">
                <img
                    src="/hero.gif"
                    alt="RE-RENDER showreel"
                    loading="eager"
                />
                <div className="hero-bg-overlay" />
            </div>

            {/* Film grain overlay */}
            <div className="hero-grain" />

            <motion.div className="hero-premium-inner" style={{ opacity }}>
                <motion.div className="hero-left" style={{ y: contentY }}>
                    {/* Headline */}
                    <h1 className="hero-headline">
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span
                                initial={{ y: '110%' }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                                className="hero-line-white"
                            >
                                THE CREATOR OS.
                            </motion.span>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span
                                initial={{ y: '110%' }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                                className="hero-line-accent"
                            >
                                SCRIPT TO LAUNCH.
                            </motion.span>
                        </div>
                    </h1>

                    {/* Subheading */}
                    <motion.p
                        className="hero-sub"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        AI Director · Scene Storyboarding · Thumbnail CTR Audits · Viral Hooks.
                        <span className="hero-sub-break"> </span>
                        The all-in-one production engine for creators who refuse to be average.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="hero-ctas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.65 }}
                    >
                        <button
                            className="hero-btn-primary"
                            onClick={() => navigate('/tools')}
                        >
                            EXPLORE CREATOR OS
                            <ArrowRight size={16} />
                        </button>
                        <button
                            className="hero-btn-outline"
                            onClick={() => navigate('/lab/oracle-workspace')}
                        >
                            LAUNCH ORACLE FREE
                        </button>
                    </motion.div>

                    {/* Social Proof / Capability Badges */}
                    <motion.div
                        className="hero-proof"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.9 }}
                    >
                        <span>5 AI Engines</span>
                        <span className="hero-proof-dot">·</span>
                        <span>Zero Subscription Lock-in</span>
                        <span className="hero-proof-dot">·</span>
                        <span>Free Instant Inference</span>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <div
                className="hero-scroll-indicator"
                onClick={() => {
                    const next = document.getElementById('suite');
                    if (next) next.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <div className="hero-scroll-line" />
            </div>
        </section>
    );
}
