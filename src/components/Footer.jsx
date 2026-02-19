import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#121212',
            color: '#FFFFFF',
            padding: '4rem 2rem',
            borderTop: '1px solid #333',
            fontFamily: 'var(--font-mono)',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: '#666' }}>SITEMAP</h4>
                    <Link to="/features">FEATURES</Link>
                    <a href="/#shop">SHOP</a>
                    <a href="/#compare">BEFORE/AFTER</a>
                    <a href="#">LOGIN</a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: '#666' }}>LEGAL</h4>
                    <Link to="/terms">TERMS_OF_SERVICE</Link>
                    <Link to="/privacy">PRIVACY_POLICY</Link>
                    <Link to="/license">LICENSE_AGREEMENT</Link>
                    <Link to="/refund">REFUND_POLICY</Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: '#666' }}>SOCIALS</h4>
                    <a href="https://www.instagram.com/realre.render/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>INSTAGRAM ↗</a>
                    <a href="https://x.com/wani_ifham1" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>TWITTER / X ↗</a>
                    <a href="https://www.threads.net/@realre.render" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>THREADS ↗</a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ color: '#666' }}>NEWSLETTER</h4>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>
                        Join the resistance. No spam, only signals.
                    </p>
                </div>
            </div>

            <div style={{
                borderTop: '1px solid #333',
                paddingTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(4rem, 15vw, 12rem)',
                    lineHeight: 0.8,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-0.05em',
                    color: '#333'
                }}>
                    RE-RENDER
                </h2>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#666'
                }}>
                    <span>&copy; 2026 RE-RENDER INC.</span>
                    <span>DESIGNED IN THE VOID.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
