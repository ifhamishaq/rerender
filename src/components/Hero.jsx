import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TextScramble = ({ text, className, style }) => {
    const [display, setDisplay] = useState(text);
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    useEffect(() => {
        let iteration = 0;
        let interval = null;

        const startScramble = () => {
            interval = setInterval(() => {
                setDisplay(
                    text
                        .split("")
                        .map((letter, index) => {
                            if (index < iteration) return text[index];
                            if (letter === ' ' || letter === '\n') return letter;
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join("")
                );
                if (iteration >= text.length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
        };

        setTimeout(startScramble, 300);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className={className} style={style}>
            {display.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    {i < display.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))}
        </span>
    );
};

const Hero = () => {
    const { isDarkMode } = useTheme();
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -999, y: -999 });
    // Mouse parallax for the image card
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 120, damping: 18 });
    const mouseY = useSpring(y, { stiffness: 120, damping: 18 });

    function handleMouseMove({ clientX, clientY }) {
        const { innerWidth, innerHeight } = window;
        x.set(clientX / innerWidth - 0.5);
        y.set(clientY / innerHeight - 0.5);
        // Track for dot grid
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
        }
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
    const moveX = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
    const moveY = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

    // Scroll parallax
    const { scrollY } = useScroll();
    const textY = useTransform(scrollY, [0, 600], [0, -120]);
    const imageY = useTransform(scrollY, [0, 600], [0, -60]);
    const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);

    // Interactive dot grid on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const GAP = 28;
        let animId;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cols = Math.ceil(canvas.width / GAP);
            const rows = Math.ceil(canvas.height / GAP);
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const RADIUS = 120;
            const dotColor = isDarkMode ? '239,239,239' : '14,14,14';

            // 1. Draw inactive dots in batch
            ctx.beginPath();
            ctx.fillStyle = `rgba(${dotColor}, 0.12)`;
            for (let r = 0; r <= rows; r++) {
                for (let c = 0; c <= cols; c++) {
                    const dx = c * GAP - mx;
                    const dy = r * GAP - my;
                    const distSq = dx * dx + dy * dy;
                    if (distSq >= RADIUS * RADIUS) {
                        ctx.moveTo(c * GAP, r * GAP);
                        ctx.arc(c * GAP, r * GAP, 1.5, 0, Math.PI * 2);
                    }
                }
            }
            ctx.fill();

            // 2. Draw active dots with individual properties
            for (let r = 0; r <= rows; r++) {
                for (let c = 0; c <= cols; c++) {
                    const dx = c * GAP - mx;
                    const dy = r * GAP - my;
                    const distSq = dx * dx + dy * dy;
                    
                    if (distSq < RADIUS * RADIUS) {
                        const dist = Math.sqrt(distSq);
                        const proximity = Math.max(0, 1 - dist / RADIUS);
                        const size = 1.5 + proximity * 4;
                        const alpha = 0.12 + proximity * 0.88;

                        // Accent glow
                        ctx.beginPath();
                        ctx.arc(c * GAP, r * GAP, size + 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(57,255,20,${proximity * 0.4})`;
                        ctx.fill();

                        // Base dot
                        ctx.beginPath();
                        ctx.arc(c * GAP, r * GAP, size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${dotColor},${alpha})`;
                        ctx.fill();
                    }
                }
            }
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [isDarkMode]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section className="hero-section">
            {/* Left — Text Content with scroll parallax */}
            <motion.div
                style={{
                    padding: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRight: '1px solid var(--color-border)',
                    position: 'relative',
                    y: textY,
                    opacity: textOpacity,
                }}
            >
                {/* Editorial section marker */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '4rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.2em',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>00</span>
                    &mdash; RE-RENDER STUDIO
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                        fontSize: 'clamp(3rem, 6vw, 8rem)',
                        lineHeight: 0.9,
                        marginBottom: '2rem',
                        minHeight: '3em'
                    }}
                >
                    <TextScramble text={`RENDER\nTHE`} />
                    <br />
                    <span style={{
                        color: 'transparent',
                        WebkitTextStroke: '2px var(--color-text)',
                        fontStyle: 'italic'
                    }}>
                        <TextScramble text="UNSEEN" />
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.7, ease: 'easeOut' }}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        maxWidth: '400px',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        color: 'var(--color-text-secondary)'
                    }}
                >
                    The ultimate digital asset pack for the post-internet age.
                    Raw, unfiltered, and ready to render.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
                >
                    <a href="/services"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            letterSpacing: '0.08em',
                            padding: '0.85rem 2rem',
                            backgroundColor: 'var(--color-accent)',
                            color: '#000',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            display: 'inline-block',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(57,255,20,0.3)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        VIEW SERVICES →
                    </a>
                    <a href="mailto:real.re.render@gmail.com"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            letterSpacing: '0.08em',
                            padding: '0.85rem 2rem',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            transition: 'border-color 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-text)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    >
                        HIRE US
                    </a>
                </motion.div>
            </motion.div>

            {/* Right — Image with slower scroll parallax */}
            <motion.div
                style={{
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    perspective: '1000px',
                    y: imageY,
                }}
            >
                {/* Interactive Dot Grid Canvas */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        opacity: 0.6,
                    }}
                />

                <motion.div
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.4, ease: "circOut", delay: 0.1 }}
                    style={{
                        width: '50%',
                        aspectRatio: '9 / 16',
                        maxHeight: '90%',
                        backgroundColor: 'var(--color-text)',
                        position: 'relative',
                        rotateX,
                        rotateY,
                        x: moveX,
                        y: moveY,
                        overflow: 'hidden',
                    }}
                >
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            pointerEvents: 'none',
                            filter: isDarkMode
                                ? 'invert(0) contrast(1.1)'
                                : 'invert(1) contrast(1.1)',
                            transition: 'filter 0.5s ease',
                        }}
                    >
                        <source src="/hero.mp4" type="video/mp4" />
                    </video>

                    {/* Brutalist accents */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px', right: '-10px',
                        width: '20px', height: '20px',
                        backgroundColor: 'var(--color-accent)',
                        zIndex: 1,
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-10px', left: '-10px',
                        width: '100px', height: '20px',
                        backgroundColor: 'var(--color-text)',
                        zIndex: 1,
                    }} />
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '4rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--color-text-secondary)',
                }}
            >
                SCROLL
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-text-secondary)' }}
                />
            </motion.div>
        </section>
    );
};

export default Hero;
