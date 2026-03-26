import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isPointer, setIsPointer] = useState(false);
    
    const mouseX = useSpring(0, { stiffness: 500, damping: 28 });
    const mouseY = useSpring(0, { stiffness: 500, damping: 28 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            
            const target = e.target;
            const isClickable = target.closest('button, a, input, select, textarea, [role="button"]');
            setIsPointer(!!isClickable);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: isPointer ? 60 : 20,
                height: isPointer ? 60 : 20,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: '2px solid var(--color-accent)',
                pointerEvents: 'none',
                zIndex: 9999,
                x: mouseX,
                y: mouseY,
                translateX: '-50%',
                translateY: '-50%',
                mixBlendMode: 'difference',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            animate={{
                scale: isPointer ? 1.5 : 1,
                opacity: 1
            }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        >
            {isPointer && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ 
                        width: '4px', 
                        height: '4px', 
                        backgroundColor: 'var(--color-accent)', 
                        borderRadius: '50%' 
                    }} 
                />
            )}
        </motion.div>
    );
};

export default CustomCursor;
