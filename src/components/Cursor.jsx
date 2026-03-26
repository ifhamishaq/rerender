import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const Cursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Use MotionValues for high-performance updates outside of React render cycle
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Create smooth spring versions of the mouse coordinates
    const springConfig = { stiffness: 600, damping: 32, mass: 0.4 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const outerSpringConfig = { stiffness: 550, damping: 35, mass: 0.3 };
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
            {/* Removed the cursor:none override to enhance accessibility and precision for users */}
            
            {/* Inner Dot */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    mixBlendMode: 'difference',
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%',
                    willChange: 'transform'
                }}
            />

            {/* Outer Ring / Interaction Feedback */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--color-accent)',
                    borderRadius: isHovering ? '4px' : '50%',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    mixBlendMode: 'difference',
                    x: outerX,
                    y: outerY,
                    translateX: '-50%',
                    translateY: '-50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    willChange: 'transform'
                }}
                animate={{
                    width: isHovering ? 80 : 40,
                    height: isHovering ? 30 : 40,
                    opacity: 1,
                    rotate: isHovering ? 0 : 45
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                }}
            >
                {isHovering && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5rem',
                            fontWeight: 900,
                            color: 'var(--color-accent)',
                            letterSpacing: '0.1em'
                        }}
                    >
                        [ VIEW ]
                    </motion.span>
                )}
            </motion.div>
        </>
    );
};

export default Cursor;
