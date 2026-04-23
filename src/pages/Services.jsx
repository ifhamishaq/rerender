import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import servicesList from '../data/services.json';

const Services = () => {
    const { isDarkMode } = useTheme();
    const [selectedService, setSelectedService] = useState('');

    const handleServiceClick = (serviceTitle) => {
        const serviceMap = {
            'VIDEO EDITING': 'video-editing',
            'GRAPHIC DESIGN': 'graphic-design',
            '3D ANIMATION': '3d-art',
            'WEB DEVELOPMENT': 'web-development'
        };
        setSelectedService(serviceMap[serviceTitle.toUpperCase()] || 'other');
        document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
    };

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
                <header style={{ marginBottom: '4rem' }}>
                    <div className="section-label" style={{ marginBottom: '2rem' }}>01 &#8212; GET IN TOUCH</div>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 7rem)',
                        margin: 0,
                        lineHeight: 0.9,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em'
                    }}>
                        CONTACT<br />
                        <span style={{ color: 'var(--color-accent)' }}>US</span>
                    </h1>
                </header>

                {/* Compact Service Selector Buttons */}
                <div style={{ marginBottom: '6rem' }}>
                    <div style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.7rem', 
                        letterSpacing: '0.2em', 
                        marginBottom: '1.5rem',
                        opacity: 0.6
                    }}>
                        CHOOSE A SERVICE &darr;
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {servicesList.map((service, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleServiceClick(service.title)}
                                style={{
                                    position: 'relative',
                                    height: '80px',
                                    backgroundColor: 'var(--color-surface)',
                                    borderRadius: '100px', // Pill-shaped
                                    border: selectedService === (service.title.toLowerCase().replace(' ', '-')) ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                    color: 'var(--color-text)',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    padding: '0 2rem'
                                }}
                            >
                                <span style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em'
                                }}>
                                    {service.title}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* ===== INQUIRY FORM (Primary Focus) ===== */}
                <div id="inquiry" style={{ paddingTop: '4rem', borderTop: '2px solid var(--color-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem', alignItems: 'start' }}>
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
                                Tell us about your project. We'll get back to you within 24 hours with a clear price and plan for your project.
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



                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-row-mobile">
                                {[
                                    { label: 'YOUR NAME', name: 'name', type: 'text', placeholder: 'John Doe' },
                                    { label: 'EMAIL ADDRESS', name: 'email', type: 'email', placeholder: 'you@company.com' }
                                ].map(field => (
                                    <div key={field.name}>
                                        <label style={{
                                            display: 'block',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            letterSpacing: '0.1em',
                                            marginBottom: '0.75rem',
                                            color: 'var(--color-text-secondary)',
                                            opacity: 0.6
                                        }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            required
                                            placeholder={field.placeholder}
                                            style={{
                                                width: '100%',
                                                padding: '1.2rem',
                                                borderRadius: '16px',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.9rem',
                                                backgroundColor: 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                                border: '1px solid var(--color-border)',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'var(--color-accent)';
                                                e.target.style.backgroundColor = 'rgba(57, 255, 20, 0.02)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'var(--color-border)';
                                                e.target.style.backgroundColor = 'var(--color-surface)';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.75rem',
                                    color: 'var(--color-text-secondary)',
                                    opacity: 0.6
                                }}>
                                    COMPANY / BRAND (OPTIONAL)
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Your Brand"
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem',
                                        borderRadius: '16px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
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
                                    SERVICE NEEDED
                                </label>
                                <select
                                    name="service"
                                    required
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
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
                                    <option value="3d-art">3D ANIMATION</option>
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
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                style={{
                                    padding: '1.2rem',
                                    backgroundColor: 'var(--color-accent)',
                                    color: '#000',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 950,
                                    fontSize: '1rem',
                                    border: 'none',
                                    borderRadius: '100px',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginTop: '1rem'
                                }}
                            >
                                SEND INQUIRY →
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Removed SlotMachineWidget as per request to move it to a random banner in the inquiry section */}

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
                            READY TO START?
                        </h3>
                        <p style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: '3rem',
                            fontSize: '1.2rem',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            LET'S BUILD SOMETHING GREAT TOGETHER.
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
