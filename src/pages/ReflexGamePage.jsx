import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const RED = '#E8111A';
const TARGET_TIME = 5.000;

// Independent component to force high-frequency renders without parent state blocking it
const TimeDisplay = ({ startTime, isHardMode, isFinished, isPressing, finalTime }) => {
    const [displayTime, setDisplayTime] = useState(0);
    const requestRef = useRef();

    const animate = () => {
        if (!startTime || isFinished || !isPressing) return;
        const now = performance.now();
        setDisplayTime((now - startTime) / 1000);
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isPressing && !isFinished) {
            requestRef.current = requestAnimationFrame(animate);
        } else if (isFinished) {
            setDisplayTime(finalTime);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        } else if (!isPressing && !isFinished) {
            setDisplayTime(0);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPressing, isFinished, finalTime]);

    const shouldHide = isHardMode && displayTime >= 1.0 && !isFinished;

    return (
        <div style={{
            fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900,
            fontSize: 'clamp(5rem, 15vw, 12rem)', lineHeight: 1,
            color: shouldHide ? 'transparent' : 'var(--color-text)',
            textShadow: shouldHide ? 'none' : (!isFinished ? `0 0 20px rgba(232, 17, 26, 0.2)` : 'none'),
            transition: 'color 0.1s'
        }}>
            {displayTime.toFixed(3)}<span style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: shouldHide ? 'transparent' : 'var(--color-text-secondary)' }}>s</span>
        </div>
    );
};

