import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Coins } from 'lucide-react';
import { useWindowSize } from '../hooks/useWindowSize';

const LabHeader = ({ title, subtitle, vol, credits = 0, accentColor = 'var(--color-accent)', tag = 'CREATOR OS' }) => {
    const { width } = useWindowSize();
    const isMobile = width < 680;

    return (
        <header style={{
            padding: '2.5rem 2rem 2rem',
            borderBottom: '1px solid var(--color-border)',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            gap: isMobile ? '1.75rem' : '1rem'
        }}>
            <div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    color: accentColor,
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                    fontWeight: 700
                }}>
                    <span>{tag}</span>
                    <span style={{ opacity: 0.4 }}>/</span>
                    <span>MODULE {vol}</span>
                </div>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 8vw, 4.25rem)',
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.08,
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text)'
                }}>
                    {title}{' '}
                    <span style={{
                        fontFamily: 'Playfair Display',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        color: accentColor,
                        textTransform: 'none'
                    }}>{subtitle}</span>
                </h1>
            </div>

            <div style={{
                textAlign: isMobile ? 'left' : 'right',
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                flexDirection: 'column',
                gap: '0.4rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '0.85rem 1.25rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <div style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.65rem', 
                    letterSpacing: '0.08em', 
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                }}>
                    <Coins size={12} style={{ color: accentColor }} />
                    <span>AVAILABLE CREDITS</span>
                </div>
                <div style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 800, 
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1.1,
                    color: 'var(--color-text)'
                }}>
                    {credits}<span style={{ fontSize: '0.75rem', color: accentColor, marginLeft: '0.3rem', fontFamily: 'var(--font-mono)' }}>CR</span>
                </div>
                <Link to="/profile" style={{
                    textDecoration: 'none',
                    color: accentColor,
                    backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s ease',
                    marginTop: '0.2rem'
                }}>
                    <Sparkles size={11} />
                    <span>Recharge</span>
                </Link>
            </div>
        </header>
    );
};

export default LabHeader;
