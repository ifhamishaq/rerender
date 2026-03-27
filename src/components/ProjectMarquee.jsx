import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import VideoModal from './VideoModal';

const ProjectMarquee = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const contentRef = useRef(null);
    const [totalWidth, setTotalWidth] = useState(0);

    // Parallax effect on scroll for the marquee container
    const { scrollYProgress } = useScroll();
    const xParallax = useTransform(scrollYProgress, [0, 1], [100, -100]);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (contentRef.current) {
            setTotalWidth(contentRef.current.scrollWidth / 2); // Divide by 2 because we double for infinite loop
        }
    }, [projects]);

    const fetchProjects = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*');
        
        if (data) {
            const motion = data.find(p => p.category?.toUpperCase() === 'MOTION');
            const g01 = data.find(p => p.title?.toUpperCase().includes('GAMING_THUMBNAIL_01'));
            const td = data.find(p => p.category?.toUpperCase() === '3D');
            const l02 = data.find(p => p.title?.toUpperCase().includes('LIFESTYLE_THUMBNAIL_02'));
            const th = data.find(p => p.category?.toUpperCase() === 'TALKING HEAD');

            const curated = [motion, g01, td, l02, th].filter(Boolean);
            setProjects(curated);
        }
        if (error) console.error('Error fetching curated projects:', error);
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    if (projects.length === 0) return null;

    // Double the projects for infinite loop
    const displayProjects = [...projects, ...projects];

    return (
        <section style={{ 
            backgroundColor: 'var(--color-bg)',
            position: 'relative',
            padding: '10rem 0',
            overflow: 'hidden',
            borderBottom: '1px solid var(--color-border)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%', marginBottom: '4rem' }}>
                <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--color-accent)' }}>01</span> 
                    &#8212; PORTFOLIO_SELECTION.26
                </div>
            </div>

            <motion.div 
                style={{ 
                    position: 'relative', 
                    width: '100%',
                    x: xParallax // Subtle horizontal shift on scroll
                }}
            >
                <motion.div
                    ref={contentRef}
                    animate={{ x: [0, -totalWidth] }}
                    transition={{
                        repeat: Infinity,
                        duration: 35, // Slow marquee
                        ease: "linear"
                    }}
                    style={{ 
                        display: 'flex', 
                        gap: '2rem', 
                        padding: '0 1rem',
                        width: 'fit-content'
                    }}
                >
                    {displayProjects.map((project, index) => (
                        <motion.div 
                            key={`${project.id}-${index}`}
                            whileHover={{ scale: 1.05, y: -10 }}
                            onClick={() => handleProjectClick(project)}
                            style={{ 
                                flexShrink: 0, 
                                width: '450px', 
                                aspectRatio: '16/9',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            <img 
                                src={project.thumbnail} 
                                alt={project.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                            />
                            
                            <div style={{ 
                                position: 'absolute', 
                                bottom: 0, left: 0, right: 0, 
                                padding: '1.5rem', 
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                                color: '#fff',
                                zIndex: 2
                            }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.4rem' }}>
                                    {project.category.toUpperCase()}
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900 }}>
                                    {project.title.toUpperCase()}
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
