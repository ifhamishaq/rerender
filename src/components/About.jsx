import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Sparkles, Palette, Code, Film, Box, Zap, ArrowRight,
    Image as ImageIcon, Gamepad2, FileText, Shield, Wand2, Upload,
    Monitor, Cpu, Globe, Users, Award, TrendingUp
} from 'lucide-react';

const TEAM_DATA = [
    {
        name: 'IFHAM.',
        role: 'FOUNDER & LEAD DESIGNER',
        image: '/team/ifham.jpeg',
        bio: 'Visionary behind the RE-RENDER collective. Specializing in high-end brutalist web architecture, 3D environments, and brand strategy for the next generation of digital products.',
        link: 'https://ifhamishaq.netlify.app/',
        status: 'COMMAND'
    },
    {
        name: 'HARPREET SINGH.',
        role: 'LEAD VIDEO EDITOR',
        image: null,
        bio: 'The silent architect of cinematic narrative. Harpreet specializes in heavy-duty rhythm, aggressive pacing, and the subconscious flow of high-end commercial production.',
        link: '/work?category=MOTION DESIGN',
        status: 'OPERATIVE'
    }
];

const STATS = [
    { value: '50+', label: 'PROJECTS FINISHED' },
    { value: '10K+', label: 'DESIGNS CREATED' },
    { value: '24/7', label: 'ALWAYS WORKING' },
    { value: '∞', label: 'NEW IDEAS' }
];

const TOOLS_ARSENAL = [
    { name: 'Aesthetic Oracle', category: 'AI', icon: <Sparkles size={16} /> },
    { name: 'Thumbnail Analyser', category: 'AI', icon: <Upload size={16} /> },
    { name: 'Prompt Lab', category: 'TOOLS', icon: <FileText size={16} /> },
    { name: 'Vite & React', category: 'STACK', icon: <Code size={16} /> },
    { name: 'After Effects', category: 'VIDEO', icon: <Film size={16} /> },
    { name: 'Blender', category: '3D', icon: <Box size={16} /> }
];

const TECH_STACK = [
    'REACT', 'VITE', 'FRAMER MOTION', 'SUPABASE', 'OPENROUTER AI', 
    'NETLIFY', 'LENIS', 'ZUSTAND', 'FIGMA', 'AFTER EFFECTS',
    'CINEMA 4D', 'BLENDER', 'DAVINCI RESOLVE', 'PHOTOSHOP'
];

