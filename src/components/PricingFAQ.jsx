import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import faqData from '../data/pricing-faq.json';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '2rem 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--color-text)',
                    transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                <h3 style={{ 
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)', 
                    fontWeight: 900, 
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    margin: 0
                }}>
                    {question}
                </h3>
                <div style={{ color: 'var(--color-accent)' }}>
                    {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p style={{
                            fontSize: '1rem',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1.6,
                            color: 'var(--color-text-secondary)',
                            paddingBottom: '2rem',
                            maxWidth: '800px',
                            margin: 0
                        }}>
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PricingFAQ = () => {
    return (
        <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '4rem' }}>
                    <div className="section-label">FREQUENTLY ASKED QUESTIONS</div>
                    <h2 style={{ 
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
                        fontWeight: 900, 
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        marginTop: '1rem'
                    }}>
                        SOLVING YOUR<br /> <span style={{ color: 'var(--color-accent)' }}>DOUBTS.</span>
                    </h2>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                    {faqData.map((item, index) => (
                        <FAQItem key={index} {...item} />
                    ))}
                </div>
                
                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        STILL HAVE QUESTIONS? <a href="mailto:real.re.render@gmail.com" style={{ color: 'var(--color-accent)', textDecoration: 'none', borderBottom: '1px solid var(--color-accent)' }}>EMAIL OUR TEAM</a>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PricingFAQ;
