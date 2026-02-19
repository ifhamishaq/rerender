import React from 'react';
import { motion } from 'framer-motion';

const CTA = () => {
    return (
        <section style={{
            padding: '8rem 2rem',
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderTop: '1px solid var(--color-accent)'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <h2 style={{
                    fontSize: 'clamp(3rem, 6vw, 8rem)',
                    lineHeight: 0.8,
                    marginBottom: '2rem',
                    color: 'var(--color-accent)'
                }}>
                    CREATE.<br />DISRUPT.<br />REPEAT.
                </h2>

                <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    lineHeight: 1.6
                }}>
                    Join the underground. Get exclusive drops, tutorials, and early access to new tools.
                </p>
            </motion.div>
        </section>
    );
};

export default CTA;
