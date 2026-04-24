import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Wallet, Briefcase, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const ProfilePage = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [rechargeHistory, setRechargeHistory] = React.useState([]);
    const [usageLogs, setUsageLogs] = React.useState([]);
    const [loadingHistory, setLoadingHistory] = React.useState(true);

    React.useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            // 1. Fetch Recharge History
            const { data: recharges } = await supabase
                .from('topup_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            // 2. Fetch Credit Logs (Usage/Rewards)
            const { data: logs } = await supabase
                .from('credit_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (recharges) setRechargeHistory(recharges);
            if (logs) setUsageLogs(logs);
        } catch (err) {
            console.error('History Fetch Error:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!user) return <Navigate to="/" replace />;

    const glassStyle = {
        background: 'var(--color-surface)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid var(--color-border)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: 'var(--shadow-raised)',
    };

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            padding: '120px 2rem 100px',
            backgroundImage: 'radial-gradient(circle at 50% -20%, var(--color-surface) 0%, var(--color-bg) 70%)',
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Profile Header */}
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 style={{ 
                            fontSize: 'clamp(2.5rem, 8vw, 4rem)', 
                            fontWeight: 900, 
                            letterSpacing: '-0.04em',
                            margin: 0,
                            fontFamily: 'var(--font-display)',
                            lineHeight: 0.9
                        }}>
                            {profile?.full_name || 'STUDIO_OPERATIVE'}
                        </h1>
                        <p style={{ opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '1rem' }}>
                            {user.email} // SESSION_ACTIVE
                        </p>
                    </motion.div>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {isAdmin && (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/admin')}
                                style={{
                                    background: 'var(--color-accent)',
                                    border: 'none',
                                    color: '#000',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '100px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 15px rgba(57, 255, 20, 0.3)'
                                }}
                            >
                                <Shield size={14} /> ADMIN_PORTAL
                            </motion.button>
                        )}
                        
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
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    
                    {/* Left Column: Wallet & Credits */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <motion.div 
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            style={glassStyle}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <Wallet size={24} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5 }}>COMPUTE_WALLET</span>
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em' }}>
                                {profile?.credits || 0} <span style={{ fontSize: '1rem', opacity: 0.5 }}>CR</span>
                            </div>
                            <button 
                                onClick={() => navigate('/recharge')}
                                style={{
                                    marginTop: '2rem',
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--color-text)',
                                    color: 'var(--color-bg)',
                                    borderRadius: '12px',
                                    fontWeight: 900,
                                    fontSize: '0.8rem',
                                    fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer'
                                }}
                            >
                                TOPUP_COMPUTE
                            </button>
                        </motion.div>

                        <motion.div 
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            style={{ ...glassStyle, padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '12px', 
                                    background: profile?.is_pro ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Shield size={20} color={profile?.is_pro ? '#000' : 'rgba(255,255,255,0.2)'} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{profile?.is_pro ? 'PRO_OPERATIVE' : 'BASIC_PLAN'}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{profile?.is_pro ? 'LIFETIME_LICENSE' : 'COMMUNITY_ACCESS'}</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Activity Ledger */}
                    <motion.div 
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        style={{ ...glassStyle, flex: 1 }}
                    >
                        <h3 style={{ fontSize: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={18} /> ACTIVITY_LEDGER
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {loadingHistory ? (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>[SYNCING_LEDGER...]</div>
                            ) : (
                                <>
                                    {usageLogs.length === 0 && rechargeHistory.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>[NO_DATA_AVAILABLE]</div>
                                    ) : (
                                        <>
                                            {/* Merged Timeline logic could go here, for now split */}
                                            {usageLogs.slice(0, 5).map((log, i) => (
                                                <div key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{log.reason || 'RENDER_EXPENSE'}</div>
                                                        <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>{new Date(log.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                    <div style={{ color: log.amount > 0 ? 'var(--color-accent)' : '#ff4444', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                                                        {log.amount > 0 ? '+' : ''}{log.amount}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Studio Point Links */}
                <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link to="/work" style={{ ...glassStyle, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>THE_ARCHIVE</span>
                        <ChevronRight size={16} opacity={0.3} />
                    </Link>
                    <Link to="/tools" style={{ ...glassStyle, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>STUDIO_TOOLS</span>
                        <ChevronRight size={16} opacity={0.3} />
                    </Link>
                    <Link to="/careers" style={{ ...glassStyle, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>JOIN_TEAM</span>
                        <ChevronRight size={16} opacity={0.3} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
