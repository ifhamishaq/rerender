import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wallet, ExternalLink, Activity, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDossier } from '../hooks/useDossier';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const DossierPage = () => {
    const { user, profile, loading: authLoading, setIsAuthModalOpen, signOut } = useAuth();
    const { requests, logs, loading, submitting, submitRequest } = useDossier();
    const [userApplications, setUserApplications] = useState([]);
    const [appsLoading, setAppsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true);
        }
    }, [user, authLoading, setIsAuthModalOpen]);

    const [txId, setTxId] = useState('');
    const [amount, setAmount] = useState(10);

    const PAYPAL_LINK = "https://www.paypal.com/paypalme/ImadWani96";

    useEffect(() => {
        if (user) {
            fetchUserApplications();
            fetchUserPayouts();
            fetchUserPayments();
        }
    }, [user]);

    const [userPayouts, setUserPayouts] = useState([]);
    const [payoutsLoading, setPayoutsLoading] = useState(true);

    const [userPayments, setUserPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(true);

    const fetchUserApplications = async () => {
        const { data } = await supabase
            .from('career_applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (data) setUserApplications(data);
        setAppsLoading(false);
    };

    const fetchUserPayouts = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('payout_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (data) setUserPayouts(data);
        setPayoutsLoading(false);
    };

    const fetchUserPayments = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('freelancer_payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (data) setUserPayments(data);
        setPaymentsLoading(false);
    };

    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState(150);
    const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

    const handleRequestPayout = async () => {
        if (payoutAmount < 150) return alert('MINIMUM_PAYOUT_THRESHOLD: $150');
        if (payoutAmount > (profile?.pay_balance || 0)) return alert('INSUFFICIENT_LEDGER_BALANCE');
        if (!profile?.freelancer_info?.payout_address) return alert('CONFIGURE_PAYMENT_NODE_FIRST');

        setIsSubmittingPayout(true);
        try {
            const { error } = await supabase.from('payout_requests').insert([{
                user_id: user.id,
                amount: payoutAmount,
                payout_method: profile.freelancer_info.payout_method,
                payout_address: profile.freelancer_info.payout_address
            }]);
            if (error) throw error;
            setIsPayoutModalOpen(false);
            alert('WITHDRAWAL_REQUEST_TRANSMITTED');
            fetchUserPayouts();
        } catch (err) {
            alert('Transmission Failed: ' + err.message);
        } finally {
            setIsSubmittingPayout(false);
        }
    };

    const handleSubmit = async (e) => {
        // ... (existing submit logic)
        e.preventDefault();
        try {
            await submitRequest(amount, txId);
            setTxId('');
            alert('Support Request Delivered. Verifying...');
        } catch (err) {
            alert('Transmission Failed: ' + err.message);
        }
    };

    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [setupData, setSetupData] = useState({
        payout_method: 'PayPal',
        payout_address: '',
        skills: '',
        availability: 'Full-time'
    });
    const [isSavingSetup, setIsSavingSetup] = useState(false);

    const handleSaveSetup = async () => {
        setIsSavingSetup(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ freelancer_info: setupData })
                .eq('id', user.id);
            
            if (error) throw error;
            setIsSetupOpen(false);
            alert('FREELANCER_NODE_CONFIGURED');
            window.location.reload(); // Refresh to catch profile update
        } catch (err) {
            alert('Setup Failed: ' + err.message);
        } finally {
            setIsSavingSetup(false);
        }
    };

    if (!user) return <Navigate to="/" replace />;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            padding: '120px 2rem 4rem',
            fontFamily: 'var(--font-sans)'
        }}>
            {/* Setup Modal */}
            <AnimatePresence>
                {isSetupOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                        <motion.div 
                            initial={{ y: 20 }} animate={{ y: 0 }}
                            style={{ background: '#111', border: '1px solid var(--color-accent)', padding: '3rem', width: '100%', maxWidth: '600px', position: 'relative' }}
                        >
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', color: 'var(--color-accent)', marginBottom: '2rem' }}>Node_Configuration</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={minimalLabelStyle}>PAYOUT_GATEWAY</label>
                                    <select 
                                        value={setupData.payout_method} 
                                        onChange={e => setSetupData({...setupData, payout_method: e.target.value})}
                                        style={minimalInputStyle}
                                    >
                                        <option value="PayPal">PayPal</option>
                                        <option value="UPI">UPI (India / Global)</option>
                                        <option value="Wise">Wise (Global)</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Crypto (USDT)">Crypto (USDT)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={minimalLabelStyle}>PAYOUT_ADDRESS / ACCOUNT</label>
                                    <input 
                                        type="text" 
                                        placeholder={
                                            setupData.payout_method === 'UPI' ? 'USERNAME@BANK' :
                                            setupData.payout_method === 'Wise' ? 'WISE_EMAIL_OR_ID' :
                                            setupData.payout_method === 'PayPal' ? 'PAYPAL_EMAIL' :
                                            setupData.payout_method === 'Bank Transfer' ? 'IBAN_/_SWIFT_DETAILS' :
                                            'WALLET_ADDRESS'
                                        }
                                        value={setupData.payout_address} 
                                        onChange={e => setSetupData({...setupData, payout_address: e.target.value})}
                                        style={minimalInputStyle} 
                                    />
                                </div>
                                <div>
                                    <label style={minimalLabelStyle}>SPECIALIZED_SKILLSET</label>
                                    <textarea 
                                        placeholder="AE_VFX, BLENDER_3D, WEB_ARCH..." 
                                        rows="3"
                                        value={setupData.skills} 
                                        onChange={e => setSetupData({...setupData, skills: e.target.value})}
                                        style={{...minimalInputStyle, resize: 'none'}} 
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button 
                                        onClick={handleSaveSetup} 
                                        disabled={isSavingSetup}
                                        style={{ flex: 1, padding: '1.25rem', background: 'var(--color-accent)', color: '#000', border: 'none', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                                    >
                                        {isSavingSetup ? 'SYNCING...' : 'ENCRYPT_&_SAVE'}
                                    </button>
                                    <button 
                                        onClick={() => setIsSetupOpen(false)} 
                                        style={{ padding: '1.25rem', background: 'transparent', border: '1px solid #444', color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                                    >
                                        ABORT
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payout Modal */}
            <AnimatePresence>
                {isPayoutModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                        <motion.div 
                            initial={{ y: 20 }} animate={{ y: 0 }}
                            style={{ background: '#111', border: '1px solid var(--color-accent)', padding: '3rem', width: '100%', maxWidth: '500px', position: 'relative' }}
                        >
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontStyle: 'italic', color: 'var(--color-accent)', marginBottom: '1.5rem' }}>Withdrawal_Node</h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem', fontFamily: 'var(--font-mono)' }}>MINIMUM_THRESHOLD: $150.00 USD</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={minimalLabelStyle}>WITHDRAWAL_AMOUNT ($)</label>
                                        <button 
                                            onClick={() => setPayoutAmount(profile?.pay_balance || 0)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900 }}
                                        >
                                            [SET_MAX]
                                        </button>
                                    </div>
                                    <input 
                                        type="number" min="150" step="10"
                                        value={payoutAmount} 
                                        onChange={e => setPayoutAmount(parseFloat(e.target.value))}
                                        style={minimalInputStyle} 
                                    />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', border: '1px solid #222', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.5rem', opacity: 0.4, marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>CURRENT_LEDGER</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>${(profile?.pay_balance || 0).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.5rem', opacity: 0.4, marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>REMAINING_POST_TX</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: (profile?.pay_balance - payoutAmount) < 0 ? '#ff4444' : 'var(--color-accent)' }}>
                                            ${((profile?.pay_balance || 0) - (payoutAmount || 0)).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ padding: '1rem', border: '1px solid #222', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>SENDING_TO:</div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{profile?.freelancer_info?.payout_method} // {profile?.freelancer_info?.payout_address}</div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button 
                                        onClick={handleRequestPayout} 
                                        disabled={isSubmittingPayout}
                                        style={{ flex: 1, padding: '1.25rem', background: 'var(--color-accent)', color: '#000', border: 'none', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                                    >
                                        {isSubmittingPayout ? 'TRANSMITTING...' : 'INITIATE_WITHDRAWAL'}
                                    </button>
                                    <button 
                                        onClick={() => setIsPayoutModalOpen(false)} 
                                        style={{ padding: '1.25rem', background: 'transparent', border: '1px solid #444', color: '#fff', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                                    >
                                        ABORT
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* ... (existing header) */}

                {/* Header Section / Masthead */}
                <header style={{
                    borderBottom: '4px solid var(--color-text)',
                    paddingBottom: '2rem',
                    marginBottom: '3rem',
                    display: 'flex',
                    flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth < 600 ? 'flex-start' : 'baseline',
                    gap: window.innerWidth < 600 ? '1.5rem' : '0'
                }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.2em',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '1rem'
                        }}>
                            VOL. 03 // ISSUE 2026 // RE-RENDER_EDITORIAL
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(3rem, 10vw, 6rem)',
                            fontWeight: 900,
                            margin: 0,
                            letterSpacing: '-0.05em',
                            lineHeight: 0.8,
                            fontFamily: 'var(--font-display)'
                        }}>
                            {profile?.full_name?.toUpperCase() || 'OPERATIVE'}<br />
                            <span style={{
                                fontFamily: 'Playfair Display',
                                fontStyle: 'italic',
                                fontWeight: 400,
                                color: 'var(--color-accent)'
                            }}>DOSSIER</span>
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '3rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                                AVAILABLE_COMPUTE
                            </div>
                            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                                {profile?.credits || 0}<span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>CR</span>
                            </div>
                        </div>
                        
                        {(profile?.role === 'freelancer' || profile?.role === 'admin') && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid #222', paddingLeft: '3rem' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-accent)' }}>
                                    PAYABLE_BALANCE
                                </div>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>
                                    ${profile?.pay_balance || '0.00'}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1fr 350px',
                    gap: '4rem'
                }}>

                    {/* Left: Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        
                        {/* Recruitment Status Section */}
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ height: '2px', flex: 1, background: 'var(--color-border)' }}></div>
                                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, opacity: 0.4 }}>RECRUITMENT_DOSSIERS</h2>
                                <div style={{ height: '2px', flex: 0.1, background: 'var(--color-border)' }}></div>
                            </div>
                            
                            {appsLoading ? (
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3 }}>[SYNCING_RECORDS...]</div>
                            ) : userApplications.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {userApplications.map(app => (
                                        <div key={app.id} style={{ 
                                            border: '1px solid #222', 
                                            padding: '1.5rem', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.01)'
                                        }}>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.3rem' }}>
                                                    {new Date(app.created_at).toLocaleDateString()} // REF: {app.id.slice(0,8).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{app.role_title}</div>
                                            </div>
                                            <div style={{ 
                                                fontFamily: 'var(--font-mono)', 
                                                fontSize: '0.7rem', 
                                                fontWeight: 900,
                                                padding: '0.4rem 1rem',
                                                border: '1px solid ' + (
                                                    app.status === 'ACCEPTED' ? 'var(--color-accent)' : 
                                                    app.status === 'REJECTED' ? '#ff4444' : 
                                                    app.status === 'REVIEWING' ? '#FFA500' : '#444'
                                                ),
                                                color: (
                                                    app.status === 'ACCEPTED' ? 'var(--color-accent)' : 
                                                    app.status === 'REJECTED' ? '#ff4444' : 
                                                    app.status === 'REVIEWING' ? '#FFA500' : '#888'
                                                )
                                            }}>
                                                {app.status.toUpperCase()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3, border: '1px dashed #222', padding: '2rem', textAlign: 'center' }}>
                                    NO_ACTIVE_RECRUITMENT_RECORDS_FOUND
                                </div>
                            )}
                        </section>

                        {/* Freelancer Console Section */}
                        {profile?.role === 'freelancer' && (
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ height: '2px', flex: 1, background: 'var(--color-accent)', opacity: 0.3 }}></div>
                                    <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-accent)' }}>FREELANCER_NODE</h2>
                                    <div style={{ height: '2px', flex: 0.1, background: 'var(--color-accent)', opacity: 0.3 }}></div>
                                </div>
                                <div style={{ border: '1px solid var(--color-accent)', padding: '2.5rem', backgroundColor: 'rgba(0, 255, 157, 0.02)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Profile_Onboarding</h3>
                                            <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>
                                                Complete your professional profile to qualify for advanced projects and automated hardware payouts.
                                            </p>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button 
                                                    onClick={() => setIsSetupOpen(true)}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid var(--color-accent)',
                                                        color: 'var(--color-accent)',
                                                        padding: '1rem 2rem',
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 900,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {profile?.freelancer_info?.payout_address ? 'RECONFIGURE_NODE' : 'INITIALIZE_SETUP_FLOW'}
                                                </button>
                                                
                                                {profile?.freelancer_info?.payout_address && (
                                                    <button 
                                                        onClick={() => {
                                                            setPayoutAmount(150);
                                                            setIsPayoutModalOpen(true);
                                                        }}
                                                        style={{
                                                            backgroundColor: 'var(--color-accent)',
                                                            border: 'none',
                                                            color: '#000',
                                                            padding: '1rem 2rem',
                                                            fontFamily: 'var(--font-mono)',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 900,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        WITHDRAW_FUNDS
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid rgba(0, 255, 157, 0.1)', paddingLeft: '3rem' }}>
                                            <div style={{ marginBottom: '2rem' }}>
                                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.5rem' }}>CURRENT_PAYOUT_METHOD</label>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                                                    {profile?.freelancer_info?.payout_method || 'NOT_CONFIGURED'}
                                                    {profile?.freelancer_info?.payout_address && (
                                                        <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginTop: '0.2rem' }}>
                                                            {profile.freelancer_info.payout_address}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.5rem' }}>WITHDRAWAL_HISTORY</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                                    {userPayouts.length > 0 ? userPayouts.map(p => (
                                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                                            <span style={{ opacity: 0.6 }}>{new Date(p.created_at).toLocaleDateString()}</span>
                                                            <span style={{ fontWeight: 900 }}>${p.amount}</span>
                                                            <span style={{ color: p.status === 'approved' ? 'var(--color-accent)' : '#888' }}>[{p.status.toUpperCase()}]</span>
                                                        </div>
                                                    )) : (
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3 }}>00_RECORDS</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Earnings Ledger Node */}
                                    <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(0, 255, 157, 0.1)', paddingTop: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                            <Wallet size={16} color="var(--color-accent)" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>EARNINGS_LEDGER</span>
                                        </div>
                                        
                                        {paymentsLoading ? (
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3 }}>DECRYPTING_TRANSACTION_VOLUMES...</div>
                                        ) : userPayments.length > 0 ? (
                                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                {userPayments.map(pay => (
                                                    <div key={pay.id} style={{ 
                                                        padding: '1rem', 
                                                        border: '1px solid rgba(0, 255, 157, 0.05)', 
                                                        backgroundColor: 'rgba(255,255,255,0.01)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>{pay.project_name}</div>
                                                            <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '0.2rem' }}>{new Date(pay.created_at).toLocaleString()} // SEQ_{pay.id.slice(0,4)}</div>
                                                        </div>
                                                        <div style={{ color: 'var(--color-accent)', fontWeight: 900, fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                                                            +${pay.amount}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3, border: '1px dashed #222', padding: '1.5rem', textAlign: 'center' }}>
                                                NO_COMPLETED_PROJECTS_INDEXED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Recharge Section (Apple Style) */}
                        <section>
                            <div style={{ 
                                background: 'var(--color-surface)', 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '24px', 
                                padding: '3rem', 
                                boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Recharge Balance</h2>
                                    <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Select a credit pack to top up your account.</p>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(5, 1fr)',
                                    gap: '1rem',
                                    marginBottom: '3rem'
                                }}>
                                    {[
                                        { val: 10, label: '10 CR', price: '$1' },
                                        { val: 50, label: '50 CR', price: '$5', popular: true },
                                        { val: 120, label: '120 CR', price: '$10' },
                                        { val: 300, label: '300 CR', price: '$25' },
                                        { val: 999, label: 'PRO', price: '$10' }
                                    ].map(tier => (
                                        <div 
                                            key={tier.val}
                                            onClick={() => setAmount(tier.val)}
                                            style={{
                                                border: amount == tier.val ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                                borderRadius: '16px',
                                                padding: '1.5rem 0.5rem',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                background: amount == tier.val ? 'rgba(57, 255, 20, 0.05)' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                        >
                                            {tier.popular && (
                                                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-accent)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>POPULAR</div>
                                            )}
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.2rem' }}>{tier.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{tier.price}</div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} style={{
                                    background: 'var(--color-bg)',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>1. Pay via PayPal</label>
                                            <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer" style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
                                                background: '#0070ba', color: '#fff', borderRadius: '100px', padding: '0.8rem', textDecoration: 'none', fontWeight: 600, gap: '8px', transition: 'opacity 0.2s', fontFamily: 'var(--font-sans)'
                                            }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg>
                                                Pay with PayPal
                                            </a>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>2. Enter Transaction ID</label>
                                            <input 
                                                type="text" 
                                                placeholder="Transaction ID or PayPal Email" 
                                                value={txId} 
                                                onChange={(e) => setTxId(e.target.value)} 
                                                style={{
                                                    width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.9rem', fontSize: '0.9rem', color: 'var(--color-text)', outline: 'none', fontFamily: 'var(--font-sans)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={submitting} style={{
                                        width: '100%',
                                        background: 'var(--color-text)',
                                        color: 'var(--color-bg)',
                                        borderRadius: '100px',
                                        border: 'none',
                                        padding: '1rem',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        marginTop: '2rem',
                                        transition: 'transform 0.2s ease',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                                        fontFamily: 'var(--font-sans)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {submitting ? 'Verifying...' : 'Complete Recharge'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </div>

                    {/* Right: Meta & Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Shield size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>USER_PROFILE_META</span>
                            </div>

                            {profile?.is_pro && (
                                <div style={{
                                    backgroundColor: 'var(--color-accent)',
                                    color: '#000',
                                    padding: '0.5rem 1rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1.5rem',
                                    fontWeight: 900,
                                    fontSize: '0.7rem',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    <Award size={14} /> PRO_TIER_ACTIVE
                                </div>
                            )}

                            <div style={{ fontSize: '0.75rem', lineHeight: 2, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                                <span style={{ color: 'var(--color-text)' }}>UID:</span> {user.id.toUpperCase()}<br />
                                <span style={{ color: 'var(--color-text)' }}>RANK:</span> {profile?.is_pro ? 'PRO_ACCESS' : 'STANDARD'}<br />
                                <span style={{ color: 'var(--color-text)' }}>JOIN_DATE:</span> {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Activity size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>CREDIT_AUDIT_LOG</span>
                            </div>
                            {logs.length > 0 ? (
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '0.5rem',
                                    maxHeight: '350px',
                                    overflowY: 'auto',
                                    paddingRight: '0.5rem',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--color-accent) transparent'
                                }} className="custom-scrollbar">
                                    {logs.map(log => (
                                        <div key={log.id} style={{
                                            fontSize: '0.6rem',
                                            fontFamily: 'var(--font-mono)',
                                            borderLeft: `2px solid ${log.amount > 0 ? 'var(--color-accent)' : '#ff4444'}`,
                                            padding: '0.4rem 0.6rem',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            marginBottom: '0.2rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                                                <span style={{ fontWeight: 900, color: log.amount > 0 ? 'var(--color-accent)' : '#ff4444' }}>
                                                    {log.amount > 0 ? '+' : ''}{log.amount} CR
                                                </span>
                                                <span style={{ opacity: 0.3, scale: '0.9' }}>{new Date(log.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ opacity: 0.6, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {log.reason || 'SYSTEM_USAGE'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>NO_TRANSACTIONS_RECORDED</div>
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <ExternalLink size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>TRANSFER_VERIFICATION</span>
                            </div>
                            {requests.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requests.slice(0, 5).map(req => (
                                        <div key={req.id} style={{
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontFamily: 'var(--font-mono)',
                                            borderBottom: '1px dotted var(--color-border)',
                                            paddingBottom: '0.5rem'
                                        }}>
                                            <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                            <span style={{ fontWeight: 900 }}>{req.amount}CR</span>
                                            <span style={{
                                                color: req.status === 'pending' ? '#FFA500' : 'var(--color-accent)',
                                                fontWeight: 900
                                            }}>[{req.status.toUpperCase()}]</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>NO_REQUESTS_LOGGED</div>
                            )}
                        </div>

                        <button onClick={signOut} style={{
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            padding: '1rem',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.borderColor = '#ff4444'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                            TERMINATE_SESSION
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const minimalLabelStyle = { 
    fontSize: '0.65rem', 
    fontWeight: 900, 
    fontFamily: 'var(--font-mono)', 
    opacity: 0.5, 
    display: 'block', 
    marginBottom: '0.5rem',
    letterSpacing: '0.1em'
};

const minimalInputStyle = {
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    padding: '0.8rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    outline: 'none',
    boxSizing: 'border-box'
};

export default DossierPage;
