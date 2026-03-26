import React, { useRef } from 'react';
import PortfolioPlayer from './PortfolioPlayer';
import { motion, useScroll, useTransform } from 'framer-motion';

const PortfolioItem = ({ project, index }) => {
    const containerRef = useRef(null);
    
    // Simple English Labels
    const labels = {
        category: "Type",
        year: "Date",
        client: "For"
    };

    return (
        <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="project-card"
            style={{
                // Staggered rotation for the "fan out" feel
                rotate: index % 2 === 0 ? '-1deg' : '1deg',
                position: 'sticky',
                top: `${100 + (index * 20)}px`, // Stacking effect
                zIndex: 10 + index
            }}
        >
            <span className="card-number">OUR WORK // 0{index + 1}</span>
            <h3 className="card-title">{project.title}</h3>
            
            <div style={{ marginBottom: '2rem' }}>
                <PortfolioPlayer 
                    videoId={project.youtubeId} 
                    title={project.title} 
                    client={project.client} 
                    id={project.id}
                    minimal={true}
                    aspectRatio={project.aspectRatio || "16/9"}
                />
            </div>

            <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                marginBottom: '2rem',
                maxWidth: '600px'
            }}>
                {project.description}
            </p>

            <div className="card-meta">
                <div>
                    <span style={{ color: 'var(--color-accent)', marginRight: '0.5rem' }}>{labels.category}:</span>
                    {project.category}
                </div>
                <div>
                    <span style={{ color: 'var(--color-accent)', marginRight: '0.5rem' }}>{labels.client}:</span>
                    {project.client}
                </div>
            </div>

            {/* Simple Tags */}
            <div style={{
                marginTop: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
            }}>
                {project.tags.map(tag => (
                    <span key={tag} style={{
                        fontSize: '0.6rem',
                        padding: '0.2rem 0.6rem',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)'
                    }}>
                        {tag}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

export default PortfolioItem;
