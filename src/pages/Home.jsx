import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import Hero from '../components/Hero';
import PinterestWorkGrid from '../components/PinterestWorkGrid';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Testimonials from '../components/Testimonials';
import PricingFAQ from '../components/PricingFAQ';
import StickySidebar from '../components/StickySidebar';
import InfographicProcess from '../components/InfographicProcess';
import ContactSection from '../components/ContactSection';

/* ── Animated Counter Hook ─────────────────────────── */


/* ── Current Month Helper ──────────────────────────── */
const getCurrentMonth = () => {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                     'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return months[new Date().getMonth()];
};

const Home = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [fakeViewers] = useState(() => Math.floor(Math.random() * 18) + 12);

    return (
        <main style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}>
            <StickySidebar items={[
                { label: 'START', targetId: 'top' },
                { label: 'PROOF', targetId: 'work' },
                { label: 'PROCESS', targetId: 'process' },
                { label: 'REVIEWS', targetId: 'testimonials' },
                { label: 'FAQ', targetId: 'faq' },
                { label: 'CONTACT', targetId: 'contact' }
            ]} />

            <div id="top" />
            <Hero />



            {/* ===== PORTFOLIO — Pinterest Grid ===== */}
            <section id="work">
                <PinterestWorkGrid />
            </section>



            {/* ===== PROCESS — Infographic Pipeline ===== */}
            <InfographicProcess />

            <Testimonials />
            
            <div id="faq">
                <PricingFAQ />
            </div>

            <ContactSection />

            {/* ===== FINAL CTA — The Psychological Close ===== */}
            <section className="gradient-bg-animated" style={{
                padding: 'clamp(5rem, 15vw, 10rem) clamp(1rem, 5vw, 2rem)',
                color: 'var(--color-text)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '1px solid var(--color-border)'
            }}>
                {/* Particle-like floating dots */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.4
                        }}
                        style={{
                            position: 'absolute',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)',
                            left: `${15 + i * 14}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            pointerEvents: 'none'
                        }}
                    />
                ))}

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
                    {/* Viewer counter at top */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="viewer-counter"
                        style={{ justifyContent: 'center', marginBottom: '3rem' }}
                    >
                        <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                        {fakeViewers} people are viewing this page right now
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontSize: 'clamp(3rem, 10vw, 8rem)',
                            lineHeight: 0.9,
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 900,
                            margin: '0 0 1.5rem 0',
                            textTransform: 'uppercase'
                        }}
                    >
                        STILL <span style={{ color: 'var(--color-accent)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', textTransform: 'lowercase' }}>scrolling?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '4rem',
                            lineHeight: 1.7,
                            maxWidth: '600px',
                            margin: '0 auto 4rem'
                        }}
                    >
                        The brands that win don't hesitate. They move first.<br />
                        <strong style={{ color: 'var(--color-text)' }}>Your next project starts with one conversation.</strong>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        <button onClick={() => navigate('/get-in-touch')} className="skeuo-button" style={{ 
                            fontSize: '1.3rem', 
                            padding: '1.5rem 4rem',
                            border: '2px solid var(--color-accent)',
                            boxShadow: '0 0 15px rgba(255,59,48,0.3), var(--shadow-raised)',
                            cursor: 'pointer',
                            background: 'none',
                            color: 'var(--color-text)'
                        }}>
                            LET'S TALK — IT'S FREE →
                        </button>

                        {/* Trust micro-copy */}
                        <div style={{
                            marginTop: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                color: 'var(--color-text-secondary)',
                                letterSpacing: '0.1em'
                            }}>
                                ⚡ AVERAGE RESPONSE TIME: 2 HOURS
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                color: 'var(--color-text-secondary)',
                                opacity: 0.5,
                                letterSpacing: '0.1em'
                            }}>
                                NO COMMITMENT. NO CREDIT CARD. JUST A CONVERSATION.
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
};

export default Home;
