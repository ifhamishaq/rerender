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
        <main style={{ minHeight: '100vh', backgroundColor: '#F8F6F1', color: '#000', paddingTop: 'calc(var(--nav-height) + 4rem)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
                
                {/* Back Nav */}
                <Link to="/tools" style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    color: '#000', textDecoration: 'none', 
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                    textTransform: 'uppercase', marginBottom: '4rem', opacity: 0.5
                }}>
                    <ArrowLeft size={14} />
                    <span>RETURN_TO_ARCHIVE</span>
                </Link>

                {/* Header Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', marginBottom: '6rem', alignItems: 'start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E8111A', marginBottom: '1.5rem' }}>
                            <Smartphone size={18} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 900 }}>ISSUE_02 // VISUAL_INTEGRITY</span>
                        </div>
                        <h1 style={{ 
                            fontFamily: 'var(--font-display)', fontWeight: 900, 
                            fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 0.8, margin: 0,
                            letterSpacing: '-0.06em'
                        }}>
                            SAFE<br />
                            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>ZONE_LAB.</span>
                        </h1>
                    </div>
                    <div style={{ padding: '2rem', border: '4px solid #000', backgroundColor: '#fff', marginTop: '2rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', opacity: 0.5 }}>EDITORIAL_NOTE</div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: '#333', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                            Stop getting your text cut off by UI elements. Upload your 9:16 frame and toggle overlays for TikTok and Reels. Engineered for editors who demand absolute precision.
                        </p>
                    </div>
                </div>

                {/* Safe Zone Interface */}
                <div style={{ marginBottom: '8rem' }}>
                    <SafeZone />
                </div>

                {/* FAQ Section */}
                <section style={{ borderTop: '8px solid #000', paddingTop: '5rem', marginBottom: '8rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem' }}>
                        <div>
                            <div style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <HelpCircle size={18} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>THE_RATIONALE</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: '#333', lineHeight: 1.6, fontWeight: 500 }}>
                                Social media platforms place interactive elements—likes, shares, captions—differently across devices. If your key action or text is in these "Dead Zones," your engagement will drop. This tool ensures your edit is ALWAYS safe.
                            </p>
                        </div>
                        <div>
                            <div style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Info size={18} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>PRO_PRACTICE</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: '#333', lineHeight: 1.6, fontWeight: 500 }}>
                                Keep your main subject between the 20% and 80% marks horizontally, and avoid the bottom 25% of the screen where captions reside. Our overlays simulate the average UI layout of modern mobile ecosystems.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SafeZonePage;
