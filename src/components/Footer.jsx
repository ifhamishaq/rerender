import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();
    const location = useLocation();
    const accentColor = location.pathname === '/arcade' ? '#E8111A' : 'var(--color-accent)';

    return (
        <footer style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
        }}>
            {/* Top editorial rule */}
            <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                opacity: 0.45,
            }}>
                <span>STUDIO — DIGITAL EDITORIAL</span>
                <span style={{ color: 'var(--color-accent)', opacity: 1 }}>●</span>
                <span>REMOTE FIRST — WORLDWIDE</span>
            </div>

            {/* Main grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0',
                borderBottom: '1px solid var(--color-border)',
            }}>
                {/* Sitemap */}
                <div style={{
                    padding: '3rem 2rem',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <h4 style={{
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontSize: '0.65rem',
                        marginBottom: '0.5rem'
                    }}>Sitemap</h4>
                    {[
                        { to: '/services', label: 'Services' },
                        { to: '/about', label: 'About' },
                        { to: '/prompts', label: 'Prompts' },
                        { to: '/shop', label: 'Shop' },
                        { to: '/careers', label: 'Careers' },
                        { to: '/blog', label: 'Blog' },
                        { to: '/submit-prompt', label: 'Submit Prompt' },
                    ].map(({ to, label }) => (
                        <Link key={to} to={to} style={{
                            color: 'var(--color-text)',
                            opacity: 0.6,
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            transition: 'opacity 0.2s',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Legal */}
                <div style={{
                    padding: '3rem 2rem',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <h4 style={{
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontSize: '0.65rem',
                        marginBottom: '0.5rem'
                    }}>Legal</h4>
                    {[
                        { to: '/terms', label: 'Terms of Service' },
                        { to: '/privacy', label: 'Privacy Policy' },
                        { to: '/license', label: 'License Agreement' },
                        { to: '/refund', label: 'Refund Policy' },
                    ].map(({ to, label }) => (
                        <Link key={to} to={to} style={{
                            color: 'var(--color-text)',
                            opacity: 0.6,
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            transition: 'opacity 0.2s',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Socials */}
                <div style={{
                    padding: '3rem 2rem',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <h4 style={{
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontSize: '0.65rem',
                        marginBottom: '0.5rem'
                    }}>Socials</h4>
                    {[
                        { href: 'https://www.instagram.com/realre.render/', label: 'Instagram ↗' },
                        { href: 'https://x.com/wani_ifham1', label: 'Twitter / X ↗' },
                        { href: 'https://www.threads.net/@realre.render', label: 'Threads ↗' },
                    ].map(({ href, label }) => (
                        <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{
                            color: 'var(--color-text)',
                            opacity: 0.6,
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            transition: 'opacity 0.2s',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            {label}
                        </a>
                    ))}
                </div>

                {/* Contact */}
                <div style={{
                    padding: '3rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <h4 style={{
                        color: accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontSize: '0.65rem',
                        marginBottom: '0.5rem'
                    }}>Get In Touch</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text)', opacity: 0.6, lineHeight: 1.6, marginBottom: '1rem' }}>
                        Have a project in mind? We respond within 24 hours.
                    </p>
                    <a href="mailto:real.re.render@gmail.com" style={{
                        color: accentColor,
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                    }}>
                        real.re.render@gmail.com ↗
                    </a>
                </div>
            </div>

            {/* Newspaper wordmark bottom */}
            <div style={{
                padding: '2rem 2rem 1rem',
                overflow: 'hidden',
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(4rem, 18vw, 14rem)',
                    lineHeight: 0.85,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-0.04em',
                    color: 'transparent',
                    WebkitTextStroke: '1px var(--color-border)',
                    userSelect: 'none',
                }}>
                    RE-RENDER
                </h2>
            </div>

            {/* Bottom bar */}
            <div style={{
                padding: '1.25rem 2rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                flexWrap: 'wrap',
                gap: '0.5rem',
            }}>
                <span style={{ opacity: 0.4 }}>© {year} RE-RENDER INC. ALL RIGHTS RESERVED.</span>
                <span style={{ opacity: 0.4 }}>DESIGNED IN THE VOID.</span>
            </div>
        </footer>
    );
};

export default Footer;
