import React from 'react';
import { motion } from 'framer-motion';

const ProjectBox = ({ project, onClick }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '32px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Thumbnail / Video Preview */}
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                position: 'relative'
            }}>
                {project.videoUrl || project.video_url ? (
                    <video
                        src={project.videoUrl || project.video_url}
                        muted
                        loop
                        playsInline
                        autoPlay
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'grayscale(1) contrast(1.1) brightness(0.7)'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${project.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.5s ease'
                    }} />
                )}
            </div>

            {/* Hover Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                    fontSize: '1.2rem',
                    marginBottom: '1rem'
                }}>
                    ▶
                </div>
                <h4 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: 'white',
                    margin: 0
                }}>
                    {project.title}
                </h4>
            </motion.div>
        </motion.div>
    );
};

export default ProjectBox;
