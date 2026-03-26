import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Wallet, ExternalLink, Activity, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDossier } from '../hooks/useDossier';
import { Link } from 'react-router-dom';

const DossierPage = () => {
    const { user, profile, signOut } = useAuth();
    const { requests, submitting, submitRequest } = useDossier();
    
    const [txId, setTxId] = useState('');
    const [amount, setAmount] = useState(10);

    const PAYPAL_LINK = "https://www.paypal.com/paypalme/ImadWani96";

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitRequest(amount, txId);
            setTxId('');
            alert('Support Request Delivered. Verifying...');
        } catch (err) {
            alert('Transmission Failed: ' + err.message);
        }
    };

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <Link to="/" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>[UNAUTHORIZED_ACCESS_RETURN]</Link>
        </div>
    );

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--color-bg)', 
            color: 'var(--color-text)', 
            padding: '120px 2rem 4rem', 
            fontFamily: 'var(--font-sans)' 
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* Header Section / Masthead */}
                <header style={{ 
                    borderBottom: '4px solid var(--color-text)', 
                    paddingBottom: '2rem', 
                    marginBottom: '3rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'baseline' 
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
                            {profile?.full_name?.toUpperCase() || 'OPERATIVE'}<br/>
                            <span style={{ 
                                fontFamily: 'Playfair Display', 
                                fontStyle: 'italic', 
                                fontWeight: 400,
                                color: 'var(--color-accent)'
                            }}>DOSSIER</span>
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            letterSpacing: '0.1em' 
                        }}>
                            AVAILABLE_COMPUTE
                        </div>
                        <div style={{ 
                            fontSize: '3.5rem', 
                            fontWeight: 900, 
                            lineHeight: 1,
                            fontFamily: 'var(--font-display)'
                        }}>
                            {profile?.credits || 0}<span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>CR</span>
                        </div>
                    </div>
                </header>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1fr 350px', 
                    gap: '4rem' 
                }}>
                    
                    {/* Left: Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {/* Support Section */}
                        <section>
                            <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-15px', 
                                    left: '30px', 
                                    background: 'var(--color-bg)', 
                                    padding: '0 15px', 
                                    fontFamily: 'var(--font-mono)', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 900 
                                }}>
                                    SUPPORT_THE_WORKSPACE
                                </div>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '3rem',
                                    alignItems: 'start'
                                }}>
                                    <div>
                                        <p style={{ 
                                            fontSize: '1.1rem', 
                                            lineHeight: 1.5, 
                                            margin: 0,
                                            fontFamily: 'var(--font-sans)',
                                            fontWeight: 500
                                        }}>
                                            Maintain the engine. Support the developers to gain priority access, higher generation limits, and exclusive features.
                                        </p>
                                        <div style={{ marginTop: '2.5rem' }}>
                                            <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer" style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '1rem', 
                                                backgroundColor: 'var(--color-text)', 
                                                color: 'var(--color-bg)', 
                                                padding: '1.25rem', 
                                                textDecoration: 'none', 
                                                fontWeight: 900, 
                                                fontSize: '0.9rem', 
                                                textAlign: 'center', 
                                                justifyContent: 'center',
                                                fontFamily: 'var(--font-mono)',
                                                letterSpacing: '0.1em'
                                            }}>
                                                INITIATE_PAYPAL_GATEWAY <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '2.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, display: 'block', marginBottom: '0.5rem' }}>SELECT_TIER</label>
                                                <select value={amount} onChange={(e) => setAmount(e.target.value)} style={minimalInputStyle}>
                                                    <option value="10">10 CR ($1)</option>
                                                    <option value="50">50 CR ($5)</option>
                                                    <option value="120">120 CR ($10)</option>
                                                    <option value="999">PRO_ACCESS ($10) [PERMANENT]</option>
                                                    <option value="300">300 CR ($25)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.5, display: 'block', marginBottom: '0.5rem' }}>TX_ID / EMAIL</label>
                                                <input type="text" placeholder="REQUIRED_FOR_VERIFICATION" value={txId} onChange={(e) => setTxId(e.target.value)} style={minimalInputStyle} />
                                            </div>
                                            <button type="submit" disabled={submitting} style={{ 
                                                width: '100%', 
                                                background: 'var(--color-accent)', 
                                                color: '#000', 
                                                outline: '2px solid #000',
                                                border: 'none', 
                                                padding: '1rem', 
                                                fontWeight: 900, 
                                                fontSize: '0.8rem', 
                                                cursor: 'pointer',
                                                fontFamily: 'var(--font-mono)',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {submitting ? 'EXECUTING...' : 'VERIFY_TRANSFER'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
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
                                <span style={{ color: 'var(--color-text)' }}>UID:</span> {user.id.toUpperCase()}<br/>
                                <span style={{ color: 'var(--color-text)' }}>RANK:</span> {profile?.is_pro ? 'PRO_ACCESS' : 'STANDARD'}<br/>
                                <span style={{ color: 'var(--color-text)' }}>JOIN_DATE:</span> {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Activity size={16} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>TRANSFER_LOGS</span>
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
                                <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>NO_ACTIVITY_LOGGED</div>
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
