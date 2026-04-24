import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const ContactSection = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        company: '',
        social: '',
        location: '',
        message: '', 
        projectType: 'Video Editing', 
        budget: '$1,000 - $3,000' 
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // We combine the extra details into the quantity_duration field or similar
            // to avoid schema errors if the user hasn't added the columns yet.
            // But I will also provide the SQL to add them properly.
            const projectDetails = `
COMPANY: ${formData.company || 'N/A'}
SOCIAL: ${formData.social || 'N/A'}
LOCATION: ${formData.location || 'N/A'}
BUDGET: ${formData.budget}
BRIEF: ${formData.message}
            `.trim();

            const { error } = await supabase
                .from('contact_submissions')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    category: formData.projectType,
                    quantity_duration: projectDetails, 
                    status: 'NEW'
                }]);

            if (error) throw error;
            setStatus('success');
            setFormData({ 
                name: '', email: '', company: '', social: '', location: '',
                message: '', projectType: 'Video Editing', budget: '$1,000 - $3,000' 
            });
        } catch (err) {
            console.error('Submission error:', err);
            setStatus('error');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '1.25rem',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-sans)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
    };

    return (
        <section id="contact" style={{ 
            padding: '8rem 2rem', 
            backgroundColor: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            letterSpacing: '0.4em',
                            color: 'var(--color-accent)',
                            textTransform: 'uppercase',
                            marginBottom: '1rem'
                        }}
                    >
                        ONBOARDING_INITIATED
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 900,
                            lineHeight: 0.9,
                            margin: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.04em'
                        }}
                    >
                        START YOUR <br />
                        <span style={{ color: 'var(--color-accent)' }}>RE-RENDER.</span>
                    </motion.h2>
                </div>

                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            backgroundColor: 'rgba(57, 255, 20, 0.05)',
                            border: '1px solid var(--color-accent)',
                            borderRadius: '32px',
                        }}
                    >
                        <CheckCircle size={64} color="var(--color-accent)" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1rem' }}>TRANSMISSION_RECEIVED</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                            Our team will review your project and reach out within 24—48 hours.
                        </p>
                        <button 
                            onClick={() => setStatus('idle')}
                            style={{ 
                                marginTop: '2rem',
                                background: 'none',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                                padding: '0.75rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem'
                            }}
                        >
                            SEND_ANOTHER_MESSAGE
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Row 1: Name & Email */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-row">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>IDENTIFICATION / NAME</label>
                                <input 
                                    required
                                    placeholder="e.g. Alex Rivers"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>TRANSMISSION_POINT / EMAIL</label>
                                <input 
                                    required
                                    type="email"
                                    placeholder="alex@studio.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Row 2: Company & Social */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-row">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>ORGANIZATION / COMPANY</label>
                                <input 
                                    placeholder="e.g. Future Media Group"
                                    value={formData.company}
                                    onChange={e => setFormData({...formData, company: e.target.value})}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>SOCIAL_NODE / LINK (IG, X, YT)</label>
                                <input 
                                    placeholder="e.g. @alexrivers_dev"
                                    value={formData.social}
                                    onChange={e => setFormData({...formData, social: e.target.value})}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Row 3: Project Type & Budget */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-row">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>PROJECT_CLASSIFICATION</label>
                                <select 
                                    value={formData.projectType}
                                    onChange={e => setFormData({...formData, projectType: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option>Video Editing</option>
                                    <option>3D Animation</option>
                                    <option>Thumbnail Design</option>
                                    <option>Full Brand Re-render</option>
                                    <option>Other / Custom</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>ALLOCATED_BUDGET</label>
                                <select 
                                    value={formData.budget}
                                    onChange={e => setFormData({...formData, budget: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option>$500 - $1,000</option>
                                    <option>$1,000 - $3,000</option>
                                    <option>$3,000 - $5,000</option>
                                    <option>$5,000 - $10,000</option>
                                    <option>$10,000+</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 4: Location */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>GEOGRAPHIC_LOCATION / TIMEZONE</label>
                            <input 
                                placeholder="e.g. New York, EST"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                style={inputStyle}
                            />
                        </div>

                        {/* Row 5: Message */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginLeft: '0.5rem' }}>PROJECT_BRIEF / DETAILS</label>
                            <textarea 
                                required
                                placeholder="Tell us about your vision, goals, and timeline..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                backgroundColor: 'var(--color-accent)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '16px',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 900,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 10px 30px rgba(255,59,48,0.2)'
                            }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            {status === 'loading' ? 'TRANSMITTING...' : (
                                <>
                                    LOCK IN PROJECT
                                    <Send size={18} />
                                </>
                            )}
                        </button>

                        {status === 'error' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4444', fontSize: '0.8rem', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
                                <AlertCircle size={14} />
                                CONNECTION_ERROR. PLEASE TRY AGAIN.
                            </div>
                        )}
                    </form>
                )}
            </div>

            {/* Decorative background element */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(232,17,26,0.03) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 1
            }} />
        </section>
    );
};

export default ContactSection;
