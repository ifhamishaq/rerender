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

const ToolCard = ({ title, desc, icon, link, tag = "UTILITY", isHot = false }) => (
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
                background: isHot ? 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' : 'none',
                opacity: 0.1,
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
                        backgroundColor: 'rgba(57, 255, 20, 0.1)',
                        color: 'var(--color-accent)',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        border: '1px solid rgba(57, 255, 20, 0.2)'
                    }}>
                        New
                    </div>
                )}
            </div>

            <div style={{ flex: 1, marginTop: '1rem' }}>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em',
                    color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600
                }}>
                    {tag}
                </div>
                <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem',
                    color: 'var(--color-text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em'
                }}>
                    {title}
                </h3>
                <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0,
                    fontWeight: 500
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
                        <span style={{ fontWeight: 900 }}>SYSTEM_TOOLS</span>
                        <span style={{ flex: 1, height: '1px', backgroundColor: ACCENT_BORDER }} />
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: 'clamp(3rem, 12vw, 7rem)', lineHeight: 0.85, margin: 0,
                        textTransform: 'uppercase', letterSpacing: '-0.04em'
                    }}>
                        <GlitchText text="UTILITY" /><br />
                        <span style={{ color: ACCENT }}>LABS</span>
                    </h1>
                    
                    <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-text-secondary)',
                        maxWidth: '600px', lineHeight: 1.7, marginTop: '2.5rem'
                    }}>
                        Proprietary toolsets and creative engines developed by RE-RENDER. High-performance utilities for digital architects and post-internet creators.
                    </p>
                </div>
            </section>

            {/* ── TOOLS GRID ── */}
            <section style={{ padding: '4rem 2rem 10rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        <ToolCard
                            icon="🔮"
                            title="AESTHETIC ORACLE"
                            desc="GEMMA-3 powered Creative Director. Engineered to generate high-fidelity scripts and visual directives."
                            link="/lab/ai-agent"
                            tag="AI_CORE"
                            isHot={true}
                        />
                        <ToolCard
                            icon="🌌"
                            title="WALLPAPER LAB"
                            desc="Harness Flux-1 Schnell to render custom digital backdrops. Infinite variations, zero compromise."
                            link="/tools/wallpaper-lab"
                            tag="AI_RENDERER"
                            isHot={true}
                        />
                        <ToolCard
                            icon="✍️"
                            title="CAPTION WRITER"
                            desc="Describe your post. AI generates platform-specific captions for IG, TikTok, X, YouTube, LinkedIn & Facebook."
                            link="/lab/caption-writer"
                            tag="AI_TEXT"
                            isHot={true}
                        />
                        <ToolCard
                            icon="📰"
                            title="AUTO CONTENT GENERATOR"
                            desc="Fetches real-time trending news and instantly creates a viral social media poster with AI imagery and bold text overlays."
                            link="/lab/news-generator"
                            tag="AI_TOOL"
                            isHot={true}
                        />
                        <ToolCard
                            icon="🖼️"
                            title="THUMBNAIL ANALYSER"
                            desc="Upload any thumbnail — AI Vision scores click-through potential, analyzes composition, and gives 3 improvements."
                            link="/lab/thumbnail-analyser"
                            tag="AI_VISION"
                            isHot={true}
                        />
                        <ToolCard
                            icon="⌨️"
                            title="TYPE RACER"
                            desc="Your keyboard is the weapon. Type design manifests and code snippets. Speed earns glory."
                            link="/tools/type-racer"
                            tag="EXPERIMENT"
                        />
                        <ToolCard
                            icon="👁️"
                            title="HEX CODE HERO"
                            desc="Read the matrix. Three hex codes, one background color. Can you spot the difference?"
                            link="/tools/hex-code-hero"
                            tag="EXPERIMENT"
                        />
                        <ToolCard
                            icon="🎨"
                            title="PALETTE PICKER"
                            desc="Steal the aesthetic. Extract and generate cohesive color palettes from visual inputs."
                            link="/tools/palette-picker"
                            tag="UTILITY"
                        />
                        <ToolCard
                            icon="⏱️"
                            title="CHRONO STRIKE"
                            desc="Stop the clock exactly at 5.000s. A brutal test of internal timing and reflexes."
                            link="/tools/reflex"
                            tag="EXPERIMENT"
                        />


                    </div>
                </div>
            </section>
        </div>
    );
};

export default ToolsSection;
