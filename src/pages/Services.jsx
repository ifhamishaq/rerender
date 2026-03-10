import React from 'react';
import { motion } from 'framer-motion';

const Services = () => {
    const servicesList = [
        {
            title: 'VIDEO EDITING',
            desc: 'High-retention, brutalist-style edits for commercials, music videos, and social media. Precision pacing with aggressive aesthetic grading.',
            tags: ['PREMIERE PRO', 'AFTER EFFECTS', 'DAVINCI RESOLVE']
        },
        {
            title: 'GRAPHIC DESIGN',
            desc: 'Post-internet brand identity, typography, and poster design. We break the rules to make you stand out.',
            tags: ['PHOTOSHOP', 'ILLUSTRATOR', 'FIGMA']
        },
        {
            title: '3D ART',
            desc: 'Surreal environments, product renders, and abstract motion graphics that blur the line between digital and physical.',
            tags: ['BLENDER', 'CINEMA 4D', 'UNREAL ENGINE']
        },
        {
            title: 'WEB DEVELOPMENT',
            desc: 'Immersive, high-performance websites using modern frameworks. Not just templates—custom digital architecture.',
            tags: ['REACT', 'THREE.JS', 'NEXT.JS']
        }
    ];

    return (
        <main style={{
            paddingTop: '8rem',
            paddingBottom: '6rem',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                <header style={{ marginBottom: '6rem', borderBottom: '2px solid var(--color-text)', paddingBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 7rem)',
                        margin: 0,
                        lineHeight: 0.9,
                        textTransform: 'uppercase'
                    }}>
                        OUR<br />
                        <span style={{ color: 'var(--color-accent)' }}>SERVICES</span>
                    </h1>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '4rem 2rem'
                }}>
                    {servicesList.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <h2 style={{
                                fontSize: '2rem',
                                marginBottom: '1rem',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 900
                            }}>
                                {service.title}
                            </h2>
                            <p style={{
                                color: '#666',
                                fontSize: '1.1rem',
                                lineHeight: 1.6,
                                marginBottom: '2rem',
                                flexGrow: 1
                            }}>
                                {service.desc}
                            </p>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                {service.tags.map(tag => (
                                    <span key={tag} style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'var(--font-mono)',
                                        padding: '0.3rem 0.6rem',
                                        backgroundColor: '#eee',
                                        fontWeight: 'bold'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{
                    marginTop: '8rem',
                    padding: '4rem 2rem',
                    backgroundColor: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    textAlign: 'center'
                }}>
                    <h3 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        textTransform: 'uppercase'
                    }}>
                        Ready to disrupt?
                    </h3>
                    <p style={{
                        color: '#aaa',
                        marginBottom: '2rem',
                        fontSize: '1.1rem'
                    }}>
                        Let's build something the internet hasn't seen before.
                    </p>
                    <a href="mailto:real.re.render@gmail.com" style={{
                        display: 'inline-block',
                        padding: '1rem 3rem',
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        boxShadow: '6px 6px 0px #888',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translate(-2px, -2px)';
                        e.target.style.boxShadow = '8px 8px 0px #888';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translate(0, 0)';
                        e.target.style.boxShadow = '6px 6px 0px #888';
                    }}>
                        GET A QUOTE
                    </a>
                </div>
            </div>
        </main>
    );
};

export default Services;
