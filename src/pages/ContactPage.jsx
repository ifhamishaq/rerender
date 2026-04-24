import React, { useEffect } from 'react';
import ContactSection from '../components/ContactSection';
import { motion } from 'framer-motion';

const ContactPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--color-bg)',
            paddingTop: 'var(--nav-height)'
        }}>
            <section style={{ padding: '4rem 2rem 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '2rem'
                    }}>
                        <span style={{ fontWeight: 900 }}>GET_IN_TOUCH</span>
                        <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(232,17,26,0.15)' }} />
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: 'clamp(3rem, 12vw, 7rem)', lineHeight: 0.85, margin: 0,
                        textTransform: 'uppercase', letterSpacing: '-0.04em',
                        color: 'var(--color-text)'
                    }}>
                        LET'S <br />
                        <span style={{ color: 'var(--color-accent)' }}>CONNECT.</span>
                    </h1>
                </div>
            </section>

            <ContactSection />

            {/* Extra Info Section */}
            <section style={{ padding: '0 2rem 8rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '4rem',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '4rem'
                }}>
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Direct_Communications</h4>
                        <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>real.re.render@gmail.com</p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>For urgent inquiries and partnership proposals.</p>
                    </div>
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Studio_Hours</h4>
                        <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>MON — FRI / 09:00 — 18:00</p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Operating across all digital timezones.</p>
                    </div>
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Social_Nodes</h4>
                        <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
                            <a href="#" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>INSTAGRAM</a>
                            <a href="#" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>X / TWITTER</a>
                            <a href="#" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>LINKEDIN</a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ContactPage;
