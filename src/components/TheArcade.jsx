import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
const RED = '#E8111A';
const RED_BORDER = 'rgba(232,17,26,0.25)';
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

const ArcadeGameCard = ({ title, desc, icon, link }) => (
    <Link to={link || "#"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <motion.div
            whileHover={{ backgroundColor: 'var(--color-surface)', y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
                border: '1px solid var(--color-border)',
                padding: '2rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                backgroundColor: 'var(--color-bg)',
                position: 'relative', overflow: 'hidden',
                height: '100%',
                cursor: 'pointer'
            }}
        >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '3px', height: '40px', backgroundColor: RED }} />
            <div style={{ fontSize: '2.5rem' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em',
                    color: RED, textTransform: 'uppercase', marginBottom: '0.5rem'
                }}>
                    PLAY NOW
                </div>
                <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem',
                    color: 'var(--color-text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase'
                }}>
                    {title}
                </h3>
                <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                    color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0
                }}>
                    {desc}
                </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    padding: '0.4rem 0.8rem', backgroundColor: RED, color: '#fff',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em'
                }}>
                    ENTER →
                </div>
            </div>
        </motion.div>
    </Link>
);

const TheArcade = () => {
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

            {/* ── HERO BANNER — full GIF ── */}
            <section style={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden', borderBottom: `2px solid ${RED}` }}>
                <img src="/arcade.gif" alt="The Arcade"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 60%, var(--color-bg) 100%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: '4rem', gap: '0.75rem',
                }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.25em', color: RED, textTransform: 'uppercase' }}>
                        00 — RE-RENDER STUDIO
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: 0.85, margin: 0,
                        color: '#fff', textShadow: `0 0 60px ${RED_BORDER}`
                    }}>
                        <GlitchText text="THE ARCADE" />
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'rgba(255,255,255,0.6)',
                        maxWidth: '480px', lineHeight: 1.6, margin: '0.5rem 0 0'
                    }}>
                        Where the studio plays. Games, experiments, and activities — built by RE-RENDER.
                    </p>
                </div>
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.06) 0,rgba(0,0,0,0.06) 1px,transparent 1px,transparent 4px)'
                }} />
            </section>

            {/* ── GAMES SELECTION ── */}
            <section style={{ padding: '8rem 2rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '2rem'
                    }}>
                        <span style={{ color: RED, fontWeight: 700 }}>01</span>
                        <span>— SELECT MISSION</span>
                        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 0.9, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.02em'
                        }}>
                            AVAILABLE<br />
                            <span style={{ color: RED }}>EXPERIENCES</span>
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border)'
                    }}>
                        <ArcadeGameCard
                            icon="⌨️"
                            title="TYPE RACER"
                            desc="Your keyboard is the weapon. Type design manifests and code snippets. Speed earns glory, mistakes cost time."
                            link="/arcade/type-racer"
                        />
                        <ArcadeGameCard
                            icon="👁️"
                            title="HEX CODE HERO"
                            desc="Read the matrix. Three hex codes, one background color. 3 lives. Can you spot #E8111A?"
                            link="/arcade/hex-code-hero"
                        />
                        <ArcadeGameCard
                            icon="🎨"
                            title="PALETTE THIEF"
                            desc="Steal the aesthetic. We show you an image, you guess which color palette was extracted from it. 3 lives."
                            link="/arcade/palette-thief"
                        />
                        <ArcadeGameCard
                            icon="⏱️"
                            title="CHRONO STRIKE"
                            desc="Stop the clock exactly at 5.000s. A brutal test of internal timing and reflexes. Blind mode if you dare."
                            link="/arcade/reflex"
                        />
                    </div>

                    <div style={{
                        marginTop: '4rem', padding: '2rem', border: `1px solid ${RED_BORDER}`,
                        display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em',
                                color: RED, textTransform: 'uppercase', marginBottom: '0.5rem'
                            }}>
                                SUGGEST AN ACTIVITY
                            </div>
                            <p style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                                color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6
                            }}>
                                Got an idea for the next game or activity? We actually read these.
                            </p>
                        </div>
                        <a href="mailto:real.re.render@gmail.com?subject=Arcade Idea"
                            style={{
                                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem',
                                letterSpacing: '0.1em', padding: '0.8rem 2rem',
                                backgroundColor: RED, color: '#fff', textDecoration: 'none',
                                textTransform: 'uppercase', transition: 'transform 0.15s, box-shadow 0.15s',
                                whiteSpace: 'nowrap', flexShrink: 0
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${RED_BORDER}`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            SEND IDEA →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TheArcade;
