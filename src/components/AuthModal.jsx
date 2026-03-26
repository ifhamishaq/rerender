import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isEmailMode, setIsEmailMode] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle, signIn, signUp } = useAuth();

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password, fullName);
                if (error) throw error;
                alert('Verification email sent! Please check your inbox.');
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="auth-overlay" style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                backdropFilter: 'blur(20px)',
                zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem'
            }} onClick={onClose}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="auth-container"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%', maxWidth: '450px',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        padding: '4rem 3rem',
                        position: 'relative',
                        boxShadow: '20px 20px 0px var(--color-accent)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '1.5rem', left: '1.5rem',
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.5
                    }}>
                        SECURE_ACCESS_NODE // v2.1.H
                    </div>

                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            background: 'none', border: 'none', color: 'var(--color-text)',
                            cursor: 'pointer', opacity: 0.5
                        }}
                    >
                        [ESC]
                    </button>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '2.5rem', fontWeight: 900,
                            marginBottom: '0.5rem', textTransform: 'uppercase',
                            color: 'var(--color-text)', lineHeight: 0.9
                        }}>
                            SYSTEM<br /><span style={{ color: 'var(--color-accent)' }}>ACCESS</span>
                        </h2>
                    </div>

                    {!isEmailMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <button 
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                style={{
                                    backgroundColor: 'var(--color-text)', color: 'var(--color-bg)',
                                    border: '1px solid var(--color-text)', padding: '1.25rem',
                                    fontFamily: 'var(--font-mono)', fontWeight: 900,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '1rem', fontSize: '0.85rem'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                {loading ? 'CONNECTING...' : 'CONTINUE_WITH_GOOGLE'}
                            </button>
                            <button 
                                onClick={() => setIsEmailMode(true)}
                                style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                                USE_EMAIL_PROTOCOL
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                            {!isLogin && (
                                <div>
                                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.4rem', opacity: 0.5 }}>NAME</label>
                                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.8rem', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }} />
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.4rem', opacity: 0.5 }}>EMAIL</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.8rem', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.4rem', opacity: 0.5 }}>PASSWORD</label>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.8rem', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }} />
                            </div>
                            <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none', padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900, cursor: 'pointer', marginTop: '0.5rem' }}>
                                {loading ? 'PROCESSING...' : (isLogin ? 'GRANT_ACCESS' : 'INITIALIZE_PROFILE')}
                            </button>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.5, fontSize: '0.65rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', textDecoration: 'underline' }}>
                                    {isLogin ? 'CREATE_ACCOUNT' : 'EXISTING_CREDENTIALS'}
                                </button>
                                <button type="button" onClick={() => setIsEmailMode(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.5, fontSize: '0.65rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                                    ← BACK
                                </button>
                            </div>
                        </form>
                    )}

                    {error && (
                        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', backgroundColor: 'rgba(57,255,20,0.05)', textAlign: 'left' }}>
                            ERR: {error.toUpperCase()}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
