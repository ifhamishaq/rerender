import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import portfolioData from '../data/portfolio.json';
import VideoModal from './VideoModal';
import WorkGridItem from './WorkGridItem';

const PinterestWorkGrid = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchLiveProjects = async () => {
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                // Curate reels, excluding 3D and prioritizing high-impact IDs
                const curated = [...portfolioData, ...(data || [])].filter(p => 
                    (p.videoUrl || p.video_url) && 
                    p.category?.toUpperCase() !== '3D' &&
                    p.category?.toUpperCase() !== 'CGI / 3D'
                );
                
                const categories = ['ALL', 'MOTION DESIGN', 'CGI / 3D', 'BRANDING', 'SOCIAL / ADS', 'AI LAB'];
                const prioritizedIds = ['lf-01', 'mg-03', 'mg-04', 'th-02', 'th-03', 'mg-05'];
                const sorted = curated.sort((a, b) => {
                    const aIdx = prioritizedIds.indexOf(a.id);
                    const bIdx = prioritizedIds.indexOf(b.id);
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return 0;
                });

                setProjects(sorted);
            } catch (err) {
                console.error('Error fetching live projects:', err);
                setProjects(portfolioData);
            }
        };

        fetchLiveProjects();
    }, []);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    return (
        <section style={{ 
            padding: 'clamp(4rem, 12vw, 8rem) clamp(1rem, 5vw, 2rem)', 
            backgroundColor: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '5rem' }}>
                    <div className="section-label" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1.5rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.2em',
                        marginBottom: '2rem'
                    }}>
                        <span style={{ color: 'var(--color-accent)', fontWeight: 900 }}>01</span> 
                        &#8212; PORTFOLIO_SELECTION.2
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 6.5rem)',
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                        lineHeight: 0.85,
                        letterSpacing: '-0.04em'
                    }}>
                        LIVING <span className="serif-italic" style={{ color: 'var(--color-accent)', fontWeight: 400, textTransform: 'lowercase' }}>archive</span>
                    </h2>
                </div>

                {/* Pinterest Masonry Grid */}
                <div 
                    className="portfolio-masonry-grid"
                    style={{
                        columnGap: '2rem',
                        width: '100%',
                    }}
                >
                    {projects.map((project, index) => (
                        <WorkGridItem 
                            key={project.id}
                            project={project}
                            index={index}
                            onClick={handleProjectClick}
                        />
                    ))}
                </div>

                {/* View All Button */}
                <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                    <Link to="/work" style={{ 
                        display: 'inline-block',
                        padding: '1.5rem 4rem',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text)',
                        border: '2px solid var(--color-text)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        boxShadow: '8px 8px 0px var(--color-text)',
                        transition: 'all 0.2s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translate(-4px, -4px)';
                            e.target.style.boxShadow = '12px 12px 0px var(--color-text)';
                            e.target.style.backgroundColor = 'var(--color-accent)';
                            e.target.style.color = 'var(--color-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translate(0px, 0px)';
                            e.target.style.boxShadow = '8px 8px 0px var(--color-text)';
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = 'var(--color-text)';
                        }}>
                        VIEW FULL ARCHIVE
                    </Link>
                </div>
            </div>

            <VideoModal 
                isOpen={isModalOpen} 
                project={selectedProject} 
                onClose={() => setIsModalOpen(false)} 
            />
        </section>
    );
};

export default PinterestWorkGrid;
