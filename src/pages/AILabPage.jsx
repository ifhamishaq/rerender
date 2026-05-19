import React, { useEffect } from 'react';
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

            <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
                {/* Chat Container */}
                <div style={{ 
                    height: '70vh', 
                    maxHeight: '800px', 
                    minHeight: '500px',
                    borderRadius: '20px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                }}>
                    <OracleCore mode="standard" />
                </div>

                {/* Subtle footer */}
                <div style={{ 
                    marginTop: '2rem', 
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    opacity: 0.3,
                    fontWeight: 500
                }}>
                    Oracle is powered by AI and may make mistakes. Verify important information.
                </div>
            </div>
        </div>
    );
};

export default AILabPage;
