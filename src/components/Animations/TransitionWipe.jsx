import React from 'react';
import { motion } from 'framer-motion';

/**
 * Smooth macOS-style page transition.
 * Uses a crisp, deep scale and cross-fade to mimic native app windows launching.
 */
const TransitionWipe = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.97, y: -15, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
            style={{ width: '100%', height: '100%', transformOrigin: 'center center' }}
        >
            {children}
        </motion.div>
    );
};

export default TransitionWipe;
