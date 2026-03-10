import React from 'react';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import PromptPreview from '../components/PromptPreview';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <main>
            <Hero />
            <Marquee />
            
            {/* Services Teaser */}
            <section style={{
                padding: '8rem 2rem',
                backgroundColor: '#121212',
                color: '#fff',
                borderBottom: '1px solid #333',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        marginBottom: '2rem',
                        fontFamily: 'var(--font-sans)',
                        lineHeight: 1
                    }}>
                        DIGITAL <span style={{ color: 'var(--color-accent)' }}>AGENCY</span>
                    </h2>
                    <p style={{
                        color: '#aaa',
                        fontSize: '1.2rem',
                        marginBottom: '3rem',
                        lineHeight: 1.6
                    }}>
                        Elevating brands through high-end video editing, graphic design, 3D art, and web development. 
                        We don't just build assets; we build digital experiences.
                    </p>
                    <Link to="/services" style={{
                        display: 'inline-block',
                        padding: '1rem 2.5rem',
                        backgroundColor: 'transparent',
                        color: 'var(--color-accent)',
                        border: '2px solid var(--color-accent)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--color-accent)';
                        e.target.style.color = '#121212';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--color-accent)';
                    }}>
                        VIEW SERVICES
                    </Link>
                </div>
            </section>

            <PromptPreview />
        </main>
    );
};

export default Home;
