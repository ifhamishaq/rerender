import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioPlayer from './PortfolioPlayer';

const VideoModal = ({ isOpen, project, onClose }) => {
    if (!project) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        padding: '2rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: project.aspectRatio === "9/16" ? '450px' : '1000px',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            position: 'relative',
                            boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--color-border)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem'
                        }}>
                            <div>{project.id.toUpperCase()} // {project.title}</div>
                            <button 
                                onClick={onClose}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-accent)',
                                    cursor: 'pointer',
                                    fontWeight: 900
                                }}
                            >
                                CLOSE [ESC]
                            </button>
                        </div>

                        {/* Player */}
                        <div style={{ padding: '0' }}>
                            <PortfolioPlayer 
                                videoId={project.youtubeId} 
                                title={project.title} 
                                client={project.client} 
                                id={project.id}
                                minimal={true}
                                aspectRatio={project.aspectRatio}
                            />
                        </div>

                        {/* Modal Footer / Meta */}
                        <div style={{
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            opacity: 0.5
                        }}>
                            <div>CLIENT: {project.client}</div>
                            <div>YEAR: {project.year}</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoModal;
