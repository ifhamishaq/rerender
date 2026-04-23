import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import Magnetic from '../components/Animations/Magnetic';

const ApplyPage = () => {
    const { jobId } = useParams();
    console.log('ApplyPage Mounted for JobID:', jobId);
    const navigate = useNavigate();
    const { user, loading: authLoading, setIsAuthModalOpen } = useAuth();
    const [existingApplication, setExistingApplication] = useState(null);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Broader Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        location_timezone: '',
        discord_id: '',
        primary_role: 'Video Editor',
        other_role: '',
        software_proficiency: '',
        why_rerender: '',
        portfolio_url: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    useEffect(() => {
        if (jobId && jobId !== 'general') {
            fetchJobDetails();
        } else {
            setLoading(false);
        }
    }, [jobId]);

    // Check for existing application
    useEffect(() => {
        if (user) {
            checkExisting();
        }
    }, [user, jobId]);

    const checkExisting = async () => {
        const rid = jobId && jobId !== 'general' ? jobId : null;
        
        let query = supabase
            .from('career_applications')
            .select('status')
            .eq('user_id', user.id);
        
        if (rid) {
            query = query.eq('role_id', rid);
        } else {
            query = query.is('role_id', null);
        }

        const { data } = await query.maybeSingle();
        if (data) setExistingApplication(data);
    };

    const fetchJobDetails = async () => {
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .eq('id', jobId)
            .single();
        
        if (data) {
            setJob(data);
            setFormData(prev => ({ ...prev, primary_role: data.title }));
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return setError("Login required to submit dossiers.");
        setSubmitting(true);
        setError(null);

        const finalRole = formData.primary_role === 'Other:' ? formData.other_role : formData.primary_role;

        try {
            const { error: submitError } = await supabase
                .from('career_applications')
                .insert([{
                    user_id: user.id,
                    full_name: formData.full_name,
                    email: user.email,
                    location_timezone: formData.location_timezone,
                    discord_id: formData.discord_id,
                    primary_role: finalRole,
                    software_proficiency: formData.software_proficiency,
                    why_rerender: formData.why_rerender,
                    portfolio_url: formData.portfolio_url,
                    role_id: jobId && jobId !== 'general' ? jobId : null,
                    role_title: job ? job.title : 'General Application',
                    agreed_to_contract: true
                }]);

            if (submitError) throw submitError;
            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const roles = ['Video Editor', 'Graphic Designer', 'Motion Designer', 'Other:'];

    useEffect(() => {
        if (!authLoading && !user) {
            setIsAuthModalOpen(true);
        }
    }, [user, authLoading, setIsAuthModalOpen]);

    if (authLoading || loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
            [INITIALIZING_APPLICATION_PORTAL...]
        </div>
    );

    if (!user) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontStyle: 'italic', marginBottom: '2rem', color: 'var(--color-accent)' }}>Authentication Required</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem', maxWidth: '400px', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>You must be logged in to submit an application dossier.</p>
            <button 
                onClick={() => setIsAuthModalOpen(true)}
                style={{ backgroundColor: 'var(--color-accent)', color: '#000', padding: '1rem 2rem', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, cursor: 'pointer' }}
            >
                LOG_IN_TO_APPLY
            </button>
        </div>
    );

    if (existingApplication) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontStyle: 'italic', marginBottom: '2rem', color: 'var(--color-accent)' }}>Dossier Exists</h1>
            <p style={{ opacity: 0.6, marginBottom: '1rem', maxWidth: '400px', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>You have already submitted an application for this role.</p>
            <div style={{ padding: '0.5rem 1.5rem', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: '3rem' }}>
                STATUS: {existingApplication.status.toUpperCase()}
            </div>
            <Link to="/dossier" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', border: '1px solid #333', padding: '1rem 2rem', color: '#fff', textDecoration: 'none' }}>
                CHECK_FULL_STATUS
            </Link>
        </div>
    );

    if (submitted) return (
        // ... (existing submitted UI)
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', padding: '2rem', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', fontStyle: 'italic', marginBottom: '1rem', color: 'var(--color-accent)' }}>Sent</h1>
                <p style={{ opacity: 0.6, marginBottom: '3rem', maxWidth: '400px', fontSize: '0.9rem' }}>We review dossiers every Monday. If we like your vibe, we'll reach out via Discord/Email.</p>
                <Link to="/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', border: '1px solid #333', padding: '1rem 2rem', color: '#fff', textDecoration: 'none' }}>
                    ← RETURN_TO_BASE
                </Link>
            </motion.div>
        </div>
    );

    const inputWrapperStyle = { marginBottom: '2.5rem', borderBottom: '1px solid #222', transition: 'border-color 0.3s' };
    const labelStyle = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '0.5rem', opacity: 0.3, letterSpacing: '2px' };
    const inputStyle = { width: '100%', background: 'none', border: 'none', padding: '0.5rem 0 1rem', color: '#fff', fontSize: '1.2rem', outline: 'none', fontFamily: 'var(--font-sans)' };

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10rem 2rem 5rem' }}>
                <header style={{ marginBottom: '5rem' }}>
                    <h1 style={{ 
                        fontFamily: 'var(--font-serif)', 
                        fontSize: 'clamp(4rem, 12vw, 8rem)', 
                        fontWeight: 400, 
                        fontStyle: 'italic',
                        lineHeight: 0.8,
                        marginBottom: '2rem',
                        color: 'var(--color-accent)'
                    }}>
                        {job ? job.title : 'RE-RENDER'}
                    </h1>
                    <p style={{ opacity: 0.6, fontSize: '0.85rem', maxWidth: '500px', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                        We review applications every Monday. If we like your vibe, we'll reach out via Discord/Email. RE-RENDER Agency.
                    </p>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '3rem' }}>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>FULL_NAME *</label>
                            <input 
                                required type="text" placeholder="MIHIR_S..." value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})} style={inputStyle}
                            />
                        </div>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>EMAIL_ADDRESS (SESSION_LOCKED) *</label>
                            <input 
                                required type="email" placeholder="OPERATIVE@EMAIL.COM" value={formData.email}
                                readOnly
                                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '3rem' }}>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>LOCATION / TIMEZONE *</label>
                            <input 
                                required type="text" placeholder="EST / LONDON / DUB..." value={formData.location_timezone}
                                onChange={e => setFormData({...formData, location_timezone: e.target.value})} style={inputStyle}
                            />
                        </div>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>DISCORD_ID (OPTIONAL)</label>
                            <input 
                                type="text" placeholder="MIHIR#0001" value={formData.discord_id}
                                onChange={e => setFormData({...formData, discord_id: e.target.value})} style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: '4rem' }}>
                        <label style={labelStyle}>PRIMARY_ROLE *</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                            {roles.map(role => (
                                <button
                                    key={role} type="button"
                                    onClick={() => setFormData({...formData, primary_role: role})}
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        backgroundColor: formData.primary_role === role ? 'var(--color-accent)' : 'transparent',
                                        color: formData.primary_role === role ? '#000' : '#fff',
                                        border: '1px solid ' + (formData.primary_role === role ? 'var(--color-accent)' : '#222'),
                                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer'
                                    }}
                                >
                                    {role.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {formData.primary_role === 'Other:' && (
                            <motion.input 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                required type="text" placeholder="SPECIFY ROLE..." 
                                value={formData.other_role} onChange={e => setFormData({...formData, other_role: e.target.value})}
                                style={{ ...inputStyle, borderBottom: '1px solid var(--color-accent)', marginTop: '1.5rem', fontSize: '1rem' }}
                            />
                        )}
                    </div>

                    {/* Expertise */}
                    <div style={inputWrapperStyle}>
                        <label style={labelStyle}>SOFTWARE_PROFICIENCY *</label>
                        <textarea 
                            required rows="3" placeholder="PREMIERE, AE, BLENDER, DAVINCI..." 
                            value={formData.software_proficiency} onChange={e => setFormData({...formData, software_proficiency: e.target.value})}
                            style={{ ...inputStyle, resize: 'none', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={inputWrapperStyle}>
                        <label style={labelStyle}>WHY_RE-RENDER? *</label>
                        <textarea 
                            required rows="4" placeholder="TELL US ABOUT YOUR VIBE..." 
                            value={formData.why_rerender} onChange={e => setFormData({...formData, why_rerender: e.target.value})}
                            style={{ ...inputStyle, resize: 'none', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={inputWrapperStyle}>
                        <label style={labelStyle}>LINK_TO_YOUR_PORTFOLIO *</label>
                        <input 
                            required type="url" placeholder="HTTPS://..." 
                            value={formData.portfolio_url} onChange={e => setFormData({...formData, portfolio_url: e.target.value})}
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: '2rem' }}>
                            [ERROR: {error.toUpperCase()}]
                        </p>
                    )}

                    <div style={{ marginTop: '3rem' }}>
                        <Magnetic strength={0.1}>
                            <button 
                                type="submit" disabled={submitting}
                                style={{ 
                                    backgroundColor: 'var(--color-accent)', color: '#000', padding: '1.5rem 0', 
                                    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1rem', width: '100%',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: submitting ? 0.5 : 1
                                }}
                            >
                                {submitting ? 'TRANSMITTING...' : 'SEND_DOSSIER'}
                            </button>
                        </Magnetic>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyPage;
