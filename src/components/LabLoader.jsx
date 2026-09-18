import React from 'react';
import { motion } from 'framer-motion';

const LabLoader = ({ label = "Synthesizing content...", accentColor = 'var(--color-accent)' }) => {
    const pixels = Array.from({ length: 16 });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '3rem 1rem' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                width: '56px',
                height: '56px'
            }}>
                {pixels.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.15 }}
                        animate={{ opacity: [0.15, 1, 0.15], scale: [0.95, 1.05, 0.95] }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            delay: i * 0.08,
                            ease: "easeInOut"
                        }}
                        style={{
                            backgroundColor: accentColor,
                            borderRadius: '4px',
                            boxShadow: `0 0 10px color-mix(in srgb, ${accentColor} 30%, transparent)`
                        }}
                    />
                ))}
            </div>
            <div style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
                textAlign: 'center'
            }}>
                {label}
            </div>
        </div>
    );
};

export default LabLoader;
