import React from 'react';
import { motion } from 'framer-motion';

const FolderIcon = ({ label, thumbnails = [], onClick }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                width: '320px',
                position: 'relative',
                marginBottom: '4rem'
            }}
        >
            {/* Fanned Thumbnails Background */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                marginBottom: '-60px', // Overlap with folder front
                zIndex: 1
            }}>
                {thumbnails.slice(0, 3).map((thumb, i) => (
                    <motion.div
                        key={i}
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: (i - 1) * 15, x: (i - 1) * 30, y: -20 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            width: '140px',
                            height: '180px',
                            backgroundColor: '#111',
                            backgroundImage: `url(${thumb})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '3px solid #fff',
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            transform: `translateX(-50%) rotate(${(i - 1) * 8}deg) translateX(${(i - 1) * 20}px)`,
                            zIndex: 3 - i,
                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    />
                ))}
            </div>

            {/* Folder Front (Glassmorphism) */}
            <div style={{
                position: 'relative',
                width: '280px',
                height: '180px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px) saturate(150%)',
                WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
                {/* Interaction Arrow */}
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.2rem',
                    transition: 'all 0.3s ease'
                }}>
                    ↗
                </div>

                {/* Bottom Tag Line */}
                <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    height: '1px',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                }} />
            </div>

            {/* Label Section */}
            <div style={{
                marginTop: '1.5rem',
                textAlign: 'center'
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    margin: '0',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: 'var(--color-text)'
                }}>
                    {label}
                </h3>
                <div style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.3rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    opacity: 0.5,
                    letterSpacing: '0.1em'
                }}>
                    2025 // ARCHIVE
                </div>
            </div>
        </motion.div>
    );
};

export default FolderIcon;