const ReflexGamePage = () => {
    const [gameState, setGameState] = useState('menu'); // menu, waiting, reacting, finished
    const [isHardMode, setIsHardMode] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [finalTime, setFinalTime] = useState(0);
    const [bestScore, setBestScore] = useState(localStorage.getItem('chrono_strike_best') || null);

    const startTimeRef = useRef(null);
    const animationRef = useRef(null);
    const [isPressing, setIsPressing] = useState(false);

    // Calculate score / rank based on how close to 5.000s
    const calculateRank = (time) => {
        const diff = Math.abs(time - TARGET_TIME);
        if (diff === 0) return { rank: 'SSS', title: 'TIME GOD', color: '#FFD700', desc: 'Absolute perfection. 0ms deviation.' };
        if (diff <= 0.050) return { rank: 'S', title: 'MACHINE', color: '#34A853', desc: 'Sub-50ms deviation. Professional reflexes.' };
        if (diff <= 0.150) return { rank: 'A', title: 'SHARP', color: '#4285F4', desc: 'Highly accurate timing.' };
        if (diff <= 0.300) return { rank: 'B', title: 'QUICK', color: '#FBBC05', desc: 'Good internal clock.' };
        if (diff <= 0.750) return { rank: 'C', title: 'AVERAGE', color: 'var(--color-text)', desc: 'Needs calibration.' };
        return { rank: 'D', title: 'LAGGING', color: 'var(--color-text-secondary)', desc: 'Your internal clock is broken.' };
    };

    const handlePressStart = (e) => {
        // Prevent default spacebar scrolling, handle touch
        if (e.type === 'keydown' && e.code !== 'Space') return;
        if (e.type === 'keydown') e.preventDefault();

        if (gameState !== 'waiting' || isPressing) return;

        setIsPressing(true);
        setGameState('reacting');
        startTimeRef.current = performance.now();
    };

    const handlePressEnd = (e) => {
        if (e.type === 'keyup' && e.code !== 'Space') return;
        if (gameState !== 'reacting' || !isPressing) return;

        setIsPressing(false);
        const now = performance.now();
        const totalTime = (now - startTimeRef.current) / 1000;
        setFinalTime(totalTime);
        setElapsed(totalTime);
        setGameState('finished');

        // Update Best Score
        const diff = Math.abs(totalTime - TARGET_TIME);
        const currentBest = bestScore ? parseFloat(bestScore) : null;
        if (currentBest === null || diff < Math.abs(currentBest - TARGET_TIME)) {
            setBestScore(totalTime.toFixed(3));
            localStorage.setItem('chrono_strike_best', totalTime.toFixed(3));
        }
    };

    // Global event listeners for holding spacebar anywhere
    useEffect(() => {
        if (gameState === 'waiting' || gameState === 'reacting') {
            window.addEventListener('keydown', handlePressStart);
            window.addEventListener('keyup', handlePressEnd);
        }
        return () => {
            window.removeEventListener('keydown', handlePressStart);
            window.removeEventListener('keyup', handlePressEnd);
        };
    }, [gameState, isPressing]);

    const resetGame = () => {
        setElapsed(0);
        setFinalTime(0);
        setIsPressing(false);
        setGameState('waiting');
    };

    const rankData = gameState === 'finished' ? calculateRank(finalTime) : null;

    return (
        <main style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                            ARCADE // 05
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.9, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--color-text)'
                        }}>
                            CHRONO<br />STRIKE
                        </h1>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            style={{ border: '1px solid var(--color-border)', padding: '4rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏱️</div>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2rem', margin: '0 0 1rem', color: 'var(--color-text)' }}>
                                STOP TIME AT EXACTLY 5.000s
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                                Press and hold the screen or Spacebar to start the timer. Release exactly when 5 seconds have passed. Your internal clock is your only weapon.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: isHardMode ? 'var(--color-text-secondary)' : RED, fontWeight: 700 }}>NORMAL</span>
                                <button
                                    onClick={() => setIsHardMode(!isHardMode)}
                                    style={{
                                        width: '60px', height: '30px', borderRadius: '15px', backgroundColor: isHardMode ? RED : 'var(--color-border)',
                                        position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s'
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: isHardMode ? 30 : 2 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        style={{ width: '26px', height: '26px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: 0 }}
                                    />
                                </button>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: isHardMode ? RED : 'var(--color-text-secondary)', fontWeight: 700 }}>BLIND MODE</span>
                            </div>

                            {isHardMode && (
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: RED, marginTop: '-2rem', marginBottom: '3rem', letterSpacing: '0.05em' }}>
                                    WARNING: Visual timer disables after 1.000s.
                                </p>
                            )}

                            <button onClick={resetGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em',
                                padding: '1.25rem 4rem', backgroundColor: RED, color: '#fff', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'transform 0.15s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                INITIALIZE →
                            </button>
                        </motion.div>
                    )}

                    {(gameState === 'waiting' || gameState === 'reacting') && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            onMouseDown={handlePressStart}
                            onMouseUp={handlePressEnd}
                            onTouchStart={handlePressStart}
                            onTouchEnd={handlePressEnd}
                            style={{
                                border: '1px solid var(--color-border)', flex: 1, display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center', backgroundColor: isPressing ? 'var(--color-surface)' : 'var(--color-bg)',
                                cursor: 'pointer', userSelect: 'none', transition: 'background-color 0.2s', padding: '2rem'
                            }}
                        >
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: RED, letterSpacing: '0.2em', marginBottom: '2rem', height: '1.5rem' }}>
                                {(isHardMode && gameState === 'reacting') ? 'BLIND MODE ACTIVE' : 'TARGET: 5.000s'}
                            </div>

                            <TimeDisplay
                                startTime={startTimeRef.current}
                                isHardMode={isHardMode}
                                isFinished={false}
                                isPressing={isPressing}
                            />

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', letterSpacing: '0.1em', marginTop: '4rem', opacity: isPressing ? 0 : 1, transition: 'opacity 0.2s' }}>
                                HOLD CLICK OR SPACEBAR TO START. RELEASE TO STOP.
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'finished' && (
                        <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
                            border: `2px solid ${rankData.color}`, padding: '4rem 2rem', textAlign: 'center',
                            backgroundColor: 'var(--color-surface)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: rankData.color }} />

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                ELAPSED TIME
                            </div>

                            <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '5rem', color: 'var(--color-text)', lineHeight: 1, marginBottom: '0.5rem' }}>
                                {finalTime.toFixed(3)}<span style={{ fontSize: '2rem', color: 'var(--color-text-secondary)' }}>s</span>
                            </div>

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: rankData.color, marginBottom: '3rem' }}>
                                {Math.abs(finalTime - TARGET_TIME) > 0 ? (finalTime > TARGET_TIME ? '+' : '-') : ''}
                                {Math.abs(finalTime - TARGET_TIME).toFixed(3)}s DEVIATION
                            </div>

                            <div style={{
                                borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)',
                                padding: '2rem 0', margin: '0 auto 3rem', maxWidth: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem'
                            }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>EVALUATION</div>
                                    <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '1.5rem', color: rankData.color }}>{rankData.title}</div>
                                </div>
                                <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', color: rankData.color, lineHeight: 1 }}>
                                    {rankData.rank}
                                </div>
                            </div>

                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text)', maxWidth: '400px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                {rankData.desc}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={resetGame} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                    padding: '1rem 3rem', backgroundColor: RED, color: '#fff', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'transform 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    RETRY ↺
                                </button>

                                <button onClick={() => setGameState('menu')} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                    padding: '1rem 2rem', backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.15s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-text)'; e.currentTarget.style.color = 'var(--color-bg)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text)'; }}>
                                    MENU
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default ReflexGamePage;
