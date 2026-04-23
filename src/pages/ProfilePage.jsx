import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Wallet, Briefcase, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user, profile, signOut } = useAuth();

    if (!user) return <Navigate to="/" replace />;

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '2rem',
    };

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            padding: '120px 2rem 100px',
            backgroundImage: 'radial-gradient(circle at 50% -20%, #1a1a1a 0%, #000 70%)',
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Profile Header */}
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 style={{ 
                            fontSize: '3.5rem', 
                            fontWeight: 900, 
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontFamily: 'var(--font-display)'
                        }}>
                            {profile?.full_name || 'STUDIO_OPERATIVE'}
                        </h1>
                        <p style={{ opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            {user.email} // SESSION_ACTIVE
                        </p>
                    </motion.div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={signOut}
                        style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.2)',
                            color: '#ff4444',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '100px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <LogOut size={14} /> SIGN_OUT
                    </motion.button>
                </header>

                {/* Dashboard Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Credits Card */}
                    <motion.div 
                        variants={cardVariants} initial="initial" animate="animate"
                        transition={{ delay: 0.1 }}
                        style={glassStyle}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ p: '10px', background: 'rgba(57, 255, 20, 0.1)', borderRadius: '12px' }}>
                                <Wallet size={24} color="var(--color-accent)" />
                            </div>
                            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.4 }}>LEDGER_STATUS</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                            {profile?.credits || 0}<span style={{ fontSize: '1rem', marginLeft: '0.5rem', opacity: 0.5 }}>CR</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Available compute for studio resources.</p>
                        <Link to="/dossier" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                            RECHARGE_BALANCE <ChevronRight size={14} />
                        </Link>
                    </motion.div>

                    {/* Applications and Security Cards Removed by request */}

                </div>

                {/* Bottom Section: Studio Access */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: '4rem', padding: '3rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px', textAlign: 'center' }}
                >
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Studio Access Points</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                        {[
                            { label: 'MY_PROJECTS', to: '/work' },
                            { label: 'CREATIVE_LAB', to: '/ai-lab' },
                            { label: 'SUPPORT_TICKETS', to: '/get-in-touch' }
                        ].map(link => (
                            <Link key={link.label} to={link.to} style={{
                                padding: '1rem 2rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ProfilePage;
