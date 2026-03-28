import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import portfolioData from '../data/portfolio.json';
import VideoModal from './VideoModal';

const ProjectMarquee = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const contentRef = useRef(null);
    const [totalWidth, setTotalWidth] = useState(0);

    const { scrollYProgress } = useScroll();
    const xParallax = useTransform(scrollYProgress, [0, 1], [100, -100]);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (contentRef.current) {
            setTotalWidth(contentRef.current.scrollWidth / 2);
        }
    }, [projects]);

    const fetchProjects = async () => {
        try {
            // Only use Mihir's new high-end video reels for the Home Selection
            // Remove 3D videos as requested
            const newReels = portfolioData.filter(p => 
                (p.videoUrl || p.video_url) && 
                p.category?.toUpperCase() !== '3D'
            );
            
            // Explicitly prioritize Mihir's specific IDs if they exist
            const prioritizedIds = ['lf-01', 'mg-03', 'mg-04', 'th-02', 'th-03'];
            const sortedReels = [...newReels].sort((a, b) => {
                const aIdx = prioritizedIds.indexOf(a.id);
                const bIdx = prioritizedIds.indexOf(b.id);
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                return 0;
            });

            setProjects(sortedReels);
        } catch (err) {
            console.error('Marquee Fetch Error:', err);
            setProjects([]);
        }
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    if (projects.length === 0) return null;

    const displayProjects = [...projects, ...projects];

    return (
        <section style={{ 
            backgroundColor: 'var(--color-bg)',
            position: 'relative',
            padding: '10rem 0',
            overflow: 'hidden',
            borderBottom: '1px solid var(--color-border)'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', width: '100%', marginBottom: '4rem' }}>
                <div className="section-label" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em'
                }}>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 900 }}>01</span> 
                    &#8212; PORTFOLIO_SELECTION.2
                </div>
            </div>

            <motion.div 
                style={{ 
                    position: 'relative', 
                    width: '100%',
                    x: xParallax
                }}
            >
                <motion.div
                    ref={contentRef}
                    animate={{ x: [0, -totalWidth] }}
                    transition={{
                        repeat: Infinity,
                        duration: 40,
                        ease: "linear"
                    }}
                    style={{ 
                        display: 'flex', 
                        gap: '2.5rem', 
                        padding: '0 1rem',
                        width: 'fit-content'
                    }}
                >
                    {displayProjects.map((project, index) => (
                        <motion.div 
                            key={`${project.id}-${index}`}
                            whileHover={{ scale: 1.02, y: -5 }}
                            onClick={() => handleProjectClick(project)}
                            style={{ 
                                flexShrink: 0, 
                                width: '550px', 
                                aspectRatio: '16/9',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
                            }}
                        >
                            {/* Live Preview (Video) or Static Thumbnail */}
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
                                {(project.videoUrl || project.video_url) ? (
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
                                            opacity: 0.9,
                                            filter: 'contrast(1.1) brightness(1.0)'
                                        }}
                                    />
                                ) : (
                                    <img 
                                        src={project.thumbnail} 
                                        alt={project.title} 
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover', 
                                            opacity: 0.9,
                                            filter: 'contrast(1.0) brightness(1.0)'
                                        }} 
                                    />
                                )}
                            </div>
                            
                            {/* Editorial Overlay */}
                            <div style={{ 
                                position: 'absolute', 
                                bottom: 0, left: 0, right: 0, 
                                padding: '2rem', 
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                                color: '#fff',
                                zIndex: 2
                            }}>
                                <div style={{ 
                                    fontFamily: 'var(--font-mono)', 
                                    fontSize: '0.6rem', 
                                    color: 'var(--color-accent)', 
                                    marginBottom: '0.5rem',
                                    letterSpacing: '0.1em'
                                }}>
                                    {project.category?.toUpperCase()} // {project.id?.toUpperCase()}
                                </div>
                                <div style={{ 
                                    fontFamily: 'var(--font-display)', 
                                    fontSize: '1.25rem', 
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    lineHeight: 1
                                }}>
                                    {project.title.replace(/_/g, ' ')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <div style={{ marginTop: '6rem', display: 'flex', justifyContent: 'center' }}>
                <Link to="/work" style={{ 
                    padding: '1rem 3rem',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 10px 30px rgba(var(--color-accent-rgb), 0.3)'
                }}>
                    EXPLORE FULL ARCHIVE
                </Link>
            </div>

            <VideoModal 
                isOpen={isModalOpen} 
                project={selectedProject} 
                onClose={() => setIsModalOpen(false)} 
            />
        </section>
    );
};

export default ProjectMarquee;
