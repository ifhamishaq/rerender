import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const Cursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Use MotionValues for high-performance updates outside of React render cycle
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Create smooth spring versions of the mouse coordinates
    const springConfig = { stiffness: 500, damping: 28, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const outerSpringConfig = { stiffness: 250, damping: 20 };
    const outerX = useSpring(mouseX, outerSpringConfig);
    const outerY = useSpring(mouseY, outerSpringConfig);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const updateMousePosition = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = 
                target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('a') || 
                target.closest('button') ||
                target.getAttribute('role') === 'button';
            
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY]);

    if (isMobile) return null;

    return (
        <>
            <style>{`
                html, body { cursor: none !important; }
                a, button, [role="button"], input, select, textarea { cursor: none !important; }
            `}</style>
            
            {/* Inner Dot */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    mixBlendMode: 'difference',
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    willChange: 'transform' // Force hardware acceleration
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 600, // Faster and snappier
                    damping: 30,
                    mass: 0.4
                }}
            />

            {/* Outer Ring */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    x: outerX,
                    y: outerY,
                    translateX: '-50%',
                    translateY: '-50%',
                    willChange: 'transform' // Force hardware acceleration
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    opacity: isHovering ? 0.5 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                }}
            />
        </>
    );
};

export default Cursor;
