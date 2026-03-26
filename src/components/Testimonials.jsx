import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import testimonials from '../data/testimonials.json';

const Testimonials = () => {
    const scrollerRef = useRef(null);

    return (
        <section id="testimonials" style={{
            padding: '8rem 0',
            backgroundColor: 'var(--color-bg)',
            overflow: 'hidden',
            borderBottom: '1px solid var(--color-border)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', marginBottom: '4rem' }}>
                <div className="section-label">04 — SOCIAL PROOF</div>
                <h2 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    lineHeight: 1
                }}>
                    TRUSTED BY <br />
                    <span style={{ color: 'var(--color-accent)' }}>CREATIVES.</span>
                </h2>
            </div>

            <div style={{ 
                overflow: 'hidden',
                width: '100%'
            }}>
                <motion.div 
                    animate={{ x: [0, -1728] }} // 4 items at 400px + 2rem (32px) gap each
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{ 
                        display: 'flex', 
                        gap: '2rem', 
                        padding: '0 2rem',
                        width: 'max-content'
                    }}
                >
                    {/* Triple the list to ensure no white space on loop */}
                    {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            style={{
                                width: '400px',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                flexShrink: 0,
                                transition: 'transform 0.3s ease',
                                cursor: 'default'
                            }}
                        >
                            <div style={{ fontSize: '1.1rem', lineHeight: 1.6, fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.9 }}>
                                "{t.content}"
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    overflow: 'hidden', 
                                    border: '1px solid var(--color-accent)' 
                                }}>
                                    <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>
                                        {t.name}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                                        {t.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
