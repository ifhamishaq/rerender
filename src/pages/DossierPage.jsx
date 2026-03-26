import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, History, ExternalLink, Shield, Check, X, Clock, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';

const DossierPage = () => {
    const { user, profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

    // Manual Top-up Form State
    const [topupAmount, setTopupAmount] = useState(10);
    const [txId, setTxId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const PAYPAL_LINK = "https://www.paypal.com/paypalme/ImadWani96";

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        setLoading(true);
        // Fetch Top-up Requests
        const { data: reqData } = await supabase
            .from('topup_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        // Fetch Generation History (Assume we track this in a 'history' table later, for now empty)
        // const { data: histData } = await supabase.from('history').select('*').eq('user_id', user.id);
        
        if (reqData) setRequests(reqData);
        setLoading(false);
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.from('topup_requests').insert([
                { 
                    user_id: user.id, 
                    amount: parseInt(topupAmount), 
                    transaction_id: txId,
                    status: 'pending'
                }
            ]);
            if (error) throw error;
            alert('Request submitted! Admin will verify and add credits soon.');
            setIsTopUpModalOpen(false);
            fetchUserData();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', gap: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>ACCESS_DENIED</h1>
            <Link to="/" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>← RETURN_TO_HOME</Link>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', padding: '120px 2rem 4rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>USER_DOSSIER // CONFIDENTIAL</div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900, lineHeight: 0.8, textTransform: 'uppercase' }}>
                            {profile?.full_name?.split(' ')[0] || 'AGENT'}<br />
                            <span style={{ color: 'var(--color-accent)' }}>OPERATIVE</span>
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.5rem' }}>COMPUTE_BALANCE</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{profile?.credits || 0} <span style={{ fontSize: '1rem', color: 'var(--color-accent)' }}>CR</span></div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '4rem' }}>
                    {/* Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button onClick={() => setActiveTab('overview')} style={tabStyle(activeTab === 'overview')}>[01] OVERVIEW</button>
                        <button onClick={() => setActiveTab('billing')} style={tabStyle(activeTab === 'billing')}>[02] COMPUTE_HUB</button>
                        <button onClick={() => setActiveTab('history')} style={tabStyle(activeTab === 'history')}>[03] OPERATION_LOGS</button>
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                            <button onClick={signOut} style={{ ...tabStyle(false), color: 'red', border: 'none' }}>TERMINATE_SESSION</button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main>
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <Shield size={20} color="var(--color-accent)" />
                                        <h3 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>PROFILE_SECURITY</h3>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                                        ID: {user.id.substring(0, 12)}...<br />
                                        STATUS: ACTIVE<br />
                                        CLEARANCE: LEVEL_1<br />
                                        EMAIL: {user.email}
                                    </div>
                                </div>
                                <div style={cardStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <Wallet size={20} color="var(--color-accent)" />
                                        <h3 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>WALLET_SUMMARY</h3>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1.5rem' }}>Top up your compute power to continue using neural processing tools.</p>
                                    <button onClick={() => setIsTopUpModalOpen(true)} style={actionButtonStyle}>REQUEST_CREDITS</button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'billing' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div style={{ ...cardStyle, marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>ACTIVE_REQUESTS</h3>
                                    {requests.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {requests.map(req => (
                                                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                                    <div>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>{req.amount} CREDITS</div>
                                                        <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>{new Date(req.created_at).toLocaleDateString()} // {req.transaction_id}</div>
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '0.6rem', padding: '0.3rem 0.6rem', 
                                                        backgroundColor: req.status === 'pending' ? 'orange' : req.status === 'approved' ? 'var(--color-accent)' : 'red',
                                                        color: '#000', fontWeight: 900
                                                    }}>
                                                        {req.status.toUpperCase()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3, fontSize: '0.75rem' }}>NO_PENDING_REQUESTS</div>
                                    )}
                                </div>
                                <button onClick={() => setIsTopUpModalOpen(true)} style={actionButtonStyle}>NEW_TOPUP_REQUEST</button>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div style={cardStyle}>
                                    <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                                        <History size={48} style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>LOGS_ENCRYPTED_OR_EMPTY</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>

            {/* Top-up Modal */}
            <AnimatePresence>
                {isTopUpModalOpen && (
                    <div style={modalOverlayStyle} onClick={() => setIsTopUpModalOpen(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            style={modalStyle} onClick={e => e.stopPropagation()}
                        >
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1.5rem' }}>CREDIT_REQUEST</h2>
                            
                            <div style={{ backgroundColor: 'rgba(57,255,20,0.05)', border: '1px solid var(--color-accent)', padding: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>STEP_1: SEND_FUNDS</div>
                                <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Send your payment via PayPal to:</div>
                                <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 900, fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    PAYPAL.ME/ImadWani96 <ExternalLink size={16} />
                                </a>
                            </div>

                            <form onSubmit={handleTopUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>SELECT_PACKAGE</label>
                                    <select value={topupAmount} onChange={e => setTopupAmount(e.target.value)} style={inputStyle}>
                                        <option value="10">10 CREDITS ($1)</option>
                                        <option value="50">50 CREDITS ($5)</option>
                                        <option value="120">120 CREDITS ($10) [BONUS]</option>
                                        <option value="300">300 CREDITS ($25) [ELITE]</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>TRANSACTION_ID / PAYPAL_EMAIL</label>
                                    <input type="text" required value={txId} onChange={e => setTxId(e.target.value)} placeholder="Enter transaction info..." style={inputStyle} />
                                </div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.5, lineHeight: 1.5 }}>
                                    * Admin will verify the transaction and update your balance within 2-24 hours.
                                </div>
                                <button type="submit" disabled={submitting} style={actionButtonStyle}>
                                    {submitting ? 'SUBMITTING...' : 'SUBMIT_REQUEST'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const tabStyle = (active) => ({
    padding: '1rem',
    textAlign: 'left',
    backgroundColor: active ? 'var(--color-accent)' : 'transparent',
    color: active ? '#000' : 'var(--color-text)',
    border: '1px solid ' + (active ? 'var(--color-accent)' : 'var(--color-border)'),
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 900,
    cursor: 'pointer',
    transition: 'all 0.2s'
});

const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '2rem',
    transition: 'all 0.3s'
};

const actionButtonStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'var(--color-text)',
    color: 'var(--color-bg)',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontWeight: 900,
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const modalOverlayStyle = {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 20000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem'
};

const modalStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    padding: '3rem',
    maxWidth: '500px', width: '100%',
    position: 'relative',
    boxShadow: '15px 15px 0px var(--color-accent)'
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
    outline: 'none'
};

const labelStyle = {
    display: 'block',
    fontSize: '0.6rem',
    fontFamily: 'var(--font-mono)',
    marginBottom: '0.5rem',
    opacity: 0.5
};

export default DossierPage;
