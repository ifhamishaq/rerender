import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import OracleCore from '../components/OracleCore';

const AILabPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--color-bg)', 
            color: 'var(--color-text)', 
            paddingTop: 'calc(var(--nav-height) + 4rem)',
            paddingBottom: '8rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                
                {/* Minimal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6rem' }}>
                    <div>
                        <Link to="/tools" style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            color: 'var(--color-accent)', textDecoration: 'none', 
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900,
                            textTransform: 'uppercase', marginBottom: '2rem'
                        }}>
                            <ArrowLeft size={14} />
                            <span>BACK_TO_LABS</span>
                        </Link>
                        <h1 style={{ 
                            fontFamily: 'var(--font-display)', fontWeight: 900, 
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 0.9, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.02em'
                        }}>
                            AESTHETIC<br />
                            <span style={{ color: 'var(--color-accent)' }}>ORACLE.</span>
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right', display: 'none', lg: 'block' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                            <Sparkles size={16} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900 }}>RE-RENDER_AI_UNIT</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.4, margin: 0 }}>V.4.5_STABLE // STEP_3.5_FLASH</p>
                    </div>
                </div>

                {/* Centered AI Agent Container */}
                <div style={{ height: '85vh', maxHeight: '900px', position: 'relative' }}>
                    <OracleCore mode="standard" />
                </div>

                {/* Technical Meta */}
                <div style={{ marginTop: '8rem', borderTop: '1px solid var(--color-border)', paddingTop: '3rem', opacity: 0.3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                        <span>DIRECTIVE_ENGINE: 01-A</span>
                        <span>PROMPT_FIDELITY: OPTIMIZED</span>
                        <span>LATENCY: &lt; 150MS</span>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AILabPage;
