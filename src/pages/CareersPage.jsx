import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from '../components/Animations/Magnetic';
import careersData from '../data/careers.json';
import './Careers.css';

const CareersPage = () => {
    const [selectedJob, setSelectedJob] = useState(careersData[0]);
    const [filter, setFilter] = useState('ALL');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredJobs = filter === 'ALL' 
        ? careersData 
        : careersData.filter(j => j.type === filter);

    return (
        <div className="careers-portal-page">
            <header className="portal-header container">
                <div className="header-top">
                    <span className="mono-tag">[RE-RENDER_TALENT_PORTAL_V2]</span>
                    <span className="live-status">● LIVE_OPENINGS</span>
                </div>
                <h1 className="portal-title">CAREERS</h1>
                
                <div className="filter-bar">
                    {['ALL', 'INTERNSHIP', 'FREELANCE', 'COMPETITIONS'].map(f => (
                        <button 
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <main className="portal-container container">
                <div className="portal-layout">
                    {/* JOB LIST SIDEBAR */}
                    <aside className="job-list-sidebar">
                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                            <div 
                                key={job.id} 
                                className={`job-card-mini ${selectedJob?.id === job.id ? 'selected' : ''}`}
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className="card-mini-top">
                                    <span className="job-sidemark">{job.sidemark}</span>
                                    <span className={`job-status-pip ${job.status.toLowerCase()}`}></span>
                                </div>
                                <h3 className="job-mini-title">{job.title}</h3>
                                <div className="job-mini-meta">
                                    <span>{job.type}</span>
                                    <span>•</span>
                                    <span>REMOTE</span>
                                </div>
                                {selectedJob?.id === job.id && isMobile && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mobile-details-preview"
                                    >
                                        <p>{job.description}</p>
                                        <a href={job.link} className="apply-btn-mini">QUICK_APPLY</a>
                                    </motion.div>
                                )}
                            </div>
                        )) : (
                            <div className="no-jobs">[NO_MATCHING_OPENINGS]</div>
                        )}
                    </aside>

                    {/* JOB DETAILS VIEW */}
                    {!isMobile && (
                        <section className="job-details-view">
                            <AnimatePresence mode="wait">
                                {selectedJob ? (
                                    <motion.div 
                                        key={selectedJob.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="details-content"
                                    >
                                        <div className="details-header">
                                            <div className="job-badge">{selectedJob.type}</div>
                                            <h2 className="details-title">
                                                <span className="serif-italic">{selectedJob.serifTitle}</span><br/>
                                                {selectedJob.title}
                                            </h2>
                                            <div className="details-meta-grid">
                                                <div className="meta-item">
                                                    <label>STATUS</label>
                                                    <span>{selectedJob.status}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <label>LOCATION</label>
                                                    <span>GLOBAL / REMOTE</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="details-body">
                                            <p className="job-full-desc">{selectedJob.description}</p>
                                            <div className="specs-section">
                                                <label className="mono-label">TECHNICAL_SPECIFICATIONS</label>
                                                <ul className="spec-list">
                                                    {selectedJob.specs.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="details-footer">
                                            <Magnetic strength={0.2}>
                                                <a href={selectedJob.link} className="main-apply-btn">
                                                    APPLY_TO_RE_RENDER
                                                </a>
                                            </Magnetic>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="selection-empty">SELECT_A_POSITION_TO_VIEW_DETAILS</div>
                                )}
                            </AnimatePresence>
                        </section>
                    )}
                </div>
            </main>

            <footer className="portal-footer container">
                <div className="manifesto-mini">
                    <p>WE DON'T JUST HIRE. WE UPGRADE. JOIN OUR ROSTER OF GLOBAL CREATIVES.</p>
                </div>
            </footer>
        </div>
    );
};

export default CareersPage;
