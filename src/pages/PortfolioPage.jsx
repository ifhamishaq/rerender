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
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ['MOTION', '3D', 'TALKING HEAD', 'THUMBNAIL'];

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
    
    const getProjectsByCategory = (cat) => allProjects.filter(p => p.category === cat);

    const handleFolderClick = (cat) => {
        setSelectedFolder(cat);
    };

    const handleBack = () => {
        setSelectedFolder(null);
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setIsIdModalOpen(true);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <main className="portfolio-finder">
            <StickySidebar items={[
                { label: 'DESKTOP', targetId: 'top' },
                { label: 'CONTACT', targetId: 'inquiry-cta' }
            ]} />

            <div id="top" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10rem 2rem' }}>
                
                {/* Finder Header / Breadcrumbs */}
                <header style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '1rem',
                    marginBottom: '4rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {selectedFolder && (
                            <button 
                                onClick={handleBack}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text)',
                                    padding: '0.3rem 0.8rem',
                                    cursor: 'pointer',
                                    fontSize: '0.6rem'
                                }}
                            >
                                ← BACK
                            </button>
                        )}
                        <div style={{ opacity: 0.5, letterSpacing: '0.1em' }}>
                            PATH: /STUDIO_WORKS{selectedFolder ? `/${selectedFolder.toUpperCase()}` : ''}
                        </div>
                    </div>
                    <div style={{ fontWeight: 900, color: 'var(--color-accent)' }}>
                        RE-RENDER OS v2.0
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ 
                                height: '400px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-accent)',
                                fontSize: '0.8rem',
                                letterSpacing: '0.5em'
                            }}
                        >
                            LOADING_DATABASE...
                        </motion.div>
                    ) : !selectedFolder ? (
                        /* Root View: Folders Grid */
                        <motion.div 
                            key="root"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4rem',
                                justifyContent: 'center',
                                padding: '4rem 0'
                            }}
                        >
                            {categories.map(cat => (
                                <FolderIcon 
                                    key={cat}
                                    label={cat.toUpperCase()}
                                    thumbnails={getProjectsByCategory(cat).map(p => p.thumbnail)}
                                    onClick={() => handleFolderClick(cat)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        /* Folder View: Simple 3-Column Grid */
                        <motion.div 
                            key="folder"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '2rem',
                                padding: '2rem 0'
                            }}
                        >
                            {getProjectsByCategory(selectedFolder).map((project) => (
                                <ProjectBox 
                                    key={project.id} 
                                    project={project} 
                                    onClick={() => handleProjectClick(project)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Video Modal (Quick Look) */}
                <VideoModal 
                    isOpen={isIdModalOpen} 
                    project={selectedProject} 
                    onClose={() => setIsIdModalOpen(false)} 
                />

                {/* ===== CTA SECTION ===== */}
                <div id="inquiry-cta" style={{
                    marginTop: '20rem',
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
                        WANT TO BUILD SOMETHING? <br />
                        <span style={{ color: 'var(--color-accent)' }}>LET'S CHAT.</span>
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
                        RE-RENDER NOW
                    </a>
                </div>
            </div>
        </main>
    );
};

export default PortfolioPage;
