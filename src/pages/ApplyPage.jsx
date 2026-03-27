import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import Magnetic from '../components/Animations/Magnetic';

const ApplyPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        portfolio_url: '',
        message: ''
    });
    const [agreedToContract, setAgreedToContract] = useState(false);

    useEffect(() => {
        if (jobId) {
            fetchJobDetails();
        } else {
            setLoading(false);
        }
    }, [jobId]);

    const fetchJobDetails = async () => {
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .eq('id', jobId)
            .single();
        
        if (data) setJob(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { error: submitError } = await supabase
                .from('career_applications')
                .insert([{
                    ...formData,
                    role_id: jobId,
                    role_title: job ? job.title : 'General Application',
                    agreed_to_contract: agreedToContract
                }]);

            if (submitError) throw submitError;
            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
            [INITIALIZING_APPLICATION_PORTAL...]
        </div>
    );

    if (submitted) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '2rem', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', fontStyle: 'italic', marginBottom: '1rem' }}>Application Sent</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '400px' }}>Your dossier has been successfully submitted to the Re-Render archive. Our team will review your work shortly.</p>
                <Link to="/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', border: '1px solid var(--color-border)', padding: '1rem 2rem', color: 'var(--color-text)' }}>
                    ← RETURN TO CAREERS
                </Link>
            </motion.div>
        </div>
    );

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '8rem 2rem 4rem' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', opacity: 0.5 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>[APPLY_SUBMISSION]</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                        <Link to="/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text)' }}>BACK</Link>
                    </div>

                    <h1 style={{ 
                        fontFamily: 'var(--font-serif)', 
                        fontSize: 'clamp(3rem, 8vw, 5rem)', 
                        fontWeight: 400, 
                        fontStyle: 'italic',
                        lineHeight: 0.9,
                        marginBottom: '1rem'
                    }}>
                        {job ? job.title : 'Open Application'}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                        {job ? `Joining the studio as a ${job.type}.` : 'Tell us how you can help Re-Render scale.'}
                    </p>
                </header>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="form-group" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.5rem', opacity: 0.4 }}>FULL NAME</label>
                            <input 
                                type="text" 
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                placeholder="YOUR NAME"
                                style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem 0 1rem', color: 'var(--color-text)', fontSize: '1.2rem', fontFamily: 'var(--font-sans)', outline: 'none' }} 
                            />
                        </div>
                        <div className="form-group" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.5rem', opacity: 0.4 }}>EMAIL ADDRESS</label>
                            <input 
                                type="email" 
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="NAME@EMAIL.COM"
                                style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem 0 1rem', color: 'var(--color-text)', fontSize: '1.2rem', fontFamily: 'var(--font-sans)', outline: 'none' }} 
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.5rem', opacity: 0.4 }}>PORTFOLIO / SHOWREEL LINK</label>
                        <input 
                            type="url" 
                            required
                            value={formData.portfolio_url}
                            onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                            placeholder="HTTPS://..."
                            style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem 0 1rem', color: 'var(--color-text)', fontSize: '1.2rem', fontFamily: 'var(--font-sans)', outline: 'none' }} 
                        />
                    </div>

                    <div className="form-group" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.5rem', opacity: 0.4 }}>COVER NOTE (OPTIONAL)</label>
                        <textarea 
                            rows="4"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            placeholder="TELL US ABOUT YOUR BEST WORK..."
                            style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem 0 1rem', color: 'var(--color-text)', fontSize: '1.1rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'none' }} 
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                        <input 
                            type="checkbox" 
                            id="agreement"
                            required
                            checked={agreedToContract}
                            onChange={(e) => setAgreedToContract(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-accent)' }} 
                        />
                        <label htmlFor="agreement" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.8 }}>
                            I AGREE TO THE RE-RENDER <Link to="/legal/portfolio-agreement" target="_blank" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>PORTFOLIO USAGE & MUTUAL GROWTH AGREEMENT</Link>
                        </label>
                    </div>

                    {error && (
                        <p style={{ color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                            ERROR: {error}
                        </p>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <Magnetic strength={0.1}>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                style={{ 
                                    backgroundColor: 'var(--color-text)', 
                                    color: 'var(--color-bg)', 
                                    padding: '1.5rem 4rem', 
                                    fontFamily: 'var(--font-sans)', 
                                    fontWeight: 700, 
                                    fontSize: '1.1rem', 
                                    cursor: 'pointer',
                                    width: '100%',
                                    border: 'none',
                                    transition: 'opacity 0.2s ease'
                                }}
                            >
                                {submitting ? '[TRANSMITTING...]' : 'SUBMIT APPLICATION'}
                            </button>
                        </Magnetic>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyPage;
