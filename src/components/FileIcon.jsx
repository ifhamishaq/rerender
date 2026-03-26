import React from 'react';
import { motion } from 'framer-motion';

const FileIcon = ({ title, type, onClick }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1rem',
                cursor: 'pointer',
                border: '1px solid var(--color-border)',
                width: '100%',
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s ease'
            }}
        >
            {/* File Icon Visual */}
            <div style={{
                width: '40px',
                height: '50px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-text)',
                position: 'relative',
                flexShrink: 0
            }}>
                {/* Folded Corner */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'var(--color-bg)',
                    borderLeft: '1px solid var(--color-text)',
                    borderBottom: '1px solid var(--color-text)'
                }} />

                {/* Type Indicator */}
                <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    fontWeight: 900,
                    color: 'var(--color-accent)'
                }}>
                    {type.substring(0, 3).toUpperCase()}
                </div>
            </div>

            {/* Label & Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: 'var(--color-text)'
                }}>
                    {title}
                </span>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    opacity: 0.4
                }}>
                    RE-RENDER_FILE_v1.0
                </span>
            </div>
        </motion.div>
    );
};

export default FileIcon;
