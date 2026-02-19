import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
    const features = [
        { title: "DRAG_&_DROP", desc: "No plugins needed. Just drag assets onto your timeline." },
        { title: "4K_RESOLUTION", desc: "All textures and effects are mastered in 4K for maximum detail." },
        { title: "CROSS_PLATFORM", desc: "Compatible with Premiere, After Effects, DaVinci, and Final Cut." },
        { title: "ROYALTY_FREE", desc: "Use in unlimited personal and commercial projects." },
    ];

    return (
        <div style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '4rem', textTransform: 'uppercase', lineHeight: 0.9 }}>
                SYSTEM<br />FEATURES
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        style={{ borderTop: '1px solid var(--color-text)', paddingTop: '1rem' }}
                    >
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', marginBottom: '1rem' }}>{f.title}</h3>
                        <p style={{ fontFamily: 'var(--font-mono)', color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                <a href="/#shop" style={{
                    display: 'inline-block',
                    padding: '1rem 3rem',
                    backgroundColor: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    textTransform: 'uppercase'
                }}>
                    Start Creating
                </a>
            </div>
        </div>
    );
};

export default Features;
