import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const Magnetic = ({ children, strength = 0.5 }) => {
    const ref = useRef(null);
    
    // Use MotionValues for high-performance updates
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Apply spring smoothing directly to the motion values
    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleMouseMove = (e) => {
        if (isTouchDevice) return;
        const { clientX, clientY } = e;
        if (!ref.current) return;
        
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        const targetX = (clientX - centerX) * strength;
        const targetY = (clientY - centerY) * strength;
        
        x.set(targetX);
        y.set(targetY);
    };

    const handleMouseLeave = () => {
        if (isTouchDevice) return;
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                display: 'inline-block',
                x: springX,
                y: springY,
                willChange: 'transform' // Hardware acceleration hint
            }}
        >
            {children}
        </motion.div>
    );
};

export default Magnetic;
