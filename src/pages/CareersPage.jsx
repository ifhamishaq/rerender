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
                    <div className="apple-jobs-list">
                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.01 }}
                                className="apple-job-card"
                            >
                                <Link to={`/apply/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="job-card-header">
                                        <div className="job-card-main-info">
                                            <h3 className="apple-job-title">{job.title}</h3>
                                            <div className="job-tags">
                                                <span className="job-tag">{job.type}</span>
                                                <span className="job-tag access">REMOTE-FIRST</span>
                                                <span className="job-tag access">ASYNC-OK</span>
                                            </div>
                                        </div>
                                        <div className="apple-apply-btn">
                                            APPLY ↗
                                        </div>
                                    </div>
                                    
                                    <div className="job-card-body">
                                        <p>{job.description}</p>
                                        {job.specs && (
                                            <div className="job-specs-brief">
                                                {job.specs.slice(0, 3).map((s, i) => (
                                                    <span key={i} className="spec-chip">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        )) : (
                            <div className="no-jobs">[NO_MATCHING_OPENINGS]</div>
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