const About = () => {
    return (
        <section id="about" style={{
            padding: '0 0 8rem',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* ===== HERO SECTION: THE STUDIO ===== */}
            <div style={{
                padding: '10rem 2rem 6rem',
                position: 'relative',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{
                    position: 'absolute', top: '5%', right: '5%',
                    fontSize: 'clamp(8rem, 20vw, 20rem)', fontWeight: 900,
                    color: 'var(--color-text)', opacity: 0.03,
                    pointerEvents: 'none', lineHeight: 0.8, zIndex: 0,
                    fontFamily: 'var(--font-display)'
                }}>
                    RE—RENDER
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '2rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                        01 — THE BUREAU
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 6rem)',
                        lineHeight: 0.9, marginBottom: '3rem',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        letterSpacing: '-0.03em',
                        maxWidth: '900px'
                    }}>
                        HIGH-PERFORMANCE <br />
                        <span style={{ color: 'var(--color-accent)' }}>CREATIVE COLLECTIVE.</span>
                    </h1>
                    
                    <div style={{ maxWidth: '800px' }}>
                        <p style={{ fontSize: '1.4rem', lineHeight: 1.4, color: 'var(--color-text)', fontWeight: 500, marginBottom: '2rem' }}>
                            RE-RENDER is an elite creative studio engineered for the next generation of brands. We don't just design—we build unforgettable visual identities.
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== THE OPERATIVES: TEAM SECTION ===== */}
            <div style={{ padding: '8rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '4rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                        02 — LEAD OPERATIVES
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }} className="team-grid-cards">
                        {TEAM_DATA.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: i * 0.1 }}
                                style={{
                                    borderRadius: '28px',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'var(--color-surface)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                }}
                            >
                                {/* Technical Header */}
                                <div style={{ 
                                    padding: '1rem 1.5rem', 
                                    borderBottom: '1px solid var(--color-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>DDR_{member.name}</span>
                                    <span style={{ 
                                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, 
                                        color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
                                        padding: '2px 8px'
                                    }}>{member.status}</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0' }} className="member-card-inner">
                                    {/* Image Side */}
                                    <div style={{ 
                                        position: 'relative', 
                                        height: '450px', 
                                        borderRight: '1px solid var(--color-border)',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--color-bg)'
                                    }}>
                                        {member.image ? (
                                            <img 
                                                src={member.image} 
                                                alt={member.name} 
                                                style={{ 
                                                    width: '100%', height: '100%', objectFit: 'cover',
                                                    filter: 'grayscale(1) contrast(1.1) brightness(0.9)'
                                                }} 
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center',
                                                padding: '2rem', textAlign: 'center',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                    opacity: 0.1, pointerEvents: 'none',
                                                    background: 'repeating-linear-gradient(45deg, var(--color-text), var(--color-text) 1px, transparent 1px, transparent 10px)'
                                                }} />
                                                <span style={{ 
                                                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-accent)', 
                                                    marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 900
                                                }}>
                                                    [ IDENTITY_PROTECTED ]
                                                </span>
                                                <div style={{ 
                                                    fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 900, 
                                                    lineHeight: 1.2, textTransform: 'uppercase', color: 'var(--color-text)',
                                                    letterSpacing: '0.1em'
                                                }}>
                                                    DATA_ENCRYPTED<br />
                                                    REDACTED_VIEW
                                                </div>
                                                <div style={{
                                                    marginTop: '2rem', width: '30px', height: '1px', backgroundColor: 'var(--color-accent)',
                                                    boxShadow: '0 0 10px var(--color-accent)'
                                                }} />
                                            </div>
                                        )}
                                        <div style={{ 
                                            position: 'absolute', bottom: '1rem', left: '1rem',
                                            backgroundColor: 'var(--color-bg)', padding: '0.5rem 1rem',
                                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900,
                                            border: '1px solid var(--color-border)', zIndex: 2
                                        }}>
                                            STDU_REF: {i.toString().padStart(2, '0')}
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ 
                                                fontFamily: 'Playfair Display', fontStyle: 'italic', 
                                                fontSize: '3rem', margin: '0 0 0.5rem', lineHeight: 1 
                                            }}>{member.name}</h3>
                                            <div style={{ 
                                                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', 
                                                fontWeight: 900, color: 'var(--color-accent)', marginBottom: '2rem' 
                                            }}>{member.role}</div>
                                            
                                            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8, marginBottom: '2rem' }}>
                                                {member.bio}
                                            </p>
                                        </div>

                                        <a 
                                            href={member.link} 
                                            target={member.link.startsWith('http') ? "_blank" : "_self"}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                                textDecoration: 'none', fontFamily: 'var(--font-mono)',
                                                fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text)',
                                                border: '1px solid var(--color-text)', padding: '0.75rem 1.5rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = 'var(--color-text)';
                                                e.currentTarget.style.color = 'var(--color-bg)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--color-text)';
                                            }}
                                        >
                                            VIEW_PORTFOLIO <ArrowRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== STATS BAR ===== */}
            <div style={{ borderBottom: '1px solid var(--color-border)', padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }} className="stats-grid">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--color-accent)', lineHeight: 1 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginTop: '0.75rem', letterSpacing: '0.1em', fontWeight: 900 }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
                      {/* ===== UNIFIED TOOLKIT ===== */}
            <div style={{ padding: '8rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '1.5rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                            03 — THE TOOLKIT
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                            UNIFIED<br />
                            <span style={{ color: 'var(--color-accent)' }}>ARSENAL.</span>
                        </h2>
                    </motion.div>
 
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                        gap: '1rem' 
                    }}>
                        {TOOLS_ARSENAL.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'var(--color-surface)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ color: 'var(--color-accent)' }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', opacity: 0.6 }}>{item.category}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
       </div>

            {/* ===== PHILOSOPHY ===== */}
            <div style={{ padding: '8rem 2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '2rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                            004 — PHILOSOPHY
                        </div>
                        <blockquote style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                            lineHeight: 1.3, fontWeight: 900,
                            fontFamily: 'var(--font-display)',
                            marginBottom: '3rem',
                            letterSpacing: '-0.02em'
                        }}>
                            "Good design is <span style={{ color: 'var(--color-accent)' }}>invisible</span>.<br />
                            Great design is <span style={{ color: 'var(--color-accent)' }}>unforgettable</span>."
                        </blockquote>
                        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            Every project at RE-RENDER is built with one principle: no compromises.
                            From the first pixel to the final deploy, every detail is obsessed over.
                            This is not a studio that ships "good enough."
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Responsive CSS */}
            <style>{`
                @media (max-width: 1024px) {
                    .team-grid-cards { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    .about-intro-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
                    .member-card-inner { grid-template-columns: 1fr !important; }
                    .member-card-inner div:first-child { height: 350px !important; border-right: none !important; border-bottom: 1px solid var(--color-border); }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .tools-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
};

export default About;
