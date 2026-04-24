import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Wallet, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const RechargePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedPack, setSelectedPack] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const CREDIT_PACKS = [
        { 
            id: 'pack_1', 
            credits: 1000, 
            price: 10, 
            label: 'PRO_OPERATIVE', 
            desc: 'Remove all watermarks and unlock lifetime studio support.',
            features: ['NO_WATERMARK', 'LIFETIME_ACCESS', '1000_CREDITS']
        },
        { 
            id: 'pack_2', 
            credits: 3000, 
            price: 25, 
            label: 'ELITE_STUDIO', 
            desc: 'Priority compute and multi-agent operations.',
            features: ['ALL_PRO_FEATURES', 'PRIORITY_QUEUE', '3000_CREDITS'],
            popular: true 
        },
        { 
            id: 'pack_3', 
            credits: 10000, 
            price: 75, 
            label: 'AGENCY_ULTIMATE', 
            desc: 'Unlimited throughput for large-scale creative agencies.',
            features: ['ENTERPRISE_NODE', '24/7_DEDICATED', '10000_CREDITS']
        }
    ];

    const handleSubmit = async () => {
        if (!selectedPack || !transactionId.trim()) return;
        setSubmitting(true);

        const { error } = await supabase
            .from('topup_requests')
            .insert([{
                user_id: user.id,
                amount: selectedPack.credits,
                transaction_id: transactionId,
                status: 'pending'
            }]);

        if (!error) {
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 4000);
        } else {
            alert("Error submitting request: " + error.message);
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', maxWidth: '400px' }}
                >
                    <div style={{ color: 'var(--color-accent)', marginBottom: '2rem' }}>
                        <CheckCircle2 size={80} strokeWidth={1.5} style={{ margin: '0 auto' }} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>REQUEST_SENT</h1>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '3rem' }}>
                        Your transmission has been logged. Credits will be allocated to your ledger once the PayPal transfer is verified.
                    </p>
                    <Link to="/profile" style={{ 
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                        backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', 
                        padding: '1.25rem 2.5rem', borderRadius: '100px', textDecoration: 'none'
                    }}>
                        RETURN_TO_PROFILE
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', padding: '120px 2rem 100px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <header style={{ marginBottom: '5rem' }}>
                    <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        <ChevronLeft size={14} /> BACK_TO_PROFILE
                    </button>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 900, margin: 0, lineHeight: 0.9 }}>CREDIT_RECHARGE</h1>
                    <p style={{ marginTop: '2rem', color: 'var(--color-text-secondary)', maxWidth: '500px', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Select a compute package and verify your transaction to replenish your studio credits.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                    {CREDIT_PACKS.map(pack => (
                        <motion.div 
                            key={pack.id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedPack(pack)}
                            style={{
                                padding: '2.5rem',
                                borderRadius: '32px',
                                backgroundColor: 'var(--color-surface)',
                                border: `2px solid ${selectedPack?.id === pack.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                cursor: 'pointer',
                                transition: 'border-color 0.3s, transform 0.3s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {pack.popular && (
                                <div style={{ position: 'absolute', top: '1.5rem', right: '-2.5rem', backgroundColor: 'var(--color-accent)', color: '#000', padding: '0.5rem 3rem', transform: 'rotate(45deg)', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>POPULAR</div>
                            )}
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5, marginBottom: '1rem', letterSpacing: '0.2em' }}>{pack.label}</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{pack.credits}<span style={{ fontSize: '1rem', marginLeft: '0.4rem', opacity: 0.5 }}>CR</span></div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', minHeight: '3rem' }}>{pack.desc}</p>
                            
                            <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {pack.features.map(feat => (
                                    <div key={feat} style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', opacity: 0.4, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '4px', height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '50%' }} />
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)' }}>${pack.price}</div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedPack && (
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                            style={{ 
                                padding: '4rem 3rem', 
                                backgroundColor: 'var(--color-surface)', 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '40px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '4rem'
                            }}
                        >
                            <div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>STEP_01: TRANSFER</h2>
                                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                                    Transfer <strong>${selectedPack.price}</strong> via PayPal to the studio address. Ensure you use the Friends & Family option to avoid delays.
                                </p>
                                <a 
                                    href="https://www.paypal.com/paypalme/ImadWani96" 
                                    target="_blank" rel="noreferrer"
                                    style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '1rem',
                                        backgroundColor: 'var(--color-accent)', color: '#000', 
                                        padding: '1.25rem 2.5rem', borderRadius: '100px', 
                                        textDecoration: 'none', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '0.8rem'
                                    }}
                                >
                                    OPEN_PAYPAL_PORTAL <ArrowRight size={16} />
                                </a>
                            </div>

                            <div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>STEP_02: VERIFY</h2>
                                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                                    Paste your unique PayPal <strong>Transaction ID</strong> below. Our system will verify the proof of transfer.
                                </p>
                                <input 
                                    type="text" 
                                    placeholder="PASTE_TRANSACTION_ID_HERE"
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                    style={{
                                        width: '100%', padding: '1.5rem', marginBottom: '1.5rem',
                                        backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
                                        borderRadius: '16px', color: '#fff', fontFamily: 'var(--font-mono)',
                                        fontSize: '0.9rem', outline: 'none'
                                    }}
                                />
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!transactionId || submitting}
                                    style={{ 
                                        width: '100%', padding: '1.25rem', 
                                        backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', 
                                        border: 'none', borderRadius: '100px', 
                                        fontFamily: 'var(--font-mono)', fontWeight: 900, 
                                        cursor: 'pointer', opacity: (transactionId && !submitting) ? 1 : 0.5,
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {submitting ? 'TRANSMITTING...' : 'INITIATE_VERIFICATION'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default RechargePage;
