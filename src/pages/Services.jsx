import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SlotMachineWidget from '../components/SlotMachineWidget';
import { useTheme } from '../context/ThemeContext';

const Services = () => {
    const { isDarkMode } = useTheme();
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    useEffect(() => {
        const discount = localStorage.getItem('re_render_discount');
        if (discount) {
            setAppliedDiscount(discount);
        }
    }, []);

    const servicesList = [
        {
            title: 'VIDEO EDITING',
            desc: 'High-retention, brutalist-style edits for commercials, music videos, and social media. Precision pacing with aggressive aesthetic grading.',
            tags: ['PREMIERE PRO', 'AFTER EFFECTS', 'DAVINCI RESOLVE'],
            gif: '/service-video.gif'
        },
        {
            title: 'GRAPHIC DESIGN',
            desc: 'Post-internet brand identity, typography, and poster design. We break the rules to make you stand out.',
            tags: ['PHOTOSHOP', 'ILLUSTRATOR', 'FIGMA'],
            gif: '/service-design.gif'
        },
        {
            title: '3D ART',
            desc: 'Surreal environments, product renders, and abstract motion graphics that blur the line between digital and physical.',
            tags: ['BLENDER', 'CINEMA 4D', 'UNREAL ENGINE'],
            gif: '/service-3d.gif'
        },
        {
            title: 'WEB DEVELOPMENT',
            desc: 'Immersive, high-performance websites using modern frameworks. Not just templates—custom digital architecture.',
            tags: ['REACT', 'THREE.JS', 'NEXT.JS'],
            gif: '/service-web.gif'
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
                <header style={{ marginBottom: '6rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '2rem' }}>
                    <div className="section-label" style={{ marginBottom: '2rem' }}>01 — WHAT WE DO</div>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 7rem)',
                        margin: 0,
                        lineHeight: 0.9,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em'
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
                            <div style={{
                                width: '100%',
                                aspectRatio: '4/5',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-bg)',
                                overflow: 'hidden',
                                position: 'relative',
                                marginBottom: '1rem'
                            }}>
                                <img
                                    src={service.gif}
                                    alt={service.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                        transition: 'transform 0.6s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </div>
                            <p style={{
                                color: 'var(--color-text-secondary)',
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
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        fontWeight: 'bold',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ===== INQUIRY FORM ===== */}
                <div id="inquiry" style={{ marginTop: '8rem', paddingTop: '4rem', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>
                        {/* Left: Copy */}
                        <div>
                            <h2 style={{
                                fontSize: 'clamp(2rem, 5vw, 4rem)',
                                margin: '0 0 1.5rem 0',
                                lineHeight: 0.95
                            }}>
                                START A<br />
                                <span style={{ color: 'var(--color-accent)' }}>PROJECT</span>
                            </h2>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.7,
                                fontSize: '0.95rem',
                                marginBottom: '2rem'
                            }}>
                                Tell us about your project. We'll get back within 24 hours with a tailored proposal (no generic templates — ever).
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    ['📩', 'real.re.render@gmail.com'],
                                    ['📍', 'Available Worldwide — Remote First'],
                                    ['⚡', 'Response within 24 hours']
                                ].map(([icon, text]) => (
                                    <div key={text} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.85rem',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        <span>{icon}</span>
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Form */}
                        <form
                            name="project-inquiry"
                            method="POST"
                            data-netlify="true"
                            netlify-honeypot="bot-field"
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <input type="hidden" name="form-name" value="project-inquiry" />
                            <p hidden><label>Don't fill: <input name="bot-field" /></label></p>

                            {appliedDiscount && (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'rgba(57, 255, 20, 0.1)',
                                    border: '1px solid var(--color-accent)',
                                    color: 'var(--color-accent)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.05em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    ⚡ {appliedDiscount}% DISCOUNT APPLIED TO INQUIRY
                                    <input type="hidden" name="applied_discount" value={`${appliedDiscount}%`} />
                                </div>
                            )}

                            {[
                                { label: 'YOUR NAME', name: 'name', type: 'text', placeholder: 'John Doe' },
                                { label: 'EMAIL ADDRESS', name: 'email', type: 'email', placeholder: 'you@company.com' },
                                { label: 'COMPANY / BRAND', name: 'company', type: 'text', placeholder: 'Optional' }
                            ].map(field => (
                                <div key={field.name}>
                                    <label style={{
                                        display: 'block',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.1em',
                                        marginBottom: '0.5rem',
                                        color: 'var(--color-text)'
                                    }}>
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        required={field.name !== 'company'}
                                        placeholder={field.placeholder}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 1rem',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.9rem',
                                            backgroundColor: 'var(--color-surface)',
                                            color: 'var(--color-text)',
                                            border: '1px solid var(--color-border)',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                    />
                                </div>
                            ))}

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-text)'
                                }}>
                                    SERVICE NEEDED
                                </label>
                                <select
                                    name="service"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">Select a service...</option>
                                    <option value="video-editing">VIDEO EDITING</option>
                                    <option value="graphic-design">GRAPHIC DESIGN</option>
                                    <option value="3d-art">3D ART</option>
                                    <option value="web-development">WEB DEVELOPMENT</option>
                                    <option value="full-package">FULL PACKAGE</option>
                                    <option value="other">OTHER / UNSURE</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-text)'
                                }}>
                                    BUDGET RANGE
                                </label>
                                <select
                                    name="budget"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">Select budget...</option>
                                    <option value="under-200">Under $200</option>
                                    <option value="200-500">$200 – $500</option>
                                    <option value="500-1500">$500 – $1,500</option>
                                    <option value="1500-5000">$1,500 – $5,000</option>
                                    <option value="5000+">$5,000+</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-text)'
                                }}>
                                    PROJECT BRIEF
                                </label>
                                <textarea
                                    name="brief"
                                    required
                                    rows={5}
                                    placeholder="Describe your project, goals, timeline, and any references..."
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '120px',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                style={{
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-accent)',
                                    color: '#000',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transition: 'opacity 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                SEND PROJECT BRIEF →
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* ===== SLOT MACHINE WIDGET ===== */}
                <div style={{ padding: '8rem 0 0' }}>
                    <SlotMachineWidget />
                </div>

                {/* ===== CTA BANNER ===== */}
                <div style={{
                    marginTop: '8rem',
                    padding: '8rem 2rem',
                    backgroundColor: 'var(--color-bg)',
                    position: 'relative',
                    textAlign: 'center',
                    overflow: 'hidden',
                    borderTop: '1px solid var(--color-border)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'url(/cta-bg.gif)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: isDarkMode ? 'none' : 'invert(1)',
                        opacity: 0.6,
                        zIndex: 1
                    }} />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <h3 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            color: 'var(--color-text)'
                        }}>
                            READY TO DISRUPT?
                        </h3>
                        <p style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: '3rem',
                            fontSize: '1.2rem',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            LET'S BUILD SOMETHING THE INTERNET HASN'T SEEN BEFORE.
                        </p>
                        <a href="#inquiry" style={{
                            display: 'inline-block',
                            padding: '1.5rem 4rem',
                            backgroundColor: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            boxShadow: '8px 8px 0px var(--color-accent)',
                            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                        }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translate(-4px, -4px)';
                                e.target.style.boxShadow = '12px 12px 0px var(--color-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translate(0, 0)';
                                e.target.style.boxShadow = '8px 8px 0px var(--color-accent)';
                            }}>
                            START A PROJECT
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Services;
