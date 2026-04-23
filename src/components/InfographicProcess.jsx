import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const InfographicProcess = () => {
    const { isDarkMode } = useTheme();

    const steps = [
        {
            title: "DISCOVERY",
            desc: "Aligning on vision, KPIs, and deliverables.",
            icon: "01",
            stat: "+150% Clarity"
        },
        {
            title: "IDEATION & DESIGN",
            desc: "Crafting the visual identity and structural flow.",
            icon: "02",
            stat: "Unlimited Iterations"
        },
        {
            title: "DEVELOPMENT / RENDER",
            desc: "Bringing the vision to life with pixel perfection.",
            icon: "03",
            stat: "0.1s Load Times"
        },
        {
            title: "DELIVERY & SCALING",
            desc: "Handing over the keys, ready for client acquisition.",
            icon: "04",
            stat: "3x ROI Average"
        }
    ];

    return (
        <section id="process" style={{
            padding: '8rem 2rem',
            backgroundColor: 'var(--color-bg)',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <div style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.75rem', 
                        letterSpacing: '0.2em', 
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '1rem'
                    }}>
                        Proven ROI Pipeline
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: 'var(--color-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em'
                    }}>
                        HOW WE DRIVE <br/>
                        <span style={{ color: 'var(--color-text-secondary)' }}>RESULTS</span>
                    </h2>
                </div>

                {/* Pipeline Container */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    position: 'relative'
                }}>
                    {/* Connecting Line (Desktop) */}
                    <div className="desktop-only" style={{
                        position: 'absolute',
                        top: '40px',
                        left: '10%',
                        right: '10%',
                        height: '2px',
                        background: 'var(--color-border)',
                        zIndex: 0
                    }} />

                    {/* Progress Line (Animated) */}
                    <motion.div className="desktop-only" 
                        initial={{ width: 0 }}
                        whileInView={{ width: '80%' }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            top: '40px',
                            left: '10%',
                            height: '2px',
                            background: 'var(--color-text)',
                            zIndex: 1
                    }} />

                    {steps.map((step, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            {/* Step Node */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-surface)',
                                border: '2px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                color: 'var(--color-text)',
                                marginBottom: '2rem',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
                            }}>
                                {step.icon}
                            </div>

                            {/* Trust Stat Card */}
                            <div style={{
                                backgroundColor: 'var(--color-text)',
                                color: 'var(--color-bg)',
                                padding: '0.4rem 1rem',
                                borderRadius: '100px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginBottom: '1.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                {step.stat}
                            </div>

                            {/* Content */}
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 900,
                                marginBottom: '0.75rem',
                                color: 'var(--color-text)'
                            }}>
                                {step.title}
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
                                maxWidth: '280px'
                            }}>
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InfographicProcess;
