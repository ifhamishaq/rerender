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
        <main style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', color: 'var(--color-text)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link to="/arcade" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                    letterSpacing: '0.1em', color: 'var(--color-text)', textDecoration: 'none',
                    textTransform: 'uppercase', marginBottom: '3rem', opacity: 0.5
                }}>
                    ← RETURN_TO_ARCHIVE
                </Link>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem' }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.25em',
                            color: RED, textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 900
                        }}>
                            ISSUE_04 // COLOR_EXTRACTION
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 0.8, margin: 0,
                            letterSpacing: '-0.06em', color: 'var(--color-text)'
                        }}>
                            PALETTE<br />
                            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>THIEF.</span>
                        </h1>
                    </div>

                    {gameState === 'playing' && (
                        <div style={{ display: 'flex', gap: '4rem', textAlign: 'right' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>REMAINING_LIVES</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', color: lives <= 1 ? RED : 'var(--color-text)', lineHeight: 1 }}>
                                    {Array(lives).fill('♥').join('')}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>CAPITAL_SCORE</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', color: 'var(--color-text)', lineHeight: 1 }}>{score}</div>
                            </div>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            style={{ border: '8px solid var(--color-text)', padding: '5rem', textAlign: 'left', backgroundColor: 'var(--color-surface)', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
                                {['#FF0055', '#4D148C', '#00F0FF', '#0D0822'].map(c => (
                                    <div key={c} style={{ width: '45px', height: '45px', backgroundColor: c, border: '4px solid var(--color-text)' }} />
                                ))}
                            </div>
                            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '3.5rem', margin: '0 0 2rem', color: 'var(--color-text)', lineHeight: 1 }}>
                                STEAL THE<br />AESTHETIC.
                            </h2>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: 'var(--color-text)', maxWidth: '600px', margin: '0 0 4rem', lineHeight: 1.6, fontWeight: 500 }}>
                                An image is presented. Three distinct palettes are offered. Only one contains the authentic DNA extracted from the source. Identify the core spectrum or face exclusion.
                            </p>
                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                padding: '1.5rem 4rem', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.2s', width: 'fit-content'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-text)'; }}>
                                COMMENCE_EXTRACTION →
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                width: '100%', height: '450px', backgroundColor: 'var(--color-surface)',
                                border: '8px solid var(--color-text)', marginBottom: '3rem',
                                backgroundImage: `url(${shuffledRounds[currentRound]?.image || ''})`,
                                backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '20px 20px 0px rgba(0,0,0,0.05)'
                            }} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                                {options.map((palette, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleGuess(palette)}
                                        style={{
                                            border: '4px solid var(--color-text)', backgroundColor: 'var(--color-surface)',
                                            padding: '2.5rem 1rem', cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', height: '140px'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        {palette.map(color => (
                                            <div
                                                key={color}
                                                style={{
                                                    width: '45px', height: '45px',
                                                    backgroundColor: color, border: '3px solid var(--color-text)'
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
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ border: `12px solid var(--color-text)`, padding: '6rem 4rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', position: 'relative', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', backgroundColor: gameState === 'victory' ? 'var(--color-text)' : RED }} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.4em', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontWeight: 900 }}>
                                {gameState === 'victory' ? 'ANALYSIS_COMPLETE' : 'SYSTEM_REJECTION'}
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '8rem', margin: '0 0 1rem', color: 'var(--color-text)', lineHeight: 1, letterSpacing: '-0.05em' }}>
                                {score} <span style={{ fontSize: '2rem', color: 'var(--color-text-secondary)' }}>POINTS</span>
                            </h2>
                            <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '4rem', fontWeight: 600 }}>
                                {gameState === 'victory' ? 'Your aesthetic perception is absolute.' : 'Chromatic sync failure detected.'}
                            </p>

                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                <button onClick={startGame} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 4rem', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-text)'; }}>
                                    RETRY_MISSION ↺
                                </button>
                                <button onClick={() => setGameState('menu')} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 3rem', backgroundColor: 'transparent', color: 'var(--color-text)', border: '4px solid var(--color-text)', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-text)'; e.currentTarget.style.color = 'var(--color-bg)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text)'; }}>
                                    DEBRIEFING
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default PalettePickerPage;
