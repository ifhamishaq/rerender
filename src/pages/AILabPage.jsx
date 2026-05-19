import React, { useEffect } from 'react';
import OracleCore from '../components/OracleCore';
import { useAuth } from '../context/AuthContext';

const AILabPage = () => {
    const { profile } = useAuth();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '80px'
        }}>
            {/* Title */}
            <div style={{ padding: '3rem 2rem 0', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                    Oracle
                </h1>
                <p style={{ fontSize: 14, opacity: 0.4, marginTop: 8, fontWeight: 500 }}>
                    Your creative AI assistant
                </p>
            </div>

            {/* Chat */}
            <div style={{
                width: '100%',
                maxWidth: 720,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                paddingBottom: '2rem',
                minHeight: 0
            }}>
                <div style={{
                    flex: 1,
                    borderRadius: 20,
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    minHeight: 'min(65vh, 500px)',
                    maxHeight: '72vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <OracleCore mode="standard" />
                </div>

                <p style={{ textAlign: 'center', fontSize: 12, opacity: 0.25, marginTop: 16, fontWeight: 500 }}>
                    Oracle may make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

export default AILabPage;
