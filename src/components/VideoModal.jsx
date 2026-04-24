import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioPlayer from './PortfolioPlayer';

const VideoModal = ({ isOpen, project, onClose }) => {
    if (!project) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.98)', 
                        zIndex: 9999, // ultra high
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 30, 
                            mass: 0.8 
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(90vw, calc((90vh - 40px) * ' + ((project.aspectratio || project.aspectRatio) === "9/16" ? '9/16' : '16/9') + '))',
                            position: 'relative',
                            zIndex: 10000
                        }}
                    >
                        {/* Player / Content / Image */}
                        {(project.youtubeid || project.youtubeId || project.video_url || project.videoUrl) ? (
                            <PortfolioPlayer 
                                videoId={project.youtubeid || project.youtubeId} 
                                videoUrl={project.video_url || project.videoUrl}
                                title={project.title} 
                                client={project.client} 
                                id={project.id}
                                minimal={true}
                                aspectRatio={project.aspectratio || project.aspectRatio}
                                onClose={onClose}
                            />
                        ) : (
                            <motion.img 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={project.thumbnail} 
                                alt={project.title}
                                style={{ 
                                    width: '100%', 
                                    height: 'auto', 
                                    display: 'block',
                                    maxHeight: '85vh',
                                    objectFit: 'contain',
                                    borderRadius: '12px',
                                    boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
                                }}
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default VideoModal;
