import React from 'react';
import { motion } from 'framer-motion';

const LabPill = ({ active, onClick, children, accentColor = 'var(--color-text)' }) => (
    <motion.button
        whileHover={{ backgroundColor: active ? accentColor : 'rgba(0,0,0,0.05)' }}
        onClick={onClick}
        style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '100px',
            backgroundColor: active ? accentColor : 'transparent',
            color: active ? 'var(--color-bg)' : 'var(--color-text)',
            border: `1.5px solid ${active ? accentColor : 'var(--color-text)'}`,
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
        }}
    >
        {typeof children === 'string' ? children.toUpperCase() : children}
    </motion.button>
);

export default LabPill;
