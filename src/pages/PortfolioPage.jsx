import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import FolderIcon from '../components/FolderIcon';
import ProjectBox from '../components/ProjectBox';
import VideoModal from '../components/VideoModal';
import StickySidebar from '../components/StickySidebar';
import portfolioData from '../data/portfolio.json';
import './Portfolio.css';

const PortfolioPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');
    
    const [allProjects, setAllProjects] = useState([]);
    const [activeCategory, setActiveCategory] = useState(categoryQuery || 'ALL');
    const [viewMode, setViewMode] = useState(categoryQuery ? 'GRID' : 'ROOT');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const categories = ['ALL', 'MOTION DESIGN', '3D', 'TALKING HEAD', 'THUMBNAIL', 'LONG FORM'];

    useEffect(() => {
        fetchProjects();
    }, []);

    // Sync URL with State for "Back" button support
    useEffect(() => {
        // Handle Scroll Reset via Lenis if available
        const resetScroll = () => {
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            } else {
                window.scrollTo(0, 0);
            }
        };

        if (categoryQuery) {
            setActiveCategory(categoryQuery);
            setViewMode('GRID');
            resetScroll();
        } else {
            setActiveCategory('ALL');
            setViewMode('ROOT');
            resetScroll();
        }
    }, [categoryQuery]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            
            // Merge with local data (fallback/additional)
            const combined = [...portfolioData];
            
            if (data) {
                // Ensure no duplicate IDs between local and Supabase
                const remoteIds = new Set(data.map(p => p.id));
                const filteredLocal = combined.filter(p => !remoteIds.has(p.id));
                setAllProjects([...data, ...filteredLocal]);
            } else {
                setAllProjects(combined);
            }

            if (error) console.error('Error fetching projects:', error);
        } catch (err) {
            console.error('Portfolio Fetch Error:', err);
            setAllProjects(portfolioData); // Fallback to local
        }
        setIsLoading(false);
    };
    // Group projects by category for folder previews
    const getCategoryThumbs = (cat) => {
        return allProjects
            .filter(p => p.category === cat)
            .slice(0, 3)
            .map(p => p.videoUrl || p.video_url || p.thumbnail);
    };

    const handleFolderClick = (cat) => {
        setSearchParams({ category: cat });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                { label: viewMode === 'ROOT' ? 'ARCHIVE' : 'FOLDER', targetId: 'top' },
                { label: 'CONTACT', targetId: 'inquiry-cta' }
            ]} />

            <div id="top" style={{ maxWidth: '1400px', margin: '0 auto', padding: '8rem 2rem' }}>
                
                {/* Header / Breadcrumb Bar */}
                <header style={{ 
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '2rem',
                    marginBottom: '6rem',
                }}>
                    <div style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.65rem', 
                        opacity: 0.5, 
                        marginBottom: '1.5rem',
                        letterSpacing: '0.2em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span 
                            onClick={() => setSearchParams({})}
                            style={{ cursor: 'pointer', borderBottom: viewMode === 'ROOT' ? '1px solid var(--color-accent)' : 'none' }}
                        >
                            / ARCHIVE
                        </span>
                        {viewMode === 'GRID' && (
                            <>
                                <span>/</span>
                                <span style={{ color: 'var(--color-accent)' }}>{activeCategory}</span>
                            </>
                        )}
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
                            fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', 
                            lineHeight: 0.85,
                            margin: 0,
                            textTransform: 'uppercase'
                        }}>
                            {viewMode === 'ROOT' ? (
                                <>THE <span className="serif-italic">Studio</span><br/>ARCHIVE</>
                            ) : (
                                <>{activeCategory}<br/><span className="serif-italic">Collection</span></>
                            )}
                        </h1>

                        {viewMode === 'GRID' && (
                            <button
                                onClick={() => setViewMode('ROOT')}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-text)',
                                    border: '1px solid var(--color-border)',
                                    padding: '0.75rem 1.5rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase'
                                }}
                            >
                                [BACK_TO_ARCHIVE]
                            </button>
                        )}
                    </div>
                </header>

                {isLoading ? (
                    <div className="archive-loader" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[LOADING_DATABASE...]</div>
                ) : (
                    <AnimatePresence mode="wait">
                        {viewMode === 'ROOT' ? (
                            <motion.div 
                                key="root"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="folder-grid"
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    gap: '4rem',
                                    padding: '2rem 0'
                                }}
                            >
                                {categories.filter(c => c !== 'ALL').map(cat => (
                                    <FolderIcon 
                                        key={cat}
                                        label={cat}
                                        thumbnails={getCategoryThumbs(cat)}
                                        projectCount={allProjects.filter(p => p.category === cat).length}
                                        onClick={() => handleFolderClick(cat)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                    gap: '2.5rem'
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
                    </AnimatePresence>
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
