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
                    top: '-15px',
                    left: '0',
                    width: '100px',
                    height: '40px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px 12px 0 0',
                    border: '1px solid var(--color-border)',
                    borderBottom: 'none',
                    zIndex: 1
                }} />

                {/* The Back Plate */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    zIndex: 2,
                    boxShadow: 'var(--shadow-raised)'
                }} />

                {/* Floating Content (Video/Thumbnails) */}
                <motion.div 
                    variants={{
                        hover: { y: -20, rotateX: 5 }
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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

                {/* Glass Front Cover */}
                <motion.div 
                    variants={{
                        hover: { rotateX: -15, y: 10 }
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '1.5rem',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '0.6rem', 
                                color: 'var(--color-accent)', 
                                fontWeight: 900,
                                letterSpacing: '0.1em'
                            }}>
                                {projectCount.toString().padStart(2, '0')} FILES
                            </div>
                            <div style={{ 
                                fontFamily: 'var(--font-display)', 
                                fontSize: '1.2rem', 
                                fontWeight: 900,
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em'
                            }}>
                                {label}
                            </div>
                        </div>
                        <div style={{ opacity: 0.5 }}>
                            <ChevronRight color="#fff" size={20} />
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
