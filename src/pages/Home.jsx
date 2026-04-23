import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import Hero from '../components/Hero';
import PinterestWorkGrid from '../components/PinterestWorkGrid';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Testimonials from '../components/Testimonials';
import PricingFAQ from '../components/PricingFAQ';
import StickySidebar from '../components/StickySidebar';
import InfographicProcess from '../components/InfographicProcess';
import servicesData from '../data/services.json';

/* ── Animated Counter Hook ─────────────────────────── */
const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, target, {
                duration,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: (value) => {
                    setDisplay(Math.floor(value));
                }
            });
            return () => controls.stop();
        }
    }, [isInView, target, duration]);

    return (
        <span ref={ref}>
            {prefix}{display}{suffix}
        </span>
    );
};

/* ── Current Month Helper ──────────────────────────── */
const getCurrentMonth = () => {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                     'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return months[new Date().getMonth()];
};

const Home = () => {
    const { isDarkMode } = useTheme();
    const [fakeViewers] = useState(() => Math.floor(Math.random() * 18) + 12);

    return (
        <main style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}>
            <StickySidebar items={[
                { label: 'START', targetId: 'top' },
                { label: 'PROOF', targetId: 'work' },
                { label: 'SERVICES', targetId: 'services' },
                { label: 'PROCESS', targetId: 'process' },
                { label: 'REVIEWS', targetId: 'testimonials' },
                { label: 'FAQ', targetId: 'faq' }
            ]} />

            <div id="top" />
            <Hero />

            {/* ===== STATS BAR — Animated Social Proof ===== */}
            <section style={{
                padding: 'clamp(3rem, 10vw, 5rem) clamp(1rem, 5vw, 2rem)',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Subtle animated gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 30% 50%, rgba(57,255,20,0.03), transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '2rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    {[
                        { target: 50, suffix: '+', label: 'PROJECTS DELIVERED' },
                        { target: 30, suffix: '+', label: 'HAPPY CLIENTS' },
                        { target: 100, suffix: '%', label: 'CLIENT SATISFACTION' },
                        { target: 0, suffix: '%', label: 'REFUND REQUESTS' },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                fontWeight: 900,
                                fontFamily: 'var(--font-sans)',
                                lineHeight: 1,
                                color: 'var(--color-accent)',
                                marginBottom: '0.75rem',
                                position: 'relative'
                            }}>
                                <AnimatedCounter target={stat.target} suffix={stat.suffix} duration={2.5} />
                                {/* Glow underline */}
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    background: 'var(--color-accent)',
                                    margin: '0.75rem auto 0',
                                    boxShadow: '0 0 10px rgba(57,255,20,0.3)',
                                    opacity: 0.6
                                }} />
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                letterSpacing: '0.2em',
                                color: 'var(--color-text-secondary)',
                                marginTop: '0.75rem'
                            }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ===== PORTFOLIO — Pinterest Grid ===== */}
            <section id="work">
                <PinterestWorkGrid />
            </section>

            {/* ===== SERVICES — "What We Obsess Over" ===== */}
            <section id="services" style={{
                padding: 'clamp(4rem, 12vw, 8rem) clamp(1rem, 5vw, 2rem)',
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <div className="section-label" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <span style={{ color: 'var(--color-accent)', opacity: 1 }}>02</span>
                            &#8212; CAPABILITIES
                            <span style={{ flex: 1, height: '1px', backgroundColor: 'currentColor', opacity: 0.3, display: 'block' }} />
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-display)',
                            lineHeight: 1,
                            textTransform: 'uppercase',
                            color: 'var(--color-text)'
                        }}>
                            WHAT WE <span style={{ color: 'var(--color-accent)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, textTransform: 'lowercase' }}>obsess</span> OVER
                        </h2>
                        <p style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            maxWidth: '550px',
                            fontFamily: 'var(--font-mono)',
                            marginTop: '1rem'
                        }}>
                            Every pixel, every frame, every line of code — crafted with the precision your brand deserves. No shortcuts. No templates.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        textAlign: 'left'
                    }}>
                        {servicesData.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="hero-services-peek-item glow-border"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    padding: '2.5rem 2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '300px',
                                    cursor: 'default',
                                    borderLeft: '3px solid transparent',
                                    transition: 'border-left-color 0.4s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderLeftColor = 'var(--color-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderLeftColor = 'transparent';
                                }}
                            >
                                <img 
                                    src={service.gif} 
                                    alt="" 
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0, width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        opacity: 0.08,
                                        zIndex: 0
                                    }}
                                />
                                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Service number */}
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.6rem',
                                        color: 'var(--color-accent)',
                                        letterSpacing: '0.2em',
                                        marginBottom: '1rem',
                                        opacity: 0.7
                                    }}>
                                        SERVICE_0{index + 1}
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '1rem',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 900,
                                        color: 'var(--color-accent)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {service.title}
                                    </h3>
                                    <p style={{
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '1rem',
                                        lineHeight: 1.7,
                                        marginBottom: '2rem',
                                        flexGrow: 1
                                    }}>
                                        {service.desc}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {service.tags.map(tag => (
                                            <span key={tag} style={{
                                                fontSize: '0.6rem',
                                                fontFamily: 'var(--font-mono)',
                                                padding: '0.3rem 0.6rem',
                                                backgroundColor: 'rgba(57,255,20,0.05)',
                                                color: 'var(--color-text)',
                                                fontWeight: 'bold',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* CTA arrow */}
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'var(--color-text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        opacity: 0.5,
                                        transition: 'opacity 0.3s, color 0.3s'
                                    }}>
                                        EXPLORE →
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <Link to="/get-in-touch" className="skeuo-button" style={{ fontSize: '1.1rem' }}>
                            LET'S BUILD TOGETHER
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== PROCESS — Infographic Pipeline ===== */}
            <InfographicProcess />

            <Testimonials />
            
            <div id="faq">
                <PricingFAQ />
            </div>

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
                        <a href="/get-in-touch" className="skeuo-button" style={{ 
                            fontSize: '1.3rem', 
                            padding: '1.5rem 4rem',
                            border: '2px solid var(--color-accent)',
                            boxShadow: '0 0 15px rgba(255,59,48,0.3), var(--shadow-raised)'
                        }}>
                            LET'S TALK — IT'S FREE →
                        </a>

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
