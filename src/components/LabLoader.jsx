import React from 'react';
import { motion } from 'framer-motion';

const LabLoader = ({ label = "[ SYNTHESIZING_ASSET_V1 ]" }) => {
    const pixels = Array.from({ length: 16 });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                width: '60px',
                height: '60px'
            }}>
                {pixels.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: [0.1, 1, 0.1] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                        style={{
                            backgroundColor: 'var(--color-text)',
                            borderRadius: '4px',
                        }}
                    />
                ))}
            </div>
            <div style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.2em',
                color: 'var(--color-text)',
                fontWeight: 900,
                textAlign: 'center'
            }}>
                {label.toUpperCase()}
            </div>
        </div>
    );
};

export default LabLoader;
