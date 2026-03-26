import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Sparkles, Palette, Code, Film, Box, Zap, ArrowRight,
    Image as ImageIcon, Gamepad2, FileText, Shield, Wand2, Upload,
    Monitor, Cpu, Globe, Users, Award, TrendingUp
} from 'lucide-react';

const STATS = [
    { value: '50+', label: 'PROJECTS_DELIVERED' },
    { value: '10K+', label: 'ASSETS_CREATED' },
    { value: '24/7', label: 'CREATIVE_OUTPUT' },
    { value: '∞', label: 'ITERATIONS' }
];

const ROLES = [
    { icon: <Film size={20} />, title: 'VIDEO EDITOR', desc: 'Cinematic edits, motion graphics, short-form content' },
    { icon: <Palette size={20} />, title: 'GRAPHIC DESIGNER', desc: 'Brand identity, thumbnails, social media assets' },
    { icon: <Box size={20} />, title: '3D ARTIST', desc: 'Product visualization, abstract renders, environments' },
    { icon: <Code size={20} />, title: 'WEB DEVELOPER', desc: 'React apps, brutalist interfaces, full-stack solutions' }
];

const TOOLS_ARSENAL = [
    { 
        category: 'AI SUITE',
        items: [
            { name: 'Aesthetic Oracle', desc: 'AI creative director powered by StepFun', icon: <Sparkles size={16} />, link: '/lab/ai-agent' },
            { name: 'Thumbnail Analyser', desc: 'Vision AI for thumbnail critique', icon: <Upload size={16} />, link: '/lab/ai-agent' },
            { name: 'Wallpaper Lab', desc: 'AI-generated wallpapers with prompt enhancement', icon: <ImageIcon size={16} />, link: '/arcade/wallpaper-lab' }
        ]
    },
    {
        category: 'CREATIVE TOOLS',
        items: [
            { name: 'Prompt Lab', desc: 'Curated prompts for AI generation', icon: <FileText size={16} />, link: '/prompts' },
            { name: 'Safe Zone', desc: 'Brand-safe content validator', icon: <Shield size={16} />, link: '/lab/safe-zone' },
            { name: 'Utility Labs', desc: 'Full toolkit for creators', icon: <Wand2 size={16} />, link: '/tools' }
        ]
    },
    {
        category: 'THE ARCADE',
        items: [
            { name: 'Type Racer', desc: 'Speed typing with creative prompts', icon: <Gamepad2 size={16} />, link: '/arcade/type-racer' },
            { name: 'Hex Code Hero', desc: 'Color matching challenge', icon: <Palette size={16} />, link: '/arcade/hex-code-hero' },
            { name: 'Chrono Strike', desc: 'Reflex testing for creators', icon: <Zap size={16} />, link: '/arcade/reflex' }
        ]
    }
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

            {/* ===== HERO SECTION ===== */}
            <div style={{
                padding: '10rem 2rem 8rem',
                position: 'relative',
                borderBottom: '1px solid var(--color-border)'
            }}>
                {/* Giant BG Text */}
                <div style={{
                    position: 'absolute', top: '15%', right: '5%',
                    fontSize: 'clamp(8rem, 20vw, 20rem)', fontWeight: 900,
                    color: 'var(--color-text)', opacity: 0.03,
                    pointerEvents: 'none', lineHeight: 0.8, zIndex: 0,
                    fontFamily: 'var(--font-display)'
                }}>
                    RE—RENDER
                </div>

                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: '1fr 1.2fr',
                    gap: '6rem', position: 'relative', zIndex: 1
                }} className="about-grid">

                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '2rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                            001 — IDENTITY
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(3.5rem, 7vw, 7rem)',
                            lineHeight: 0.85, marginBottom: '2.5rem',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            letterSpacing: '-0.03em'
                        }}>
                            I AM<br />
                            <span style={{ color: 'var(--color-accent)' }}>IFHAM.</span>
                        </h1>

                        <div style={{ width: '80px', height: '3px', backgroundColor: 'var(--color-accent)', marginBottom: '2.5rem' }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {ROLES.map((role, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 + 0.3 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1.25rem',
                                        padding: '1.25rem 0',
                                        borderBottom: i < ROLES.length - 1 ? '1px solid var(--color-border)' : 'none'
                                    }}
                                >
                                    <div style={{ color: 'var(--color-accent)', opacity: 0.7 }}>{role.icon}</div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.05em' }}>{role.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{role.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <p style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)', lineHeight: 1.7, marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                            I combine high-end design with modern digital aesthetics.
                            RE-RENDER is where I build <strong style={{ color: 'var(--color-accent)' }}>tools, assets, and experiences</strong> for creators who refuse to settle for mediocre.
                        </p>

                        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '3rem', color: 'var(--color-text-secondary)' }}>
                            I find beauty in the glitches, the noise, the raw textures of the digital world.
                            Every pixel is intentional. Every interaction is engineered.
                            This isn't just a portfolio — it's a <strong style={{ color: 'var(--color-text)' }}>creative operating system</strong>.
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <motion.a
                                href="https://ifhamishaq.netlify.app/"
                                target="_blank"
                                whileHover={{ x: 5 }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                    color: '#000', backgroundColor: 'var(--color-accent)',
                                    textDecoration: 'none', fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem', fontWeight: 900, padding: '1rem 2rem',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                VIEW PORTFOLIO <ArrowRight size={16} />
                            </motion.a>
                            <Link
                                to="/get-in-touch"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                                    color: 'var(--color-text)', backgroundColor: 'transparent',
                                    textDecoration: 'none', fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem', fontWeight: 900, padding: '1rem 2rem',
                                    border: '1px solid var(--color-border)', letterSpacing: '0.05em'
                                }}
                            >
                                GET IN TOUCH
                            </Link>
                        </div>
                    </motion.div>
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
            </div>

            {/* ===== TOOLS ARSENAL ===== */}
            <div style={{ padding: '8rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        style={{ marginBottom: '5rem' }}
                    >
                        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '1.5rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                            002 — ARSENAL
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                            TOOLS I'VE<br />
                            <span style={{ color: 'var(--color-accent)' }}>BUILT.</span>
                        </h2>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="tools-grid">
                        {TOOLS_ARSENAL.map((group, gi) => (
                            <motion.div
                                key={gi}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: gi * 0.15 }}
                                style={{ border: '1px solid var(--color-border)', padding: '0' }}
                            >
                                <div style={{
                                    padding: '1.5rem 2rem',
                                    borderBottom: '1px solid var(--color-border)',
                                    backgroundColor: 'rgba(255,255,255,0.02)'
                                }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--color-accent)' }}>
                                        {group.category}
                                    </span>
                                </div>
                                {group.items.map((item, ii) => (
                                    <Link
                                        key={ii}
                                        to={item.link}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                            padding: '1.5rem 2rem', textDecoration: 'none',
                                            borderBottom: ii < group.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            transition: 'background-color 0.15s', color: 'inherit'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(57,255,20,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ color: 'var(--color-accent)', marginTop: '0.15rem', flexShrink: 0 }}>{item.icon}</div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                                                {item.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                                                {item.desc}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== TECH STACK ===== */}
            <div style={{ padding: '8rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '1.5rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                            003 — STACK
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                            TECH I<br />
                            <span style={{ color: 'var(--color-accent)' }}>USE.</span>
                        </h2>
                    </motion.div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {TECH_STACK.map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid var(--color-border)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem', fontWeight: 900,
                                    letterSpacing: '0.1em',
                                    color: 'var(--color-text-secondary)',
                                    transition: 'all 0.15s'
                                }}
                                whileHover={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                            >
                                {tech}
                            </motion.div>
                        ))}
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
                @media (max-width: 768px) {
                    .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .tools-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
};

export default About;
