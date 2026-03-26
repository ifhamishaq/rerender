import React from 'react';
import { motion } from 'framer-motion';

const ProjectBox = ({ project, onClick }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
        >
            {/* Thumbnail */}
            <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${project.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.5s ease'
            }} />

            {/* Hover Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
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
