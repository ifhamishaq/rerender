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
            whileHover={{ backgroundColor: 'var(--color-surface)', y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
                border: isHot ? `1px solid ${ACCENT}` : '1px solid var(--color-border)',
                padding: '2.5rem',
                display: 'flex', flexDirection: 'column', gap: '1.5rem',
                backgroundColor: 'var(--color-bg)',
                position: 'relative', overflow: 'hidden',
                height: '100%',
                cursor: 'pointer',
                boxShadow: isHot ? `0 0 20px rgba(232,17,26,0.05)` : 'none'
            }}
        >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '60px', backgroundColor: ACCENT }} />
            
            {isHot && (
                <div style={{
                    position: 'absolute', top: '1.5rem', right: '-2.5rem',
                    backgroundColor: ACCENT, color: '#000', padding: '0.25rem 3rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900,
                    transform: 'rotate(45deg)', letterSpacing: '0.1em', boxShadow: '0 0 10px rgba(232,17,26,0.3)',
                    zIndex: 10
                }}>
                    HOT
                </div>
            )}

            <div style={{ fontSize: '3rem' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.3em',
                    color: ACCENT, textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 700
                }}>
                    // {tag}
                </div>
                <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem',
                    color: 'var(--color-text)', margin: '0 0 0.75rem', letterSpacing: '-0.02em', textTransform: 'uppercase'
                }}>
                    {title}
                </h3>
                <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0
                }}>
                    {desc}
                </p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    padding: '0.5rem 1.25rem', border: `1px solid ${ACCENT}`, color: ACCENT,
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em'
                }}>
                    LAUNCH_SYSTEM →
                </div>
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
                            link="/arcade/wallpaper-lab"
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
                            link="/arcade/type-racer"
                            tag="EXPERIMENT"
                        />
                        <ToolCard
                            icon="👁️"
                            title="HEX CODE HERO"
                            desc="Read the matrix. Three hex codes, one background color. Can you spot the difference?"
                            link="/arcade/hex-code-hero"
                            tag="EXPERIMENT"
                        />
                        <ToolCard
                            icon="🎨"
                            title="PALETTE PICKER"
                            desc="Steal the aesthetic. Extract and generate cohesive color palettes from visual inputs."
                            link="/arcade/palette-picker"
                            tag="UTILITY"
                        />
                        <ToolCard
                            icon="⏱️"
                            title="CHRONO STRIKE"
                            desc="Stop the clock exactly at 5.000s. A brutal test of internal timing and reflexes."
                            link="/arcade/reflex"
                            tag="EXPERIMENT"
                        />
                        <ToolCard
                            icon="🗒️"
                            title="PROMPT LAB"
                            desc="A centralized repository of engineered visual directives for generative workflows."
                            link="/prompts"
                            tag="KNOWLEDGE_BASE"
                        />
                        <ToolCard
                            icon="📱"
                            title="SAFE ZONE PREVIEW"
                            desc="Upload 9:16 frames and toggle TikTok/Reels UI overlays. Avoid 'Dead Zones' automatically."
                            link="/lab/safe-zone"
                            tag="UX_UTILITY"
                        />
                        <ToolCard
                            icon="📊"
                            title="PROJECT ESTIMATOR"
                            desc="Calculate your investment in real-time. Lock in professional quotes for video, 3D, and design."
                            link="/estimate"
                            tag="FINANCE_TOOL"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ToolsSection;
