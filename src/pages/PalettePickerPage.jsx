import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ROUNDS from '../data/palette-data.json';

const RED = '#E8111A';

const PalettePickerPage = () => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, gameover, victory
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentRound, setCurrentRound] = useState(0);
    const [options, setOptions] = useState([]);
    const [shuffledRounds, setShuffledRounds] = useState([]);

    const generateRound = (roundIndex, rounds) => {
        if (roundIndex >= rounds.length) {
            setGameState('victory');
            return;
        }

        const roundData = rounds[roundIndex];
        // Pick 2 wrong palettes + 1 correct palette
        const wrongSelection = [...roundData.wrongs].sort(() => 0.5 - Math.random()).slice(0, 2);
        const allOptions = [roundData.correct, ...wrongSelection];

        // Shuffle options
        setOptions(allOptions.sort(() => 0.5 - Math.random()));
    };

    const startGame = () => {
        const gameRounds = [...ROUNDS].sort(() => 0.5 - Math.random());
        setShuffledRounds(gameRounds);
        setScore(0);
        setLives(3);
        setCurrentRound(0);
        setGameState('playing');
        generateRound(0, gameRounds);
    };

    const handleGuess = (selectedPalette) => {
        const roundData = shuffledRounds[currentRound];
        const isCorrect = selectedPalette === roundData.correct;

        if (isCorrect) {
            setScore(prev => prev + 100);
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            generateRound(nextRound, shuffledRounds);
        } else {
            setLives(prev => {
                if (prev <= 1) {
                    setGameState('gameover');
                    return 0;
                }
                const nextRound = currentRound + 1;
                setCurrentRound(nextRound);
                generateRound(nextRound, shuffledRounds);
                return prev - 1;
            });
        }
    };

    return (
        <main style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
                <Link to="/arcade" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.1em', color: RED, textDecoration: 'none',
                    textTransform: 'uppercase', marginBottom: '2rem',
                    transition: 'opacity 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                    ← BACK TO ARCADE
                </Link>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem' }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.2em',
                            color: RED, textTransform: 'uppercase', marginBottom: '0.5rem'
                        }}>
                            ARCADE // 04
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.9, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--color-text)'
                        }}>
                            PALETTE<br />THIEF
                        </h1>
                    </div>

                    {gameState === 'playing' && (
                        <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.15em' }}>LIVES</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: lives <= 1 ? RED : 'var(--color-text)', lineHeight: 1 }}>
                                    {Array(lives).fill('♥').join('')}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.15em' }}>SCORE</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: 'var(--color-text)', lineHeight: 1 }}>{score}</div>
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
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                {['#FF0055', '#4D148C', '#00F0FF', '#0D0822'].map(c => (
                                    <div key={c} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: c }} />
                                ))}
                            </div>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2rem', margin: '0 0 1rem', color: 'var(--color-text)' }}>
                                STEAL THE AESTHETIC
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                You are shown an image. Three color palettes are provided. Only one has the correct dominant colors extracted from the image. Identify the true palette.
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
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{
                                width: '100%', height: '400px', backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)', marginBottom: '2rem',
                                backgroundImage: `url(${shuffledRounds[currentRound]?.image || ''})`,
                                backgroundSize: 'cover', backgroundPosition: 'center'
                            }} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {options.map((palette, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleGuess(palette)}
                                        style={{
                                            border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)',
                                            padding: '2rem 1rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                                            display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', height: '120px',
                                            borderRadius: '8px'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        {palette.map(color => (
                                            <motion.div
                                                key={color}
                                                initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                                style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    backgroundColor: color, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    border: '2px solid rgba(255,255,255,0.1)'
                                                }}
                                            />
                                        ))}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {(gameState === 'gameover' || gameState === 'victory') && (
                        <motion.div
                            key="ending"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ border: `2px solid ${RED}`, padding: '4rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: RED }} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.3em', color: RED, marginBottom: '1rem' }}>
                                {gameState === 'victory' ? 'GALLERY CONQUERED' : 'MISSION FAILED'}
                            </div>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '4rem', margin: '0 0 1rem', color: 'var(--color-text)', lineHeight: 1 }}>
                                SCORE <span style={{ color: RED }}>{score}</span>
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>
                                {gameState === 'victory' ? 'You have a perfect eye for color.' : 'Your color theory needs some work.'}
                            </p>

                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                padding: '1rem 3rem', backgroundColor: 'transparent', color: RED, border: `1px solid ${RED}`, cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.15s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = RED; }}>
                                PLAY AGAIN ↺
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default PalettePickerPage;
