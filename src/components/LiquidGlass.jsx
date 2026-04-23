import React from 'react';
import { motion } from 'framer-motion';

const LiquidGlass = ({ children, className = '', style = {} }) => {
    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '32px', ...style }} className={className}>
            {/* The Background Frosted Layer — Apple Style (Hardware Accelerated) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    /** Key Apple Glass Formula: Heavy Blur + Saturation boost */
                    backdropFilter: 'blur(40px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                    /** The glass tint */
                    backgroundColor: 'rgba(30, 30, 30, 0.45)', // Works beautifully over dark media
                    /** Subtle edge light reflection (specular highlight) */
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.03), 0 24px 64px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    zIndex: -1,
                }}
            />
            
            {/* The Content above the glass */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};

export default LiquidGlass;
