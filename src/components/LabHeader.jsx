import React from 'react';
import { Link } from 'react-router-dom';
import { useWindowSize } from '../hooks/useWindowSize';

const LabHeader = ({ title, subtitle, vol, credits = 0, accentColor = 'var(--color-accent)' }) => {
    const { width } = useWindowSize();
    const isMobile = width < 600;

    return (
        <header style={{
            padding: '2rem',
            borderBottom: '4px solid var(--color-text)',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'baseline',
            gap: isMobile ? '1.5rem' : '0'
        }}>
            <div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.5rem'
                }}>
                    VOL. {vol} // LAB_REPORTS // RE-RENDER_STUDIO
                </div>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 15vw, 5rem)',
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-0.04em',
                    lineHeight: 0.9,
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase'
                }}>
                    {title}<br />
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
                flexDirection: 'column',
                gap: '0.5rem',
                width: isMobile ? '100%' : 'auto'
            }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.6 }}>COMPUTE_RESERVE</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                    {credits}<span style={{ fontSize: '0.8rem', marginLeft: '0.2rem' }}>CR</span>
                </div>
                <Link to="/profile" style={{
                    textDecoration: 'none',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-text)',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    marginTop: '0.5rem',
                    display: 'inline-block',
                    width: 'fit-content'
                }}>
                    GET_CREDITS
                </Link>
            </div>
        </header>
    );
};

export default LabHeader;
