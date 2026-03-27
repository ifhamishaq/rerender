import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth();

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
            onClose();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="auth-overlay" style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem'
            }} onClick={onClose}>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="auth-container"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%', maxWidth: '440px',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        padding: '4rem 3rem',
                        position: 'relative',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '1.5rem', left: '1.5rem',
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', 
                        letterSpacing: '0.15em', opacity: 0.4, textTransform: 'uppercase'
                    }}>
                        Re-Render Studio
                    </div>

                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            background: 'none', border: 'none', color: 'var(--color-text)',
                            cursor: 'pointer', opacity: 0.3, fontSize: '0.8rem'
                        }}
                    >
                        ✕
                    </button>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '3rem', 
                            fontWeight: 400,
                            fontStyle: 'italic',
                            marginBottom: '0.75rem', 
                            color: 'var(--color-text)', 
                            lineHeight: 1,
                            letterSpacing: '-0.02em'
                        }}>
                            Studio Access
                        </h2>
                        <p style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-sans)',
                            opacity: 0.8
                        }}>
                            Sign in with Google to access your creative dashboard.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            style={{
                                backgroundColor: 'var(--color-text)', 
                                color: 'var(--color-bg)',
                                padding: '1.25rem',
                                fontFamily: 'var(--font-sans)', 
                                fontWeight: 700,
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'center', 
                                gap: '1.5rem', 
                                fontSize: '1rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {loading ? 'Connecting...' : 'Continue with Google'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ 
                            marginTop: '2rem', 
                            padding: '1rem', 
                            border: '1px solid rgba(255,0,0,0.2)', 
                            color: '#ff4444', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.7rem', 
                            backgroundColor: 'rgba(255,0,0,0.05)', 
                            textAlign: 'left' 
                        }}>
                            Error: {error}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
;
};

export default AuthModal;
