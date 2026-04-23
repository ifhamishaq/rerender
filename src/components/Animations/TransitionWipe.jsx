import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Cinematic Curtain Page Transition.
 * Two panels split from the center to reveal the content.
 */
const TransitionWipe = ({ children }) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Left Curtain */}
            <motion.div
                initial={{ x: 0 }}
                animate={{ x: '-100%' }}
                exit={{ x: 0 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    width: '50vw',
                    backgroundColor: 'var(--color-bg)',
                    borderRight: '1px solid var(--color-accent)',
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}
            />
            
            {/* Right Curtain */}
            <motion.div
                initial={{ x: 0 }}
                animate={{ x: '100%' }}
                exit={{ x: 0 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: '50vw',
                    backgroundColor: 'var(--color-bg)',
                    borderLeft: '1px solid var(--color-accent)',
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}
            />
            
            {/* The Content Reveal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ 
                    duration: 0.6, 
                    ease: [0.33, 1, 0.68, 1],
                    delay: 0.2
                }}
                style={{ width: '100%', height: '100%', willChange: 'transform, opacity' }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default TransitionWipe;
