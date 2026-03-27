import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import ProjectMarquee from '../components/ProjectMarquee';
import { Link } from 'react-router-dom';
import FadeUp from '../components/Animations/FadeUp';
import products from '../data/products.json';
import { useTheme } from '../context/ThemeContext';
import Testimonials from '../components/Testimonials';
import PricingFAQ from '../components/PricingFAQ';
import StickySidebar from '../components/StickySidebar';
import servicesData from '../data/services.json';

const Home = () => {
    const { isDarkMode } = useTheme();

    return (
        <main style={{ backgroundColor: 'var(--color-bg)', position: 'relative' }}>
            <StickySidebar items={[
                { label: 'START', targetId: 'top' },
                { label: 'SERVICES', targetId: 'services' },
                { label: 'PROCESS', targetId: 'process' },
                { label: 'WORK', targetId: 'work' },
                { label: 'FAQ', targetId: 'faq' }
            ]} />

            <div id="top" />
            <Hero />
            <Marquee />

            {/* ===== STATS BAR ===== */}
            <section style={{
                padding: '4rem 2rem',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '2rem',
                    textAlign: 'center'
                }}>
                    {[
                        { num: '50+', label: 'PROJECTS DELIVERED' },
                        { num: '30+', label: 'CLIENTS SERVED' },
                        { num: '3YRS', label: 'IN THE INDUSTRY' },
                        { num: '5★', label: 'AVERAGE RATING' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div style={{
                                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                fontWeight: 900,
                                fontFamily: 'var(--font-sans)',
                                lineHeight: 1,
                                color: 'var(--color-accent)',
                                marginBottom: '0.5rem'
                            }}>
                                {stat.num}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                letterSpacing: '0.15em',
                                color: 'var(--color-text-secondary)',
                                opacity: 1
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Project Showcase Marquee (Replaces 01 - HOW WE WORK) */}
            <section id="work">
                <ProjectMarquee />
            </section>

            {/* Services Section */}
            <section id="services" style={{
                padding: '8rem 2rem',
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <div className="section-label" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <span style={{ color: 'var(--color-accent)', opacity: 1 }}>02</span>
                            &#8212; SERVICES
                            <span style={{ flex: 1, height: '1px', backgroundColor: 'currentColor', opacity: 0.3, display: 'block' }} />
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-display)',
                            lineHeight: 1,
                            textTransform: 'uppercase',
                            color: 'var(--color-text)'
                        }}>
                            OUR SERVICES
                        </h2>
                        <p style={{
                            color: 'var(--color-text-secondary)',
                            opacity: 0.6,
                            fontSize: '1.1rem',
                            lineHeight: 1.6
                        }}>
                            We build premium websites and videos for modern brands.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        textAlign: 'left'
                    }}>
                        {servicesData.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="hero-services-peek-item"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    padding: '2.5rem 2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '280px',
                                    cursor: 'default'
                                }}
                            >
                                <img 
                                    src={service.gif} 
                                    alt="" 
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0, width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        opacity: 0.1,
                                        zIndex: 0
                                    }}
                                />
                                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '1rem',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 900,
                                        color: 'var(--color-accent)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {service.title}
                                    </h3>
                                    <p style={{
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '1rem',
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
                                                fontSize: '0.65rem',
                                                fontFamily: 'var(--font-mono)',
                                                padding: '0.3rem 0.6rem',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                color: 'var(--color-text)',
                                                fontWeight: 'bold',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                            <Link to="/get-in-touch" style={{
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
                                    e.target.style.boxShadow = '8px 8px 0px var(--color-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.boxShadow = '4px 4px 0px var(--color-accent)';
                                }}>
                                GET IN TOUCH
                            </Link>
                    </div>
                </div>
            </section>


            {/* ===== AGENCY PROCESS SECTION ===== */}
            <section id="process" style={{
                padding: '10rem 2rem',
                backgroundColor: 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '6rem', textAlign: 'center' }}>
                        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--color-accent)' }}>03</span>
                            &#8212; HOW WE WORK
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(3rem, 10vw, 7rem)',
                            fontFamily: 'var(--font-display)',
                            textTransform: 'uppercase',
                            lineHeight: 0.85,
                            marginTop: '2rem',
                            letterSpacing: '-0.04em'
                        }}>
                            WE HELP YOU <span className="serif-italic" style={{ color: 'var(--color-accent)', textTransform: 'lowercase', fontWeight: 400 }}>grow</span> FAST
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '4rem',
                        position: 'relative'
                    }}>
                        {[
                            { step: '01', title: 'PLAN', desc: 'We talk about your goals and create a clear plan for your project.' },
                            { step: '02', title: 'BUILD', desc: 'Our team makes your videos and website with the best tools.' },
                            { step: '03', title: 'LAUNCH', desc: 'We help you launch your project so you can start seeing results.' }
                        ].map((item, i) => (
                            <div key={item.step} style={{ position: 'relative' }}>
                                <div style={{
                                    fontSize: '6rem',
                                    fontFamily: 'var(--font-display)',
                                    opacity: 0.05,
                                    position: 'absolute',
                                    top: '-2rem',
                                    left: '-1rem',
                                    lineHeight: 1
                                }}>{item.step}</div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--color-accent)',
                                    marginBottom: '1.5rem',
                                    fontWeight: 900
                                }}>{item.title}</h3>
                                <p style={{
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6
                                }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                        <div style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            border: '1px solid var(--color-accent)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            color: 'var(--color-accent)',
                            textTransform: 'uppercase',
                            marginBottom: '2rem',
                            letterSpacing: '0.2em'
                        }}>
                            WE ARE TAKING 2 MORE PROJECTS
                        </div>
                        <br />
                        <Link to="/get-in-touch" style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                            fontWeight: 900,
                            color: 'var(--color-text)',
                            textDecoration: 'none',
                            borderBottom: '2px solid var(--color-accent)',
                            transition: 'opacity 0.2s',
                            letterSpacing: '-0.02em'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}>
                            START YOUR PROJECT &rarr;
                        </Link>
                </div>
            </section>

            <Testimonials />
            
            <div id="faq">
                <PricingFAQ />
            </div>

            {/* Massive CTA Section */}
            <section style={{
                padding: '10rem 2rem',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '1px solid var(--color-border)'
            }}>
                {/* ... existing CTA ... */}
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
                        READY TO START?
                    </motion.h2>
                    <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        marginBottom: '4rem'
                    }}>
                        LET'S BUILD SOMETHING GREAT TOGETHER.
                    </p>
                    <a href="/services#inquiry" style={{
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
                            e.target.style.boxShadow = '12px 12px 0px #121212';
                        }}
                        onMouseLeave={(e) => {
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
