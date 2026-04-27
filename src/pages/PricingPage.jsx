import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ProjectEstimator from '../components/ProjectEstimator';
import PricingFAQ from '../components/PricingFAQ';
import StickySidebar from '../components/StickySidebar';

const PricingPage = () => {
    const { isDarkMode } = useTheme();

    return (
        <main style={{
            paddingTop: '8rem',
            paddingBottom: '2rem',
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
                    <div className="section-label" style={{ marginBottom: '2rem' }}>02 &#8212; OUR PRICES</div>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 7rem)',
                        margin: 0,
                        lineHeight: 0.9,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em'
                    }}>
                        OUR<br />
                        <span style={{ color: 'var(--color-accent)' }}>PRICING</span>
                    </h1>
                </header>

                {/* ===== PRICING SECTION ===== */}
                <div>
                    <div style={{ marginBottom: '4rem' }}>
                        <p style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-secondary)',
                            fontSize: '1rem',
                            maxWidth: '600px',
                            lineHeight: 1.6
                        }}>
                            Transparent starting rates. Every project is custom — use these as a baseline and reach out via the Get In Touch page for a tailored quote. We do not use cheap templates. We build custom websites and designs.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                            {
                                tier: 'STARTER',
                                price: 'From $150',
                                desc: 'Perfect for solo creators and small deliverables.',
                                features: ['1 deliverable', '2 revisions', 'Basic design'],
                                highlight: false
                            },
                            {
                                tier: 'ORACLE PRO',
                                price: '$50',
                                desc: 'LIFETIME access to professional AI Design tools in the Lab.',
                                features: ['No watermarks forever', '4K High-Res Exports', 'All aspect ratios unlocked', 'Pay via PayPal or Wise'],
                                highlight: true,
                                buttonText: 'GET LIFETIME PRO →',
                                link: 'https://www.paypal.com/paypalme/ImadWani96/50'
                            },
                            {
                                tier: 'STUDIO',
                                price: 'Custom',
                                desc: 'Full-scale campaigns and long-term partnerships.',
                                features: ['Dedicated studio time', 'NDA available', 'Monthly retainer option'],
                                highlight: false
                            }
                        ].map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                style={{
                                    border: plan.highlight ? `2px solid var(--color-accent)` : '1px solid var(--color-border)',
                                    backgroundColor: plan.highlight ? 'var(--color-accent)' : 'var(--color-surface)',
                                    padding: '3rem 2.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                {plan.highlight && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-1px',
                                        right: '1.5rem',
                                        backgroundColor: '#000',
                                        color: 'var(--color-accent)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        padding: '0.25rem 0.75rem',
                                        letterSpacing: '0.1em'
                                    }}>
                                        MOST POPULAR
                                    </span>
                                )}
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.15em',
                                    marginBottom: '1rem',
                                    color: plan.highlight ? '#000' : 'var(--color-text-secondary)'
                                }}>
                                    {plan.tier}
                                </div>
                                <div style={{
                                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                                    fontWeight: 900,
                                    fontFamily: 'var(--font-sans)',
                                    lineHeight: 1,
                                    marginBottom: '1rem',
                                    color: plan.highlight ? '#000' : 'var(--color-text)'
                                }}>
                                    {plan.price}
                                </div>
                                <p style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.6,
                                    marginBottom: '2rem',
                                    color: plan.highlight ? 'rgba(0,0,0,0.75)' : 'var(--color-text-secondary)',
                                    flexGrow: 1
                                }}>
                                    {plan.desc}
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {plan.features.map((f, fi) => (
                                        <li key={fi} style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.85rem',
                                            color: plan.highlight ? '#000' : 'var(--color-text)',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem'
                                        }}>
                                            <span style={{ color: plan.highlight ? '#000' : 'var(--color-accent)', fontWeight: 'bold', marginTop: '-2px' }}>✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href={plan.link || "/get-in-touch#inquiry"}
                                    target={plan.link ? "_blank" : "_self"}
                                    rel={plan.link ? "noopener noreferrer" : ""}
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '1rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        textDecoration: 'none',
                                        border: plan.highlight ? '2px solid #000' : '1px solid var(--color-text)',
                                        backgroundColor: plan.highlight ? '#000' : 'transparent',
                                        color: plan.highlight ? 'var(--color-accent)' : 'var(--color-text)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!plan.highlight) {
                                            e.currentTarget.style.backgroundColor = 'var(--color-text)';
                                            e.currentTarget.style.color = 'var(--color-bg)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!plan.highlight) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--color-text)';
                                        }
                                    }}
                                >
                                    {plan.buttonText || 'START A PROJECT →'}
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>

            <StickySidebar items={[
                { label: 'TOP', targetId: 'pricing-top' },
                { label: 'TIERS', targetId: 'pricing-tiers' },
                { label: 'ESTIMATOR', targetId: 'estimator' },
                { label: 'FAQ', targetId: 'faq' }
            ]} />

            <div id="pricing-top" />
            
            <section id="pricing-tiers" style={{ padding: '6rem 2rem' }}>
                {/* ... existing tiers section ... */}
            </section>

            <div id="estimator">
                <ProjectEstimator />
            </div>

            <div id="faq">
                <PricingFAQ />
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
                        <a href="/get-in-touch#inquiry" style={{
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
                            INQUIRE NOW
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PricingPage;
