import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ACCENT = 'var(--color-accent)';
const ACCENT_BORDER = 'rgba(232,17,26,0.15)';
const GLITCH_CHARS = '█▓▒░!<>-_/\\[]{}—=+*^?#01';

const GlitchText = ({ text }) => {
    const [display, setDisplay] = useState(text);
    const [glitching, setGlitching] = useState(false);
    const ref = useRef(null);

    const trigger = useCallback(() => {
        if (glitching) return;
        setGlitching(true);
        let i = 0;
        ref.current = setInterval(() => {
            setDisplay(text.split('').map((c, idx) => {
                if (c === ' ') return ' ';
                if (idx < i) return text[idx];
                return Math.random() < 0.5
                    ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                    : c;
            }).join(''));
            i += 1 / 2.5;
            if (i >= text.length + 3) {
                clearInterval(ref.current);
                setDisplay(text);
                setGlitching(false);
            }
        }, 40);
    }, [text, glitching]);

    useEffect(() => {
        const t = setInterval(trigger, 4000 + Math.random() * 3000);
        return () => { clearInterval(t); clearInterval(ref.current); };
    }, [trigger]);

    return <span onClick={trigger} style={{ cursor: 'pointer', userSelect: 'none' }}>{display}</span>;
};

const ToolCard = ({ title, desc, icon, link, tag = "UTILITY", isHot = false, accentColor = 'var(--color-accent)' }) => (
    <Link to={link || "#"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
                border: '1px solid var(--color-border)',
                borderRadius: '24px',
                padding: '2rem',
                display: 'flex', flexDirection: 'column', gap: '1.25rem',
                backgroundColor: 'var(--color-surface)',
                position: 'relative', overflow: 'hidden',
                height: '100%',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
            }}
        >
            <div style={{
                position: 'absolute', top: '-50px', right: '-50px',
                width: '150px', height: '150px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                opacity: 0.12,
                pointerEvents: 'none'
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                    fontSize: '2rem',
                    background: 'var(--color-bg)',
                    width: '60px', height: '60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '16px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid var(--color-border)'
                 }}>
                    {icon}
                </div>
                {isHot && (
                    <div style={{
                        backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
                        color: accentColor,
                        padding: '0.4rem 0.9rem',
                        borderRadius: '20px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        border: `1px solid color-mix(in srgb, ${accentColor} 28%, transparent)`
                    }}>
                        LIVE
                    </div>
                )}
            </div>

            <div style={{ flex: 1, marginTop: '1rem' }}>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em',
                    color: accentColor, textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700
                }}>
                    {tag}
                </div>
                <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem',
                    color: 'var(--color-text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em',
                    lineHeight: 1.2
                }}>
                    {title}
                </h3>
                <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.92rem',
                    color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0,
                    fontWeight: 450
                }}>
                    {desc}
                </p>
            </div>
        </motion.div>
    </Link>
);

const ToolsSection = () => {
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

            {/* ── HEADER ── */}
            <section style={{ padding: '6rem 2rem 4rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: ACCENT, marginBottom: '2rem'
                    }}>
                        <span style={{ fontWeight: 800 }}>CREATOR_OS_TOOLS</span>
                        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: 1.08, margin: 0,
                        textTransform: 'uppercase', letterSpacing: '-0.04em'
                    }}>
                        <GlitchText text="CREATOR" /><br />
                        <span style={{ color: ACCENT }}>TOOLKIT</span>
                    </h1>
                    
                    <p style={{
                        fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: 'var(--color-text-secondary)',
                        maxWidth: '620px', lineHeight: 1.7, marginTop: '2rem', fontWeight: 450
                    }}>
                        High-precision creative engines engineered for modern creators. From storytelling and real-time viral posters to visual thumbnail scoring.
                    </p>
                </div>
            </section>

            {/* ── TOOLS GRID ── */}
            <section style={{ padding: '2rem 2rem 10rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        <ToolCard
                            icon="🔮"
                            title="Aesthetic Oracle"
                            desc="Creative Director AI. Brainstorm narratives, visual treatments, and full scene scripts in minutes."
                            link="/lab/ai-agent"
                            tag="Creativity & Wisdom"
                            accentColor="var(--color-oracle)"
                            isHot={true}
                        />
                        <ToolCard
                            icon="🖼️"
                            title="Thumbnail Analyser"
                            desc="Upload any thumbnail — AI Vision evaluates click-through potential, composition clarity, and provides 3 CTR fixes."
                            link="/lab/thumbnail-analyser"
                            tag="Clarity & Trust"
                            accentColor="var(--color-vision)"
                            isHot={true}
                        />
                        <ToolCard
                            icon="🎙️"
                            title="AI Voice Studio"
                            desc="Real-time neural voiceover studio powered by Deepgram Flux TTS. 20+ creator voices with instant MP3 export."
                            link="/lab/voice-lab"
                            tag="Sound & Voice"
                            accentColor="#f43f5e"
                            isHot={true}
                        />
                        <ToolCard
                            icon="📰"
                            title="Auto News Generator"
                            desc="Scans real-time trending news and generates instant viral social posters with custom AI imagery and bold text."
                            link="/lab/news-generator"
                            tag="Urgency & Viral"
                            accentColor="var(--color-viral)"
                            isHot={true}
                        />
                        <ToolCard
                            icon="✍️"
                            title="Caption Writer"
                            desc="Generate targeted, high-conversion captions tailored for Instagram, TikTok, X, YouTube, and LinkedIn."
                            link="/lab/caption-writer"
                            tag="Growth & Action"
                            accentColor="var(--color-accent)"
                            isHot={true}
                        />
                        <ToolCard
                            icon="🌌"
                            title="Wallpaper Lab"
                            desc="Render custom digital backdrops and aesthetic wallpapers with zero compromise using Flux Schnell."
                            link="/tools/wallpaper-lab"
                            tag="Growth & Action"
                            accentColor="var(--color-accent)"
                            isHot={true}
                        />
                        <ToolCard
                            icon="🎨"
                            title="Palette Picker"
                            desc="Extract and harmonize psychology-backed color palettes directly from any visual reference."
                            link="/tools/palette-picker"
                            tag="Color Psychology"
                            accentColor="var(--color-vision)"
                        />
                        <ToolCard
                            icon="⌨️"
                            title="Type Racer"
                            desc="Hone your keyboard velocity. Type design manifests and code snippets with live WPM tracking."
                            link="/tools/type-racer"
                            tag="Speed Utility"
                            accentColor="var(--color-text-muted)"
                        />
                        <ToolCard
                            icon="👁️"
                            title="Hex Code Hero"
                            desc="Sharpen your design instincts. Three hex codes, one color sample. Train your eyes."
                            link="/tools/hex-code-hero"
                            tag="Color Accuracy"
                            accentColor="var(--color-oracle)"
                        />
                        <ToolCard
                            icon="⏱️"
                            title="Chrono Strike"
                            desc="Stop the clock exactly at 5.000 seconds. Test your internal timing and reaction reflexes."
                            link="/tools/reflex"
                            tag="Timing Utility"
                            accentColor="var(--color-viral)"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ToolsSection;
