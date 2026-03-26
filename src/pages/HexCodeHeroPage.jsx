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
        <main style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh', backgroundColor: gameState === 'playing' ? targetColor : '#F8F6F1', transition: 'background-color 0.4s cubic-bezier(0.23, 1, 0.32, 1)', color: '#000' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
                <Link to="/arcade" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                    letterSpacing: '0.1em', color: gameState === 'playing' ? '#fff' : '#000',
                    textDecoration: 'none', textTransform: 'uppercase', marginBottom: '3rem',
                    transition: 'opacity 0.2s', textShadow: gameState === 'playing' ? '0 1px 10px rgba(0,0,0,0.3)' : 'none', opacity: 0.5
                }}>
                    ← RETURN_TO_ARCHIVE
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', marginBottom: '4rem', alignItems: 'end' }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.25em',
                            color: gameState === 'playing' ? 'rgba(255,255,255,0.7)' : RED,
                            textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 900,
                            textShadow: gameState === 'playing' ? '0 1px 10px rgba(0,0,0,0.3)' : 'none'
                        }}>
                            ISSUE_04 // CHROMATIC_RECALL
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 0.8, margin: 0,
                            letterSpacing: '-0.06em',
                            color: gameState === 'playing' ? '#fff' : '#000',
                            textShadow: gameState === 'playing' ? '0 2px 20px rgba(0,0,0,0.2)' : 'none'
                        }}>
                            HEX CODE<br />
                            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>HERO.</span>
                        </h1>
                    </div>

                    {gameState === 'playing' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '4px solid #fff', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ padding: '1.5rem', borderRight: '2px solid #fff' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 900 }}>LIVES</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>
                                    {Array(lives).fill('♥').join('')}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 900 }}>SCORE</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>{score}</div>
                            </div>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            style={{ border: '8px solid #000', padding: '5rem', textAlign: 'left', backgroundColor: '#fff', position: 'relative' }}
                        >
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3, fontWeight: 900 }}>SYSTEM_CALIB_v0.4</div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ width: '60px', height: '60px', border: '4px solid #000', backgroundColor: '#E8111A' }} />
                                <div style={{ width: '60px', height: '60px', border: '4px solid #000', backgroundColor: '#34A853' }} />
                                <div style={{ width: '60px', height: '60px', border: '4px solid #000', backgroundColor: '#4285F4' }} />
                            </div>
                            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '3rem', margin: '0 0 2rem', color: '#000', lineHeight: 1 }}>
                                THE CHROMATIC<br />TURING TEST.
                            </h2>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: '#333', maxWidth: '600px', margin: '0 0 4rem', lineHeight: 1.6, fontWeight: 500 }}>
                                Can you read the matrix? The environment shifts color; you must identify the precise hexadecimal value in under ten seconds. 03 lives. Precision is binary.
                            </p>
                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                padding: '1.5rem 4rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000'; }}>
                                START_CALIBRATION →
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div key="playing" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

                            <div style={{ textAlign: 'center', marginBottom: '4rem', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.3em', marginBottom: '1rem', fontWeight: 900 }}>
                                    STAGE_{level.toString().padStart(2, '0')}
                                </div>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontWeight: 900,
                                    fontSize: '8rem', lineHeight: 0.8,
                                    letterSpacing: '-0.05em'
                                }}>
                                    {timeLeft}<span style={{ fontSize: '3rem' }}>S</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                                {options.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleGuess(option)}
                                        style={{
                                            padding: '2.5rem', backgroundColor: '#fff',
                                            border: '6px solid #000', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                                            fontSize: '1.5rem', fontWeight: 900, color: '#000',
                                            transition: 'transform 0.1s', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
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
                            style={{ border: `12px solid #000`, padding: '6rem', textAlign: 'center', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', backgroundColor: RED }} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.4em', color: RED, marginBottom: '2rem', fontWeight: 900 }}>
                                SIGNAL_LOST // TERMINATED
                            </div>
                            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '5rem', margin: '0 0 1rem', color: '#000', lineHeight: 0.9, letterSpacing: '-0.04em' }}>
                                SCORE: {score}
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#666', marginBottom: '4rem', fontWeight: 900 }}>
                                PERSISTED UNTIL STAGE {level}.
                            </p>

                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                padding: '1.5rem 4rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000'; }}>
                                REBOOT_SESSION ↺
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default HexCodeHero;
