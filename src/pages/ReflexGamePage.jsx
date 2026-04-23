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
        <main style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh', backgroundColor: '#F8F6F1', display: 'flex', flexDirection: 'column', color: '#000' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link to="/arcade" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                    letterSpacing: '0.1em', color: '#000', textDecoration: 'none',
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
                            ISSUE_05 // TEMPORAL_STRIKE
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 0.8, margin: 0,
                            letterSpacing: '-0.06em', color: '#000'
                        }}>
                            CHRONO<br />
                            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>STRIKE.</span>
                        </h1>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            style={{ border: '8px solid #000', padding: '5rem', textAlign: 'left', backgroundColor: '#fff', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3, fontWeight: 900 }}>REF_5000ms_PRECISION</div>
                            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '3rem', margin: '0 0 2rem', color: '#000', lineHeight: 1 }}>
                                STOP TIME AT<br />EXACTLY 05.000s.
                            </h2>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: '#333', maxWidth: '600px', margin: '0 0 3rem', lineHeight: 1.6, fontWeight: 500 }}>
                                Your internal clock is the ONLY instrument. Hold the strike zone to commence; release exactly at the five-second mark. Any deviation is a failure of synchronization.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: isHardMode ? '#999' : RED, fontWeight: 900 }}>VISIBLE_MODE</span>
                                <button
                                    onClick={() => setIsHardMode(!isHardMode)}
                                    style={{
                                        width: '70px', height: '35px', backgroundColor: '#000',
                                        position: 'relative', border: 'none', cursor: 'pointer', borderRadius: '100px'
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: isHardMode ? 35 : 5, backgroundColor: isHardMode ? RED : '#fff' }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        style={{ width: '25px', height: '25px', borderRadius: '50%', position: 'absolute', top: '5px', left: 0 }}
                                    />
                                </button>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: isHardMode ? RED : '#999', fontWeight: 900 }}>BLIND_STRIKE</span>
                            </div>

                            <button onClick={resetGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                padding: '1.5rem 4rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.2s', width: 'fit-content'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000'; }}>
                                INITIALIZE_WATCH →
                            </button>
                        </motion.div>
                    )}

                    {(gameState === 'waiting' || gameState === 'reacting') && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onMouseDown={handlePressStart}
                            onMouseUp={handlePressEnd}
                            onTouchStart={handlePressStart}
                            onTouchEnd={handlePressEnd}
                            style={{
                                border: '12px solid #000', flex: 1, display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center', backgroundColor: isPressing ? '#fff' : '#F8F6F1',
                                cursor: 'pointer', userSelect: 'none', transition: 'background-color 0.4s', padding: '4rem', position: 'relative'
                            }}
                        >
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: RED, letterSpacing: '0.4em', marginBottom: '4rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                {(isHardMode && gameState === 'reacting') ? 'BLIND_STRIKE_ACTIVE' : 'TARGET_THRESHOLD: 05.000s'}
                            </div>

                            <TimeDisplay
                                startTime={startTimeRef.current}
                                isHardMode={isHardMode}
                                isFinished={false}
                                isPressing={isPressing}
                            />

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#999', letterSpacing: '0.2em', marginTop: '5rem', opacity: isPressing ? 0 : 0.5, transition: 'opacity 0.2s', fontWeight: 900 }}>
                                HOLD STRIKE ZONE TO START. RELEASE TO CAPTURE.
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'finished' && (
                        <motion.div key="finished" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{
                            border: `12px solid #000`, padding: '6rem 4rem', textAlign: 'center',
                            backgroundColor: '#fff', position: 'relative', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', backgroundColor: rankData.color }} />

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.4em', color: '#999', marginBottom: '1rem', fontWeight: 900 }}>
                                CAPTURED_TIMESTAMP
                            </div>

                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '10rem', color: '#000', lineHeight: 0.8, marginBottom: '2rem', letterSpacing: '-0.05em' }}>
                                {finalTime.toFixed(3)}<span style={{ fontSize: '3rem', color: '#999' }}>S</span>
                            </div>

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: rankData.color, marginBottom: '5rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                                {Math.abs(finalTime - TARGET_TIME) > 0 ? (finalTime > TARGET_TIME ? '+' : '-') : ''}
                                {Math.abs(finalTime - TARGET_TIME).toFixed(3)}s DEVIATION
                            </div>

                            <div style={{
                                borderTop: '4px solid #000', borderBottom: '4px solid #000',
                                padding: '3rem 0', margin: '0 auto 5rem', width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem'
                            }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#999', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>EVALUATION</div>
                                    <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 900, fontSize: '2.5rem', color: '#000', lineHeight: 1 }}>{rankData.title}</div>
                                </div>
                                <div style={{ fontSize: '8rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: rankData.color, lineHeight: 1, letterSpacing: '-0.05em' }}>
                                    {rankData.rank}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={resetGame} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 4rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000'; }}>
                                    RETRY_STRIKE ↺
                                </button>

                                <button onClick={() => setGameState('menu')} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 3rem', backgroundColor: 'transparent', color: '#000', border: '4px solid #000', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000'; }}>
                                    RETURN_TO_DEBRIEF
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
