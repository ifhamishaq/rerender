import React from 'react';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#121212',
            color: '#FFFFFF',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)'
        }}>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(5rem, 20vw, 15rem)',
                    lineHeight: 0.8,
                    margin: 0,
                    color: 'var(--color-accent)',
                    fontWeight: 900
                }}
            >
                404
            </motion.h1>
            <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    fontSize: 'clamp(1rem, 3vw, 2rem)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    fontWeight: 900
                }}
            >
                Reality Not Found
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.4 }}
                style={{ maxWidth: '400px', marginBottom: '3rem', fontSize: '0.8rem', lineHeight: 1.6 }}
            >
                The page you are looking for has been glitch-shifted into the void or never existed.
            </motion.p>
            <a href="/" style={{
                padding: '1rem 3rem',
                backgroundColor: 'var(--color-text)',
                color: 'var(--color-bg)',
                fontWeight: 900,
                textDecoration: 'none',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em'
            }}>
                RETURN_TO_BASE
            </a>
        </div>
    );
};

export default NotFound;
