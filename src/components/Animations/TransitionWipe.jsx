import React from 'react';
import { motion } from 'framer-motion';

/**
 * Smooth editorial page transition.
 * Content fades + slides up on enter, fades + slides down on exit.
 * Fast and clean — no jarring full-screen wipe.
 */
const TransitionWipe = ({ children }) => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear" }}
            >
                {children}
            </motion.div>

            {/* EXIT CURTAIN: Slides up from bottom to cover screen when leaving page */}
            <motion.div
                className="transition-curtain-exit"
                initial={{ scaleY: 0 }}
                exit={{ scaleY: 1 }}
                transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1]
                }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'var(--color-accent)',
                    zIndex: 9999,
                    transformOrigin: 'bottom'
                }}
            />

            {/* ENTRANCE CURTAIN: Slides up to reveal screen when arriving on page */}
            <motion.div
                className="transition-curtain-enter"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.1
                }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'var(--color-accent)',
                    zIndex: 9999,
                    transformOrigin: 'top'
                }}
            />
        </>
    );
};

export default TransitionWipe;
