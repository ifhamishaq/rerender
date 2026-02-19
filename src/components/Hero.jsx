import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import heroImg from '../assets/hero.jpeg';

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
                            if (index < iteration) {
                                return text[index];
                            }
                            if (letter === ' ' || letter === '\n') return letter;
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join("")
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, 30);
        };

        // Delay start slightly
        setTimeout(startScramble, 500);

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
    // Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove({ clientX, clientY }) {
        const { innerWidth, innerHeight } = window;
        const xPct = clientX / innerWidth - 0.5;
        const yPct = clientY / innerHeight - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
    const moveX = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
    const moveY = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section className="hero-section">
            <div style={{
                padding: '4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRight: '1px solid var(--color-text)',
            }}>
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        fontSize: 'clamp(3rem, 6vw, 8rem)',
                        lineHeight: 0.9,
                        marginBottom: '2rem',
                        minHeight: '3em' // Prevent layout shift
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        maxWidth: '400px',
                        fontSize: '1.1rem'
                    }}
                >
                    The ultimate digital asset pack for the post-internet age.
                    Raw, unfiltered, and ready to render.
                </motion.p>
            </div>

            <div style={{
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                perspective: '1000px' // For 3D tilt
            }}>
                {/* Decorative Grid */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.05,
                    pointerEvents: 'none'
                }}></div>

                <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    style={{
                        width: '60%',
                        height: '70%',
                        backgroundColor: '#000',
                        position: 'relative',
                        rotateX,
                        rotateY,
                        x: moveX,
                        y: moveY
                    }}
                >
                    {/* Hero Image */}
                    <img
                        src={heroImg}
                        alt="RE-RENDER Hero"
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'grayscale(100%) contrast(120%)', // Initial state
                            pointerEvents: 'none'
                        }}
                    />

                    {/* Brutalist accents */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'var(--color-accent)',
                        zIndex: 1,
                        transform: 'translateZ(20px)'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '-10px',
                        width: '100px',
                        height: '20px',
                        backgroundColor: 'var(--color-text)',
                        zIndex: 1,
                        transform: 'translateZ(30px)'
                    }}></div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '4rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                SCROLL2EXPLORE
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ width: '1px', height: '40px', backgroundColor: 'var(--color-text)' }}
                />
            </div>
        </section>
    );
};

export default Hero;
