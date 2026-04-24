import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import OracleCore from '../components/OracleCore';
import LabHeader from '../components/LabHeader';
import { useAuth } from '../context/AuthContext';

const AILabPage = () => {
    const { profile } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--color-bg)', 
            color: 'var(--color-text)', 
            paddingTop: '80px',
            paddingBottom: '8rem'
        }}>
            <LabHeader 
                title="AESTHETIC" 
                subtitle="Oracle." 
                vol="04" 
                credits={profile?.credits ?? 0} 
                accentColor="var(--color-accent)"
            />

            <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
                {/* Centered AI Agent Container */}
                <div style={{ 
                    height: '75vh', 
                    maxHeight: '850px', 
                    position: 'relative',
                    border: '2px solid var(--color-text)',
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: '15px 15px 0px rgba(0,0,0,0.05)'
                }}>
                    <OracleCore mode="standard" />
                </div>

                {/* Technical Meta */}
                <div style={{ 
                    marginTop: '4rem', 
                    borderTop: '1px solid var(--color-border)', 
                    paddingTop: '2rem', 
                    opacity: 0.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem'
                }}>
                    <div>
                        <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>DIRECTIVE_ENGINE:</span> GEMMA_4_31B<br />
                        <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>PROMPT_FIDELITY:</span> MAXIMUM
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>LATENCY:</span> OPTIMIZED<br />
                        <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>RE-RENDER_ID:</span> ORACLE_V4
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AILabPage;
