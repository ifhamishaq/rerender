import React from 'react';
import { motion } from 'framer-motion';

const FolderIcon = ({ label, thumbnails = [], onClick }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover="hover"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                width: '320px',
                position: 'relative',
                marginBottom: '4rem',
                userSelect: 'none'
            }}
        >
            {/* Fanned Thumbnails Background */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                marginBottom: '-50px', 
                zIndex: 1,
                display: 'flex',
                justifyContent: 'center'
            }}>
                {thumbnails.slice(0, 3).map((thumb, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hover: { 
                                rotate: (i - 1) * 15, 
                                x: (i - 1) * 45,
                                y: -30,
                                scale: 1.1
                            }
                        }}
                        style={{
                            position: 'absolute',
                            width: '130px',
                            height: '180px',
                            backgroundColor: '#000',
                            backgroundImage: `url(${thumb})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                            transform: `rotate(${(i - 1) * 7}deg) translateX(${(i - 1) * 15}px)`,
                            zIndex: i === 1 ? 5 : 3,
                            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                            filter: i !== 1 ? 'brightness(0.6)' : 'none'
                        }}
                    />
                ))}
            </div>

            {/* Folder Front (Brutalist Glass) */}
            <motion.div 
                variants={{
                    hover: { y: -5, borderColor: 'var(--color-accent)' }
                }}
                style={{
                    position: 'relative',
                    width: '280px',
                    height: '160px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                    overflow: 'hidden'
                }}
            >
                {/* Tech Detail: Scanning Line */}
                <motion.div 
                    animate={{ top: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', left: 0, right: 0, height: '1px',
                        background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                        opacity: 0.1
                    }}
                />

                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.2em',
                    fontWeight: 900
                }}>
                    STDU_DATA_STREAM//
                </div>

                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    boxShadow: '0 0 10px var(--color-accent)'
                }} />
            </motion.div>

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
                    lineHeight: 0.8,
                    letterSpacing: '-0.05em',
                    color: 'var(--color-text)'
                }}>
                    {label}
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginTop: '0.75rem'
                }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', opacity: 0.3, letterSpacing: '0.2em' }}>
                        ID: {label.substring(0, 3)}/2025
                    </span>
                    <span style={{ width: '30px', height: '1px', backgroundColor: 'var(--color-accent)', opacity: 0.5 }}></span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-accent)', fontWeight: 900 }}>
                        OPEN_DIR
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default FolderIcon;
