import React from 'react';
import { motion } from 'framer-motion';

/**
 * FadeUp — Reusable scroll-reveal wrapper.
 * Wraps any content in a motion.div that fades + slides up when it enters the viewport.
 *
 * Props:
 *   delay    — stagger delay in seconds (default 0)
 *   duration — animation duration in seconds (default 0.6)
 *   distance — how far it slides up in px (default 40)
 *   blur     — whether to blur in (default false)
 */
const FadeUp = ({ children, delay = 0, duration = 0.6, distance = 40, blur = false, style = {} }) => {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: distance,
                filter: blur ? 'blur(6px)' : 'blur(0px)',
            }}
            whileInView={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
            }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export default FadeUp;
