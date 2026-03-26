import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Smartphone, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import SafeZone from '../components/SafeZone';

const SafeZonePage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
                
                {/* Back Nav */}
                <Link to="/tools" style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    color: 'var(--color-accent)', textDecoration: 'none', 
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', marginBottom: '3rem'
                }}>
                    <ArrowLeft size={16} />
                    <span>BACK_TO_LABS</span>
                </Link>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>
                            <Smartphone size={20} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.3em', fontWeight: 900 }}>RE-RENDER_SYSTEMS // UX_UNIT_02</span>
                        </div>
                        <h1 style={{ 
                            fontFamily: 'var(--font-display)', fontWeight: 900, 
                            fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.85, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.04em'
                        }}>
                            SAFE ZONE<br />
                            <span style={{ color: 'var(--color-accent)' }}>PREVIEWER.</span>
                        </h1>
                    </div>
                    <div style={{ maxWidth: '300px', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Stop getting your text cut off. Upload your 9:16 frame and toggle UI overlays for TikTok and Reels. Engineered for editors who demand precision.
                        </p>
                    </div>
                </div>

                {/* Safe Zone Interface */}
                <div style={{ marginBottom: '8rem' }}>
                    <SafeZone />
                </div>

                {/* FAQ Section */}
                <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem', marginBottom: '6rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>
                        <div>
                            <div style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <HelpCircle size={16} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>WHY_USE_THIS?</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Social media platforms place interactive elements (likes, share, caption) differently. If your key action or text is in these "Dead Zones", your engagement will drop. This tool ensures your edit is ALWAYS safe.
                            </p>
                        </div>
                        <div>
                            <div style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Info size={16} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>THE_RULE_OF_THUMB</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Keep your main subject between the 20% and 80% marks horizontally, and avoid the bottom 25% of the screen. Our overlays simulate the average UI layout of modern mobile apps.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SafeZonePage;
