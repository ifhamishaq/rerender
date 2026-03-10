import React from 'react';
import { motion } from 'framer-motion';

const wipeVariants = {
    initial: {
        x: '100%',
    },
    animate: {
        x: '100%',
        transition: {
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1]
        }
    },
    exit: {
        x: '0%',
        transition: {
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1]
        }
    }
};

const secondaryWipeVariants = {
    initial: {
        x: '100%',
    },
    animate: {
        x: '-100%',
        transition: {
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
            delay: 0.1
        }
    },
    exit: {
        x: '0%',
        transition: {
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
            delay: 0.1
        }
    }
};

const TransitionWipe = ({ children }) => {
    return (
        <div style={{ position: 'relative' }}>
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={wipeVariants}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#121212',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    transformOrigin: 'left'
                }}
            />
            {/* Secondary Accent Wipe */}
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={secondaryWipeVariants}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'var(--color-accent)',
                    zIndex: 9998,
                    pointerEvents: 'none',
                    transformOrigin: 'left'
                }}
            />
            {children}
        </div>
    );
};

export default TransitionWipe;
