import React from 'react';
import { motion } from 'framer-motion';

/**
 * Smooth editorial page transition.
 * Content fades + slides up on enter, fades + slides down on exit.
 * Fast and clean — no jarring full-screen wipe.
 */
const TransitionWipe = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
                duration: 0.45,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            {children}
        </motion.div>
    );
};

export default TransitionWipe;
