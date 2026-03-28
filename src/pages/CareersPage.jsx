import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Magnetic from '../components/Animations/Magnetic';
import { supabase } from '../utils/supabase';
import './Careers.css';

const CareersPage = () => {
    const [allJobs, setAllJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        fetchJobs();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .order('title', { ascending: true });

        if (data) {
            setAllJobs(data);
            if (data.length > 0) setSelectedJob(data[0]);
        }
        if (error) console.error('Error fetching jobs:', error);
        setIsLoading(false);
    };

    const filteredJobs = filter === 'ALL'
        ? allJobs
        : allJobs.filter(j => j.type === filter);

    return (
        <div className="careers-portal-page">
            <header className="portal-header container">
                <div className="header-top">
                    <span className="mono-tag">[RE-RENDER_CAREERS]</span>
                    <span className="live-status">● OPEN_POSITIONS</span>
                </div>
                <h1 className="portal-title">CAREERS</h1>

                <div className="filter-bar">
                    {['ALL', 'FREELANCE'].map(f => (
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
                {isLoading ? (
                    <div className="selection-empty" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[LOADING_LIVE_DATA...]</div>
                ) : (
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
                                        <span className={`job-status-pip ${job.status?.toLowerCase()}`}></span>
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
                                            <Link to={`/apply/${job.id}`} className="apply-btn-mini">QUICK_APPLY</Link>
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
                                                    <span className="serif-italic">{selectedJob.serif_title}</span><br />
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
                                                    <label className="mono-label">REQUIREMENTS</label>
                                                    <ul className="spec-list">
                                                        {selectedJob.specs?.map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        )) || <li>[NO_SPECIFICATIONS_LISTED]</li>}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="details-footer">
                                                <Magnetic strength={0.2}>
                                                    <Link to={`/apply/${selectedJob.id}`} className="main-apply-btn">
                                                        APPLY NOW
                                                    </Link>
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
                )}
            </main>

            <footer className="portal-footer container">
                <div className="manifesto-mini">
                    <p>JOIN OUR TEAM OF GLOBAL CREATIVES.</p>
                </div>
            </footer>
        </div>
    );
};

export default CareersPage;
