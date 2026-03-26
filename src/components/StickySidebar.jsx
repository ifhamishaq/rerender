import React from 'react';
import { motion } from 'framer-motion';

const StickySidebar = ({ items = [] }) => {
    if (items.length === 0) return null;

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            alignItems: 'flex-end',
            pointerEvents: 'none'
        }}>
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    style={{ pointerEvents: 'auto' }}
                >
                    <button 
                        onClick={() => scrollToSection(item.targetId)}
                        style={{
                            display: 'block',
                            padding: '1rem 0.6rem',
                            backgroundColor: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            border: '1px solid var(--color-border)',
                            borderRight: 'none',
                            boxShadow: '-4px 4px 0px var(--color-accent)',
                            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                            cursor: 'pointer',
                            letterSpacing: '0.15em',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateX(-10px)';
                            e.target.style.backgroundColor = 'var(--color-accent)';
                            e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateX(0)';
                            e.target.style.backgroundColor = 'var(--color-text)';
                            e.target.style.color = 'var(--color-bg)';
                        }}
                    >
                        {item.label}
                    </button>
                </motion.div>
            ))}
        </div>
    );
};

export default StickySidebar;
