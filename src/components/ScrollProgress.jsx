import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    
    // Create a smooth motion value for the number display
    const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <motion.div style={{
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
            <motion.span>
                {/* We use a simple motion span with custom rendering for performance */}
                <Counter value={progress} />
            </motion.span>%
        </motion.div>
    );
};

const Counter = ({ value }) => {
    const [display, setDisplay] = React.useState("000");

    React.useEffect(() => {
        return value.on("change", (v) => {
            setDisplay(Math.round(v).toString().padStart(3, '0'));
        });
    }, [value]);

    return <>{display}</>;
};

export default ScrollProgress;
