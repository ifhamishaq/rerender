import React from 'react';
import { motion } from 'framer-motion';

const FolderIcon = ({ label, thumbnails = [], projectCount = 0, onClick }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover="hover"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                width: '340px',
                position: 'relative',
                marginBottom: '5rem',
                userSelect: 'none'
            }}
        >
            {/* Folder Structure (Newspaper Style) */}
            <div style={{ position: 'relative', width: '300px', height: '220px' }}>
                
                {/* Back Page / Shadow Layer */}
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '10px',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-text)',
                    zIndex: 1
                }} />

                {/* Main Folder Front */}
                <motion.div 
                    variants={{
                        hover: { x: -5, y: -5 }
                    }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-text)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1.5rem',
                        boxShadow: '10px 10px 0px var(--color-text)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {/* Folder Tab */}
                    <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '-1px',
                        height: '25px',
                        width: '100px',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-text)',
                        borderBottom: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        letterSpacing: '0.1em'
                    }}>
                        SEC_{label.substring(0, 3)}
                    </div>

                    {/* Featured Thumbnail (Newspaper Photo Style / Video Preview) */}
                    <div style={{
                        width: '100%',
                        flex: 1,
                        backgroundColor: '#000',
                        border: '1px solid var(--color-text)',
                        marginBottom: '1rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
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
                                    objectFit: 'cover',
                                    filter: 'contrast(1.1) brightness(1.0)'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url("${thumbnails[0]}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'contrast(1.1) brightness(1.0)',
                            }} />
                        )}
                        
                        <div style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            padding: '0.5rem',
                            background: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5rem',
                            fontWeight: 900,
                            textAlign: 'center',
                            zIndex: 2
                        }}>
                            FIG_01: {label}_PREVIEW
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', opacity: 0.6 }}>
                            VOL.02_ISSUE.26<br/>
                            {projectCount.toString().padStart(3, '0')}_RECORDS
                        </div>
                        <div style={{ 
                            fontFamily: 'Playfair Display', 
                            fontStyle: 'italic', 
                            fontSize: '1.2rem',
                            color: 'var(--color-accent)'
                        }}>
                            Archive
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Label Section */}
            <div style={{
                marginTop: '2.5rem',
                textAlign: 'center'
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3.5rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    margin: '0',
                    lineHeight: 0.8,
                    letterSpacing: '-0.05em',
                    color: 'var(--color-text)'
                }}>
                    <span style={{ 
                        fontFamily: 'Playfair Display', 
                        fontStyle: 'italic', 
                        fontWeight: 400,
                        fontSize: '0.6em',
                        display: 'block',
                        marginBottom: '0.2rem',
                        opacity: 0.6
                    }}>the</span>
                    {label}
                </h3>
            </div>
        </motion.div>
    );
};

export default FolderIcon;
