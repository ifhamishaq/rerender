import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const FolderIcon = ({ label, thumbnails = [], projectCount = 0, onClick }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover="hover"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                width: '320px',
                position: 'relative',
                marginBottom: '5rem',
                userSelect: 'none',
                perspective: '1000px'
            }}
        >
            {/* Apple Folder Structure */}
            <div style={{ position: 'relative', width: '280px', height: '220px' }}>
                
                {/* Back Layer (The Folder Tab Shell) */}
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '20px',
                    width: '80px',
                    height: '20px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid var(--color-border)',
                    borderBottom: 'none',
                    zIndex: 1
                }} />

                {/* The Back Plate */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    zIndex: 2,
                    boxShadow: 'var(--shadow-raised)'
                }} />

                {/* Floating Content (Video/Thumbnails) */}
                <motion.div 
                    variants={{
                        hover: { y: -45, rotateX: 10, scale: 1.05 }
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        right: '15px',
                        bottom: '40px',
                        backgroundColor: '#000',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        zIndex: 5,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {(thumbnails[0]?.toLowerCase().endsWith('.mp4') || thumbnails[0]?.includes('framerusercontent.com')) ? (
                        <video 
                            src={thumbnails[0]}
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url("${thumbnails[0]}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                    )}

                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8))'
                    }} />
                </motion.div>

                {/* Glass Front Cover (The Pocket) */}
                <motion.div 
                    variants={{
                        hover: { rotateX: -25, y: 15 }
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%', // Lowered for more preview visibility
                        background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)', // Subtle Mac Blue tint
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: '0 0 24px 24px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderTop: '2px solid rgba(0, 102, 255, 0.5)', // Iconic Mac Blue top-light bar
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '1.2rem',
                        boxShadow: '0 -10px 40px rgba(0, 102, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '0.55rem', 
                                color: '#0066FF', // Mac Accent Blue
                                fontWeight: 900,
                                letterSpacing: '0.15em',
                                marginBottom: '0.2rem'
                            }}>
                                {projectCount.toString().padStart(2, '0')}_NODES
                            </div>
                            <div style={{ 
                                fontFamily: 'var(--font-display)', 
                                fontSize: '1.1rem', 
                                fontWeight: 900,
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                lineHeight: 1
                            }}>
                                {label}
                            </div>
                        </div>
                        <div style={{ opacity: 0.8 }}>
                            <ChevronRight color="var(--color-accent)" size={18} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Subtitle / Path */}
            <div style={{
                marginTop: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                opacity: 0.4,
                letterSpacing: '0.2em'
            }}>
                ~/RE_RENDER/ARCHIVE/{label.replace(' ', '_')}
            </div>
        </motion.div>
    );
};

export default FolderIcon;
