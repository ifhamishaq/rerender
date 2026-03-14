import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const RED = '#E8111A';

// Helper to generate a random hex color
const randomHex = () => '#' + Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0').toUpperCase();

// Helper to generate a color close to the target color (for higher difficulty)
const getSimilarColor = (baseHex, variance) => {
    let r = parseInt(baseHex.slice(1, 3), 16);
    let g = parseInt(baseHex.slice(3, 5), 16);
    let b = parseInt(baseHex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + (Math.floor(Math.random() * variance * 2) - variance)));
    g = Math.min(255, Math.max(0, g + (Math.floor(Math.random() * variance * 2) - variance)));
    b = Math.min(255, Math.max(0, b + (Math.floor(Math.random() * variance * 2) - variance)));

    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const HexCodeHero = () => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [targetColor, setTargetColor] = useState('#000000');
    const [options, setOptions] = useState([]);

    // Timer per round
    const [timeLeft, setTimeLeft] = useState(10);
    const timerRef = useRef(null);
    const [level, setLevel] = useState(1);

    const generateRound = (currentLevel) => {
        const target = randomHex();
        setTargetColor(target);

        let newOptions = [target];
        const numOptions = currentLevel > 5 ? 4 : 3;

        // Variance decreases as level goes up = colors get closer to target
        const variance = Math.max(15, 120 - (currentLevel * 10));

        while (newOptions.length < numOptions) {
            newOptions.push(getSimilarColor(target, variance));
        }

        // Shuffle
        setOptions(newOptions.sort(() => Math.random() - 0.5));

        // Time gets shorter
        setTimeLeft(Math.max(3, 10 - Math.floor(currentLevel / 3)));
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setLevel(1);
        setGameState('playing');
        generateRound(1);
        startTimer();
    };

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleLoss();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleLoss = () => {
        setLives(prev => {
            if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                setGameState('gameover');
                return 0;
            }
            // Lost a life, generate next round anyway
            const nextLevel = level + 1;
            setLevel(nextLevel);
            generateRound(nextLevel);
            return prev - 1;
        });
    };

    const handleGuess = (guess) => {
        if (guess === targetColor) {
            // Correct
            setScore(prev => prev + 100 + (timeLeft * 10));
            const nextLevel = level + 1;
            setLevel(nextLevel);
            generateRound(nextLevel);
        } else {
            // Wrong
            handleLoss();
        }
    };

    // Component unmount
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    return (
        <main style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', minHeight: '100vh', backgroundColor: gameState === 'playing' ? targetColor : 'var(--color-bg)', transition: 'background-color 0.2s' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
                <Link to="/arcade" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.1em', color: gameState === 'playing' ? '#fff' : RED,
                    textDecoration: 'none', textTransform: 'uppercase', marginBottom: '2rem',
                    transition: 'opacity 0.2s', textShadow: gameState === 'playing' ? '0 1px 4px rgba(0,0,0,0.5)' : 'none'
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                    ← BACK TO ARCADE
                </Link>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.2em',
                            color: gameState === 'playing' ? 'rgba(255,255,255,0.7)' : RED,
                            textTransform: 'uppercase', marginBottom: '0.5rem',
                            textShadow: gameState === 'playing' ? '0 1px 4px rgba(0,0,0,0.5)' : 'none'
                        }}>
                            ARCADE // 03
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.9, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.02em',
                            color: gameState === 'playing' ? '#fff' : 'var(--color-text)',
                            textShadow: gameState === 'playing' ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'
                        }}>
                            HEX CODE<br />HERO
                        </h1>
                    </div>

                    {gameState === 'playing' && (
                        <div style={{ display: 'flex', gap: '2rem', textAlign: 'right', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', opacity: 0.7 }}>LIVES</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>
                                    {Array(lives).fill('♥').join('')}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', opacity: 0.7 }}>SCORE</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', lineHeight: 1 }}>{score}</div>
                            </div>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            style={{ border: '1px solid var(--color-border)', padding: '4rem', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#E8111A' }} />
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#00FF00' }} />
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#0000FF' }} />
                            </div>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2rem', margin: '0 0 1rem', color: 'var(--color-text)' }}>
                                READ THE MATRIX
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                The background changes color. You get 3 hex codes. Pick the one that matches. The colors get closer and the timer gets faster entirely based on your level. 3 lives.
                            </p>
                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em',
                                padding: '1rem 3rem', backgroundColor: RED, color: '#fff', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'transform 0.15s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                START MISSION →
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>

                            <div style={{ textAlign: 'center', marginBottom: '3rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                                    LEVEL {level}
                                </div>
                                <div style={{
                                    fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900,
                                    fontSize: '5rem', lineHeight: 1,
                                    color: timeLeft <= 3 ? '#ff0000' : '#fff'
                                }}>
                                    {timeLeft}s
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: '1rem' }}>
                                {options.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleGuess(option)}
                                        style={{
                                            padding: '2rem', backgroundColor: 'rgba(255,255,255,0.9)',
                                            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                            fontSize: '1.25rem', fontWeight: 700, color: '#000',
                                            transition: 'transform 0.1s', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'gameover' && (
                        <motion.div
                            key="gameover"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ border: `2px solid ${RED}`, padding: '4rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: RED }} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.3em', color: RED, marginBottom: '1rem' }}>
                                MISSION FAILED
                            </div>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '4rem', margin: '0 0 1rem', color: 'var(--color-text)', lineHeight: 1 }}>
                                SCORE <span style={{ color: RED }}>{score}</span>
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>
                                You survived until Level {level}.
                            </p>

                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                padding: '1rem 3rem', backgroundColor: 'transparent', color: RED, border: `1px solid ${RED}`, cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.15s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = RED; }}>
                                TRY AGAIN ↺
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default HexCodeHero;
