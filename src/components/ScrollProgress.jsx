import React, { useState, useEffect } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const [progress, setProgress] = useState(0);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setProgress(Math.round(latest * 100));
    });

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 99,
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            color: 'var(--color-text)',
            mixBlendMode: 'difference'
        }}>
            {progress.toString().padStart(3, '0')}%
        </div>
    );
};

export default ScrollProgress;
