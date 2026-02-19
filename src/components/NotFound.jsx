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
            <h1 style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(5rem, 15vw, 12rem)',
                lineHeight: 0.8,
                margin: 0,
                color: 'var(--color-accent)'
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: 'clamp(1rem, 3vw, 2rem)',
                marginBottom: '2rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em'
            }}>
                Reality Not Found
            </h2>
            <p style={{ maxWidth: '400px', marginBottom: '3rem', color: '#888' }}>
                The page you are looking for has been glitch-shifted into the void or never existed.
            </p>
            <a href="/" style={{
                padding: '1rem 3rem',
                backgroundColor: '#FFFFFF',
                color: '#121212',
                fontWeight: 'bold',
                textDecoration: 'none',
                textTransform: 'uppercase'
            }}>
                Return to Base
            </a>
        </div>
    );
};

export default NotFound;
