import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import testimonials from '../data/testimonials.json';

const StarRating = ({ rating = 5 }) => (
    <div className="star-rating" style={{ marginBottom: '12px' }}>
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </div>
);

const VerifiedBadge = () => (
    <span className="verified-badge">
        <Check size={10} strokeWidth={3} />
        VERIFIED CLIENT
    </span>
);

const Testimonials = () => {
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
                    DON'T TAKE <br />
                    <span style={{ color: 'var(--color-accent)' }}>OUR WORD FOR IT.</span>
                </h2>
                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '1.5rem',
                    maxWidth: '500px',
                    lineHeight: 1.7
                }}>
                    Every client we've worked with has come back for more. Here's why they can't stop recommending us.
                </p>
            </div>

            <div style={{ 
                overflow: 'hidden',
                width: '100%'
            }}>
                <motion.div 
                    animate={{ x: [0, -1728] }}
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
                    {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className="glass-card glow-border"
                            style={{
                                width: '420px',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                flexShrink: 0,
                                position: 'relative',
                                cursor: 'default'
                            }}
                        >
                            {/* Giant decorative quote mark */}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1.5rem',
                                fontSize: '6rem',
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--color-accent)',
                                opacity: 0.08,
                                lineHeight: 1,
                                pointerEvents: 'none'
                            }}>
                                "
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <StarRating rating={5} />
                                <VerifiedBadge />
                            </div>

                            <div style={{ 
                                fontSize: '1.1rem', 
                                lineHeight: 1.7, 
                                fontFamily: 'var(--font-serif)', 
                                fontStyle: 'italic', 
                                opacity: 0.9,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                "{t.content}"
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                <div style={{ 
                                    width: '44px', 
                                    height: '44px', 
                                    borderRadius: '50%', 
                                    overflow: 'hidden', 
                                    border: '2px solid var(--color-accent)',
                                    flexShrink: 0
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
