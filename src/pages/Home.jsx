import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import PromptPreview from '../components/PromptPreview';
import { Link } from 'react-router-dom';

const Home = () => {
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

    const featuredWorks = [
        { title: 'Cyberpunk Aesthetic', type: 'VFX / Color Grade', image: '/uploads/1771750077064-4488930979.jpeg' },
        { title: 'Neon Reflections', type: '3D Art', image: '/uploads/1771749842777-7667232240.jpeg' },
        { title: 'Brutalist UI', type: 'Web Design', image: '/uploads/1771750232873-9005549072.jpeg' }
    ];

    return (
        <main>
            <Hero />
            <Marquee />
            
            {/* Our Approach Section */}
            <section style={{
                padding: '8rem 2rem',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-text)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.h2 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                            lineHeight: 0.9,
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 900,
                            margin: 0,
                            textTransform: 'uppercase'
                        }}
                    >
                        WE DON'T JUST <br/>
                        <span style={{ color: 'var(--color-accent)' }}>FOLLOW TRENDS.</span><br/>
                        WE SET THEM.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            marginTop: '3rem',
                            fontSize: '1.25rem',
                            maxWidth: '600px',
                            lineHeight: 1.6,
                            color: '#444'
                        }}
                    >
                        In a world of templates and drag-and-drop aesthetics, RE-RENDER builds custom, high-retention digital experiences for brands that want to stand out. Our studio combines raw creativity with technical precision.
                    </motion.p>
                </div>
            </section>

            {/* Services Section */}
            <section style={{
                padding: '8rem 2rem',
                backgroundColor: '#121212',
                color: '#fff',
                borderBottom: '1px solid #333'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-sans)',
                            lineHeight: 1,
                            textTransform: 'uppercase'
                        }}>
                            OUR EXPERTISE
                        </h2>
                        <p style={{
                            color: '#aaa',
                            fontSize: '1.2rem',
                            lineHeight: 1.6
                        }}>
                            Elevating brands through high-end digital architecture.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '2rem',
                        textAlign: 'left'
                    }}>
                        {servicesList.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 900,
                                    color: 'var(--color-accent)'
                                }}>
                                    {service.title}
                                </h3>
                                <p style={{
                                    color: '#ccc',
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                    marginBottom: '1.5rem',
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
                                            fontSize: '0.7rem',
                                            fontFamily: 'var(--font-mono)',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#333',
                                            color: '#fff',
                                            fontWeight: 'bold'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
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
                            transition: 'all 0.3s ease',
                            boxShadow: '4px 4px 0px var(--color-accent)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translate(-4px, -4px)';
                            e.target.style.boxShadow = '8px 8px 0px var(--color-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translate(0, 0)';
                            e.target.style.boxShadow = '4px 4px 0px var(--color-accent)';
                        }}>
                            VIEW FULL SERVICES
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Work Section */}
            <section style={{
                padding: '8rem 2rem',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-text)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                        <h2 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            margin: 0,
                            fontFamily: 'var(--font-sans)',
                            lineHeight: 1,
                            textTransform: 'uppercase'
                        }}>
                            SELECTED <span style={{ color: 'var(--color-accent)' }}>WORKS</span>
                        </h2>
                        <a href="mailto:real.re.render@gmail.com" style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            border: '1px solid var(--color-text)'
                        }}>
                            START A PROJECT ↗
                        </a>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {featuredWorks.map((work, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '4/5',
                                    border: '1px solid var(--color-text)',
                                    backgroundColor: '#fff',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    marginBottom: '1rem'
                                }}>
                                    <img 
                                        src={work.image} 
                                        alt={work.title} 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        backgroundColor: 'var(--color-accent)',
                                        color: 'var(--color-text)',
                                        padding: '0.25rem 0.75rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        {work.type}
                                    </div>
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '1.1rem',
                                    textTransform: 'uppercase',
                                    margin: 0
                                }}>
                                    {work.title}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <PromptPreview />

            {/* Massive CTA Section */}
            <section style={{
                padding: '10rem 2rem',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '2px solid var(--color-text)'
            }}>
                <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontSize: 'clamp(3rem, 10vw, 8rem)',
                            lineHeight: 0.9,
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 900,
                            margin: '0 0 2rem 0',
                            textTransform: 'uppercase'
                        }}
                    >
                        READY TO DISRUPT?
                    </motion.h2>
                    <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        marginBottom: '4rem'
                    }}>
                        STOP BLENDING IN. LET'S BUILD SOMETHING UNFORGETTABLE.
                    </p>
                    <a href="mailto:real.re.render@gmail.com" style={{
                        display: 'inline-block',
                        padding: '1.5rem 4rem',
                        backgroundColor: 'var(--color-text)',
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        boxShadow: '8px 8px 0px #121212',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translate(-4px, -4px)';
                        e.target.style.boxShadow = '12px 12px 0px #121212';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translate(0, 0)';
                        e.target.style.boxShadow = '8px 8px 0px #121212';
                    }}>
                        CONTACT US TODAY
                    </a>
                </div>
            </section>

        </main>
    );
};

export default Home;
