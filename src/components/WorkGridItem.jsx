import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const WorkGridItem = ({ project, index, onClick }) => {
    const videoRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Handle Hover Playback
    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.warn('Hover playback blocked:', e));
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.muted = true;
            videoRef.current.currentTime = 0; // Reset to first frame (acts as thumbnail)
            setIsVisible(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(project)}
            style={{ 
                breakInside: 'avoid',
                marginBottom: '2rem',
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                overflow: 'hidden'
            }}
        >
                {/* Live Video Preview (Hover-Aware) */}
                <div style={{ 
                    width: '100%', 
                    aspectRatio: project.aspectRatio === '9/16' ? '9/16' : '16/9',
                    backgroundColor: '#000',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <video
                        ref={videoRef}
                        src={project.videoUrl || project.video_url}
                        preload="auto"
                        muted
                        loop
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isVisible ? 1 : 0.8,
                            filter: isVisible ? 'contrast(1.1) brightness(1.0)' : 'contrast(1.0) brightness(0.7)',
                            transition: 'all 0.5s ease'
                        }}
                    />

                    {/* Play Button Overlay */}
                    {!isVisible && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2,
                            pointerEvents: 'none',
                            color: '#fff',
                            opacity: 0.8,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    )}
                    
                    {/* Overlay removed as per user request for cleaner look */}
                </div>
        </motion.div>
    );
};

export default WorkGridItem;
