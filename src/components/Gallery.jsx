import React from 'react';
import { motion } from 'framer-motion';

const prompts = [
    { id: 1, title: 'CYBER_GOTH', color: '#FF0055' },
    { id: 2, title: 'NEON_NOIR', color: '#00CCFF' },
    { id: 3, title: 'ACID_RAVE', color: '#CCFF00' },
    { id: 4, title: 'DATA_MOS', color: '#FF3300' },
    { id: 5, title: 'GLITCH_CORE', color: '#9933FF' },
    { id: 6, title: 'VAPOR_WAVE', color: '#00FF99' },
];

const Gallery = () => {
    return (
        <section id="gallery" style={{
            padding: '6rem 2rem',
            backgroundColor: '#f5f5f5',
        }}>
            <h2 style={{
                fontSize: 'clamp(2rem, 5vw, 6rem)',
                marginBottom: '4rem',
                textAlign: 'right', // Asymmetrical
                borderBottom: '2px solid var(--color-text)',
                paddingBottom: '1rem',
                width: 'fit-content',
                marginLeft: 'auto'
            }}>
                PROMPTS_GALLERY
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
            }}>
                {prompts.map((prompt, index) => (
                    <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 0.98 }}
                        style={{
                            aspectRatio: '1',
                            backgroundColor: '#121212',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Placeholder Visuals */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `linear-gradient(45deg, ${prompt.color} 25%, transparent 25%, transparent 50%, ${prompt.color} 50%, ${prompt.color} 75%, transparent 75%, transparent)`,
                            backgroundSize: '20px 20px',
                            opacity: 0.1
                        }}></div>

                        <div style={{
                            zIndex: 1,
                            textAlign: 'center',
                            border: `2px solid ${prompt.color}`,
                            padding: '1rem',
                            backgroundColor: 'rgba(0,0,0,0.8)'
                        }}>
                            <h3 style={{
                                color: prompt.color,
                                fontFamily: 'var(--font-mono)',
                                fontSize: '1.5rem'
                            }}>
                                {prompt.title}
                            </h3>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '1rem',
                                right: '1rem',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem'
                            }}
                        >
                            [VIEW_DETAILS]
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Gallery;
