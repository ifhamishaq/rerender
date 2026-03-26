import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
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

            {/* Our Approach Section */}
            <section id="approach" style={{
                padding: '8rem 2rem',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-label">01 &#8212; HOW WE WORK</div>
                    <FadeUp blur>
                        <motion.h2
                            style={{
                                fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                                lineHeight: 0.9,
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 900,
                                margin: 0,
                                textTransform: 'uppercase'
                            }}
                        >
                            WE BUILD <br />
                            <span style={{ color: 'var(--color-accent)' }}>WHAT'S NEXT.</span>
                        </motion.h2>
                    </FadeUp>
                    <FadeUp delay={0.15}>
                        <motion.p
                            style={{
                                marginTop: '3rem',
                                fontSize: '1.25rem',
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                color: 'var(--color-text-secondary)'
                            }}
                        >
                            We don't use templates. We build custom, high-quality digital experiences that help your brand stand out.
                        </motion.p>
                    </FadeUp>
                </div>
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

            {/* ===== WORK SHOWCASE PREVIEW ===== */}
            <section id="work" style={{
                padding: '8rem 2rem',
                backgroundColor: 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-label" style={{ marginBottom: '2rem' }}>
                        <span style={{ color: 'var(--color-accent)' }}>03</span> &#8212; OUR BEST WORK
                    </div>
                                       <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '6rem',
                        alignItems: 'center',
                        marginBottom: '6rem'
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: 'clamp(3rem, 8vw, 6rem)',
                                fontFamily: 'var(--font-display)',
                                margin: '0 0 2rem 0',
                                textTransform: 'uppercase',
                                lineHeight: 0.8,
                                letterSpacing: '-0.06em'
                            }}>
                                THE PROJECT<br />
                                <span style={{ color: 'var(--color-accent)' }}>FOLDER</span>
                            </h2>
                            <p style={{
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.8,
                                marginBottom: '2.5rem',
                                maxWidth: '400px',
                                fontSize: '0.9rem'
                            }}>
                                Here is the best stuff we have made for our customers. We make things that look great and work well.
                            </p>
                            <Link to="/work" style={{
                                display: 'inline-block',
                                padding: '1rem 0',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-mono)',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                letterSpacing: '0.2em',
                                borderBottom: '2px solid var(--color-accent)'
                            }}>
                                SEE MORE &rarr;
                            </Link>
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                backgroundImage: 'url(/hero.gif)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'grayscale(1) contrast(1.1)'
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: '-1rem',
                                right: '2rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-accent)',
                                fontWeight: 900,
                                fontSize: '0.6rem'
                            }}>
                                CURRENT_FEATURE // 001
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SHOP PREVIEW ===== */}
            <section id="shop" style={{
                padding: '8rem 2rem',
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <div className="section-label">04 &#8212; FROM THE SHOP</div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            marginBottom: '3rem',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }} className="responsive-shop-header">
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                fontWeight: 900,
                                lineHeight: 1,
                                letterSpacing: '-0.02em',
                                margin: 0,
                            }}>
                                DIGITAL
                                <span style={{ color: 'var(--color-accent)' }}>ASSETS</span>
                            </h2>
                            <Link to="/shop" style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                color: 'var(--color-text-secondary)',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                                borderBottom: '1px solid var(--color-border)',
                                paddingBottom: '2px',
                                transition: 'color 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = 'var(--color-text)';
                                    e.currentTarget.style.borderColor = 'var(--color-text)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                }}
                            >
                                VIEW ALL &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="responsive-shop-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1.5px',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden',
                    }}>
                        {products.slice(0, 4).map((product, i) => (
                            <FadeUp key={product.id} delay={i * 0.08}>
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                                >
                                    <motion.div
                                        whileHover={{ backgroundColor: 'var(--color-surface)' }}
                                        style={{
                                            backgroundColor: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            padding: '0',
                                            cursor: 'pointer',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '1 / 1',
                                            overflow: 'hidden',
                                            borderBottom: '1px solid var(--color-border)',
                                            backgroundColor: product.color || 'var(--color-surface)',
                                        }}>
                                            {product.image && (
                                                <motion.img
                                                    src={product.image}
                                                    alt={product.title}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.4 }}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        display: 'block',
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div style={{ padding: '1.25rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem',
                                            }}>
                                                <span style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.65rem',
                                                    letterSpacing: '0.15em',
                                                    color: 'var(--color-text-secondary)',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {product.category}
                                                </span>
                                                <span style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: product.price === 'FREE' ? 'var(--color-accent)' : 'var(--color-text)',
                                                    letterSpacing: '0.05em',
                                                }}>
                                                    {product.price}
                                                </span>
                                            </div>
                                            <h3 style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                color: 'var(--color-text)',
                                                margin: '0 0 0.4rem',
                                                lineHeight: 1.3,
                                            }}>
                                                {product.title}
                                            </h3>
                                            <p style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.75rem',
                                                color: 'var(--color-text-secondary)',
                                                lineHeight: 1.5,
                                                margin: 0,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}>
                                                {product.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                </a>
                            </FadeUp>
                        ))}
                    </div>
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
