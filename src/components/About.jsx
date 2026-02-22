import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <section id="about" style={{
            padding: '8rem 2rem',
            backgroundColor: '#000',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '1px solid var(--color-text)'
        }}>
            {/* Background Accent */}
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                fontSize: '15vw',
                fontWeight: '900',
                color: 'rgba(255,255,255,0.03)',
                pointerEvents: 'none',
                lineHeight: 0.8,
                zIndex: 0
            }}>
                CREATOR
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                gap: '4rem',
                position: 'relative',
                zIndex: 1
            }} className="about-grid">

                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 style={{
                        fontSize: 'clamp(3rem, 6vw, 6rem)',
                        lineHeight: 0.9,
                        marginBottom: '2rem',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        I AM<br />
                        <span style={{ color: 'var(--color-accent)' }}>IFHAM</span>
                    </h2>

                    <div style={{
                        width: '100px',
                        height: '4px',
                        backgroundColor: 'var(--color-accent)',
                        marginBottom: '2rem'
                    }}></div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.2rem',
                        color: 'var(--color-accent)'
                    }}>
                        <span>[ VIDEO EDITOR ]</span>
                        <span>[ GRAPHIC DESIGNER ]</span>
                        <span>[ 3D ARTIST ]</span>
                        <span>[ WEB DEVELOPER ]</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: 1.6,
                        marginBottom: '2rem',
                        color: '#ccc'
                    }}>
                        Based at the intersection of high-fashion aesthetics and raw lo-fi digital culture.
                        I build tools and assets that disrupt the mainstream frequency. RE-RENDER is my laboratory
                        where I distill professional-grade workflows into accessible assets for the next generation of creators.
                    </p>

                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        marginBottom: '3rem',
                        color: '#888'
                    }}>
                        My work is defined by a commitment to the 'Unseen' finding beauty in the glitch,
                        the noise, and the raw digital texture that defines our post-internet era.
                    </p>

                    <motion.a
                        href="#" // To be updated with portfolio link
                        whileHover={{ x: 10 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1rem',
                            color: 'var(--color-accent)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            borderBottom: '2px solid var(--color-accent)',
                            paddingBottom: '0.5rem',
                            width: 'fit-content'
                        }}
                    >
                        VIEW PORTFOLIO ↗
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
