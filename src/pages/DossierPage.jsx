import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Wallet, ExternalLink, Activity, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';

const DossierPage = () => {
    const { user, profile, signOut } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txId, setTxId] = useState('');
    const [amount, setAmount] = useState(10);
    const [submitting, setSubmitting] = useState(false);

    const PAYPAL_LINK = "https://www.paypal.com/paypalme/ImadWani96";

    useEffect(() => {
        if (user) fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('topup_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setRequests(data);
        setLoading(false);
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        if (!txId) return alert('Enter payment info/email');
        setSubmitting(true);
        const { error } = await supabase.from('topup_requests').insert([
            { user_id: user.id, amount: parseInt(amount), transaction_id: txId }
        ]);
        if (!error) {
            alert('Support Request Sent. Admin will verify shortly.');
            setTxId('');
            fetchRequests();
        } else {
            alert('Error: ' + error.message);
        }
        setSubmitting(false);
    };

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
            <Link to="/" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>[UNAUTHORIZED_ACCESS_RETURN]</Link>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '120px 2rem 4rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Header Section */}
                <header style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '2rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>// RE-RENDER_USER_OS_V2.5</div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 0.9 }}>
                            {profile?.full_name?.toUpperCase() || 'OPERATIVE'}<br/>
                            <span style={{ color: '#333' }}>DOSSIER</span>
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.3rem' }}>AVAILABLE_COMPUTE</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)' }}>{profile?.credits || 0} <span style={{ fontSize: '0.8rem' }}>CR</span></div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
                    
                    {/* Left: Support the Devs System */}
                    <section>
                        <div style={{ border: '1px solid var(--color-accent)', padding: '2rem', background: 'rgba(57,255,20,0.02)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#000', padding: '0 10px', fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-accent)' }}>
                                SUPPORT_THE_DEVS
                            </div>
                            
                            <p style={{ fontSize: '0.75rem', lineHeight: 1.6, opacity: 0.7, marginBottom: '1.5rem' }}>
                                RE-RENDER is an independent studio. Support our work to gain priority compute power and higher generation limits.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.5rem' }}>STEP_01: DIRECT_TRANSITION</div>
                                <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--color-accent)', color: '#000', padding: '1rem', textDecoration: 'none', fontWeight: 900, fontSize: '0.8rem', textAlign: 'center', justifyContent: 'center' }}>
                                    OPEN_PAYPAL_GATEWAY <ExternalLink size={14} />
                                </a>
                            </div>

                            <form onSubmit={handleSupportSubmit} style={{ borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem' }}>
                                <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '1rem' }}>STEP_02: VERIFY_TRANSFER</div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.55rem', opacity: 0.5, display: 'block', marginBottom: '0.4rem' }}>TIER_SELECTION</label>
                                        <select value={amount} onChange={(e) => setAmount(e.target.value)} style={minimalInputStyle}>
                                            <option value="10">10 CR ($1)</option>
                                            <option value="50">50 CR ($5)</option>
                                            <option value="120">120 CR ($10)</option>
                                            <option value="300">300 CR ($25)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.55rem', opacity: 0.5, display: 'block', marginBottom: '0.4rem' }}>TX_HASH / EMAIL</label>
                                        <input type="text" placeholder="ID..." value={txId} onChange={(e) => setTxId(e.target.value)} style={minimalInputStyle} />
                                    </div>
                                </div>
                                <button type="submit" disabled={submitting} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '0.8rem', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}>
                                    {submitting ? 'PROCESSING...' : 'INITIALIZE_TOPUP'}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Right: Meta & Logs */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ padding: '1.5rem', border: '1px solid #1a1a1a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem' }}>
                                <Shield size={14} color="var(--color-accent)" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>IDENTITY_PROTOCOL</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.6, lineHeight: 1.8 }}>
                                UID: {user.id.toUpperCase()}<br/>
                                STATUS: VERIFIED_OPERATIVE<br/>
                                JOIN_DATE: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', border: '1px solid #1a1a1a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem' }}>
                                <Activity size={14} color="var(--color-accent)" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>RECENT_LOGS</span>
                            </div>
                            {requests.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {requests.slice(0, 3).map(req => (
                                        <div key={req.id} style={{ fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ opacity: 0.5 }}>{new Date(req.created_at).toLocaleDateString()}</span>
                                            <span style={{ fontWeight: 900 }}>{req.amount}CR</span>
                                            <span style={{ color: req.status === 'pending' ? 'orange' : 'var(--color-accent)' }}>[{req.status.toUpperCase()}]</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.6rem', opacity: 0.3, textAlign: 'center', padding: '1rem' }}>NO_DATA_AVAILABLE</div>
                            )}
                        </div>

                        <button onClick={signOut} style={{ background: 'none', border: '1px solid #ff000033', color: '#ff4444', padding: '0.8rem', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                            TERMINATE_SESSION
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const minimalInputStyle = {
    width: '100%',
    background: '#050505',
    border: '1px solid #1a1a1a',
    color: '#fff',
    padding: '0.6rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    outline: 'none',
    boxSizing: 'border-box'
};

export default DossierPage;
