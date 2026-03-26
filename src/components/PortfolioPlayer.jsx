import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PortfolioPlayer = ({ videoId, title, client, id, minimal = false, aspectRatio = "16/9" }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            style={{
                position: 'relative',
                width: aspectRatio === "9/16" ? '400px' : '100%',
                margin: aspectRatio === "9/16" ? '0 auto' : '0',
                backgroundColor: '#000',
                border: '1px solid var(--color-border)',
                boxShadow: isHovered ? '20px 20px 0px rgba(255,255,255,0.02)' : 'none',
                transition: 'box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Subtle ID Mark */}
            <div style={{
                position: 'absolute',
                top: '-1px',
                right: '2rem',
                padding: '0.4rem 0.8rem',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderTop: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--color-accent)',
                zIndex: 20,
                letterSpacing: '0.2em',
                fontWeight: 900
            }}>
                ID_{id.toUpperCase()}
            </div>

            {/* Video Wrapper */}
            <div style={{
                position: 'relative',
                paddingTop: aspectRatio === "9/16" ? '177.77%' : '56.25%', // 9:16 vs 16:9
                width: '100%',
                overflow: 'hidden'
            }}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1&mute=0`}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        border: 'none',
                        filter: 'none',
                        transform: isHovered ? 'scale(1)' : 'scale(1.02)',
                        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 1
                    }}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                
                {/* Minimal Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: isHovered ? 'transparent' : 'rgba(0,0,0,0.1)',
                    pointerEvents: 'none',
                    zIndex: 2,
                    transition: 'background 0.8s ease'
                }} />
            </div>

            {/* Float Meta on Hover (Only if NOT minimal) */}
            <AnimatePresence>
                {isHovered && !minimal && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        style={{
                            position: 'absolute',
                            left: '-1.5rem',
                            bottom: '2rem',
                            padding: '1rem',
                            backgroundColor: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            zIndex: 10,
                            textTransform: 'uppercase',
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)'
                        }}
                    >
                        {client} // {id}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortfolioPlayer;
