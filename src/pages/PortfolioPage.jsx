import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';
import FolderIcon from '../components/FolderIcon';
import ProjectBox from '../components/ProjectBox';
import VideoModal from '../components/VideoModal';
import StickySidebar from '../components/StickySidebar';
import './Portfolio.css';

const PortfolioPage = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ['ALL', 'MOTION', '3D', 'TALKING HEAD', 'THUMBNAIL'];

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setAllProjects(data);
        if (error) console.error('Error fetching projects:', error);
        setIsLoading(false);
    };
    
    const filteredProjects = activeCategory === 'ALL' 
        ? allProjects 
        : allProjects.filter(p => p.category === activeCategory);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setIsIdModalOpen(true);
    };

    return (
        <main className="portfolio-finder">
            <StickySidebar items={[
                { label: 'ARCHIVE', targetId: 'top' },
                { label: 'CONTACT', targetId: 'inquiry-cta' }
            ]} />

            <div id="top" style={{ maxWidth: '1400px', margin: '0 auto', padding: '8rem 2rem' }}>
                
                {/* Header / Filter Bar */}
                <header style={{ 
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '2rem',
                    marginBottom: '4rem',
                }}>
                    <div style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.7rem', 
                        opacity: 0.5, 
                        marginBottom: '1.5rem',
                        letterSpacing: '0.2em'
                    }}>
                        PATH: /STUDIO_WORKS / {activeCategory}
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-end',
                        flexWrap: 'wrap',
                        gap: '2rem'
                    }}>
                        <h1 style={{ 
                            fontFamily: 'var(--font-display)', 
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)', 
                            lineHeight: 0.8,
                            margin: 0,
                            textTransform: 'uppercase'
                        }}>
                            THE <span style={{ color: 'var(--color-accent)' }}>WORKS</span>
                        </h1>

                        <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            flexWrap: 'wrap' 
                        }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        backgroundColor: activeCategory === cat ? 'var(--color-text)' : 'transparent',
                                        color: activeCategory === cat ? 'var(--color-bg)' : 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        padding: '0.5rem 1rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: activeCategory === cat ? '4px 4px 0px var(--color-accent)' : 'none'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div style={{ 
                        height: '400px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.5em'
                    }}>
                        ACCESSING_DATABASE...
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '2.5rem',
                            padding: '1rem 0'
                        }}
                    >
                        {filteredProjects.map((project) => (
                            <ProjectBox 
                                key={project.id} 
                                project={project} 
                                onClick={() => handleProjectClick(project)}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Video Modal (Quick Look) */}
                <VideoModal 
                    isOpen={isIdModalOpen} 
                    project={selectedProject} 
                    onClose={() => setIsIdModalOpen(false)} 
                />

                {/* ===== CTA SECTION ===== */}
                <div id="inquiry-cta" style={{
                    marginTop: '15rem',
                    padding: '8rem 2rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        lineHeight: 1,
                        marginBottom: '3rem',
                        textTransform: 'uppercase'
                    }}>
                        READY TO BE <br />
                        <span style={{ color: 'var(--color-accent)' }}>OUR NEXT PROJECT?</span>
                    </h2>
                    
                    <a href="/get-in-touch" style={{
                        display: 'inline-block',
                        padding: '1.5rem 4rem',
                        backgroundColor: 'var(--color-text)',
                        color: 'var(--color-bg)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '1rem',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        boxShadow: '8px 8px 0px var(--color-accent)'
                    }}>
                        GET_STARTED
                    </a>
                </div>
            </div>
        </main>
    );
};

export default PortfolioPage;
