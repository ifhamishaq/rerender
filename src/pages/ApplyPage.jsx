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
        if (!user) return setError("Login required to submit applications.");
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
            <p style={{ opacity: 0.6, marginBottom: '2rem', maxWidth: '400px', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>You must be logged in to submit an application.</p>
            <button 
                onClick={() => setIsAuthModalOpen(true)}
                style={{ backgroundColor: 'var(--color-accent)', color: '#000', padding: '1rem 2rem', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, cursor: 'pointer' }}
            >
                LOG_IN_TO_APPLY
            </button>
        </div>
    );

    if (existingApplication) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', padding: '2rem', textAlign: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: '600px', width: '100%' }}
            >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-accent)', marginBottom: '2rem', letterSpacing: '0.3em' }}>APPLICATION_ARCHIVE</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 900, marginBottom: '2rem', color: 'var(--color-text)', textTransform: 'uppercase' }}>STATUS_REPORT</h1>
                
                <div style={{ 
                    padding: '2.5rem', 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '24px',
                    marginBottom: '3rem',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5 }}>CURRENT_PHASE</span>
                        <span style={{ 
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, 
                            color: existingApplication.status === 'ACCEPTED' ? 'var(--color-accent)' : 
                                   existingApplication.status === 'REJECTED' ? '#ff4444' : 'var(--color-text)',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            border: '1px solid var(--color-border)'
                        }}>
                            {existingApplication.status.toUpperCase()}
                        </span>
                    </div>

                    {existingApplication.feedback && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.75rem', letterSpacing: '0.1em' }}>STUDIO_RESPONSE_/_FEEDBACK</label>
                            <div style={{ 
                                fontSize: '1rem', 
                                lineHeight: 1.6, 
                                color: 'var(--color-text)', 
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                borderLeft: '3px solid var(--color-accent)'
                            }}>
                                {existingApplication.feedback}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/careers" style={{ 
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                        backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', 
                        padding: '1.25rem 2.5rem', borderRadius: '100px', textDecoration: 'none',
                        transition: 'all 0.3s'
                    }}>
                        BACK_TO_CAREERS
                    </Link>
                </div>
            </motion.div>
        </div>
    );

    if (submitted) return (
        // ... (existing submitted UI)
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', padding: '2rem', textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', fontStyle: 'italic', marginBottom: '1rem', color: 'var(--color-accent)' }}>Sent</h1>
                <p style={{ opacity: 0.6, marginBottom: '3rem', maxWidth: '400px', fontSize: '0.9rem' }}>We review applications every Monday. If we like your vibe, we'll reach out via Discord/Email.</p>
                <Link to="/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', border: '1px solid #333', padding: '1rem 2rem', color: '#fff', textDecoration: 'none' }}>
                    ← RETURN_TO_BASE
                </Link>
            </motion.div>
        </div>
    );

    const inputWrapperStyle = { 
        marginBottom: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem' 
    };

    const labelStyle = { 
        fontFamily: 'var(--font-mono)', 
        fontSize: '0.65rem', 
        opacity: 0.4, 
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginLeft: '0.5rem'
    };

    const inputStyle = { 
        width: '100%', 
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        padding: '1.25rem', 
        borderRadius: '16px',
        color: 'var(--color-text)', 
        fontSize: '1rem', 
        outline: 'none', 
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 100px' }}>
                <header style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-accent)', letterSpacing: '0.2em' }}>MISSION_ONBOARDING</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                    </div>
                    <h1 style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontSize: 'clamp(3rem, 10vw, 6rem)', 
                        fontWeight: 900, 
                        lineHeight: 0.85,
                        margin: 0,
                        letterSpacing: '-0.04em',
                        textTransform: 'uppercase'
                    }}>
                        {job ? job.title : 'RE—RENDER'}
                    </h1>
                    <p style={{ 
                        color: 'var(--color-text-secondary)', 
                        fontSize: '1rem', 
                        maxWidth: '550px', 
                        lineHeight: 1.6, 
                        marginTop: '2.5rem',
                        fontWeight: 500
                    }}>
                        Every Monday, we review incoming transmissions. If your technical profile matches our operational needs, we'll reach out via Discord or encrypted mail.
                    </p>
                </header>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Basic Info Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>OPERATIVE_NAME</label>
                            <input 
                                required type="text" placeholder="e.g. Alex Rivers" value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.transform = 'translateY(-2px)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.transform = 'translateY(0)'; }}
                            />
                        </div>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>TRANSMISSION_POINT (LOCKED)</label>
                            <input 
                                required type="email" value={formData.email}
                                readOnly
                                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>GEOGRAPHIC_SECTOR / TIMEZONE</label>
                            <input 
                                required type="text" placeholder="e.g. London, GMT+1" value={formData.location_timezone}
                                onChange={e => setFormData({...formData, location_timezone: e.target.value})} 
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.transform = 'translateY(-2px)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.transform = 'translateY(0)'; }}
                            />
                        </div>
                        <div style={inputWrapperStyle}>
                            <label style={labelStyle}>DISCORD_IDENTIFIER</label>
                            <input 
                                type="text" placeholder="username#0000" value={formData.discord_id}
                                onChange={e => setFormData({...formData, discord_id: e.target.value})} 
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.transform = 'translateY(-2px)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.transform = 'translateY(0)'; }}
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: '4rem', marginTop: '1rem' }}>
                        <label style={labelStyle}>PRIMARY_SPECIALIZATION</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
                            {roles.map(role => (
                                <button
                                    key={role} type="button"
                                    onClick={() => setFormData({...formData, primary_role: role})}
                                    style={{
                                        padding: '1rem 2rem',
                                        backgroundColor: formData.primary_role === role ? 'var(--color-accent)' : 'var(--color-surface)',
                                        color: formData.primary_role === role ? '#000' : 'var(--color-text)',
                                        border: '1px solid ' + (formData.primary_role === role ? 'var(--color-accent)' : 'var(--color-border)'),
                                        borderRadius: '12px',
                                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        {formData.primary_role === 'Other:' && (
                            <motion.input 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                required type="text" placeholder="SPECIFY ROLE..." 
                                value={formData.other_role} onChange={e => setFormData({...formData, other_role: e.target.value})}
                                style={{ ...inputStyle, borderColor: 'var(--color-accent)', marginTop: '1.5rem' }}
                            />
                        )}
                    </div>

                    {/* Expertise */}
                    <div style={inputWrapperStyle}>
                        <label style={labelStyle}>SOFTWARE_ARSENAL</label>
                        <textarea 
                            required rows="3" placeholder="e.g. Premiere, AE, Blender, DaVinci, Figma..." 
                            value={formData.software_proficiency} onChange={e => setFormData({...formData, software_proficiency: e.target.value})}
                            style={{ ...inputStyle, resize: 'none', minHeight: '120px' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.transform = 'translateY(-2px)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.transform = 'translateY(0)'; }}
                        />
                    </div>

                    <div style={inputWrapperStyle}>
                        <label style={labelStyle}>MOTIVATION / WHY RE—RENDER?</label>
                        <textarea 
                            required rows="4" placeholder="Briefly describe your creative philosophy..." 
                            value={formData.why_rerender} onChange={e => setFormData({...formData, why_rerender: e.target.value})}
                            style={{ ...inputStyle, resize: 'none', minHeight: '150px' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.transform = 'translateY(-2px)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.transform = 'translateY(0)'; }}
                        />
                    </div>

                    <div style={inputWrapperStyle}>
                        <label style={labelStyle}>VISUAL_PORTFOLIO / SHOWREEL_LINK</label>
                        <input 
                            required type="url" placeholder="https://vimeo.com/... or https://behance.net/..." 
                            value={formData.portfolio_url} onChange={e => setFormData({...formData, portfolio_url: e.target.value})}
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.transform = 'translateY(-2px)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.transform = 'translateY(0)'; }}
                        />
                    </div>

                    {error && (
                        <div style={{ 
                            padding: '1.5rem', 
                            backgroundColor: 'rgba(255, 68, 68, 0.05)', 
                            border: '1px solid rgba(255, 68, 68, 0.2)',
                            borderRadius: '16px',
                            color: '#ff4444',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            marginTop: '2rem'
                        }}>
                            [SYSTEM_ERROR: {error.toUpperCase()}]
                        </div>
                    )}

                    <div style={{ marginTop: '4rem' }}>
                        <button 
                            type="submit" disabled={submitting}
                            style={{ 
                                backgroundColor: 'var(--color-accent)', 
                                color: '#000', 
                                padding: '1.5rem', 
                                borderRadius: '100px',
                                fontFamily: 'var(--font-mono)', 
                                fontWeight: 900, 
                                fontSize: '1rem', 
                                width: '100%',
                                border: 'none', 
                                cursor: 'pointer', 
                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                                opacity: submitting ? 0.5 : 1,
                                boxShadow: '0 10px 40px rgba(57, 255, 20, 0.15)',
                                textTransform: 'uppercase'
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 15px 50px rgba(57, 255, 20, 0.25)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 10px 40px rgba(57, 255, 20, 0.15)'; }}
                        >
                            {submitting ? 'TRANSMITTING...' : 'INITIATE_APPLICATION'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyPage;
