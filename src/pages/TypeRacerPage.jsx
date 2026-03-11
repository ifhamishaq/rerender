import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';

const RED = '#E8111A';

const MANIFESTO = "Design is not just what it looks like and feels like. Design is how it works. We render ideas into reality. A high quality creative studio for post-internet brands. We do not just build websites; we craft digital experiences that demand attention. Synergize the wireframes. Optimize the user journey. Deploy the aesthetic. The paradigm shift in our UI components will leverage async workflows to maximize conversion rates. export default function Studio() { const [glitch, setGlitch] = useState(false); useEffect(() => { if (glitch) handleDistortion(); }, [glitch]); return <Canvas />; } Digital brutalism meets neo-corporate transparency. 01001000 01000101 01001100 01001100 01001111. The matrix is reading the hex codes perfectly. The cursor blinks. The terminal awaits your command.";

const TypeRacer = () => {
    const [gameState, setGameState] = useState('menu'); // menu, playing, name_input, gameover
    const [input, setInput] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [hasStartedTyping, setHasStartedTyping] = useState(false);

    // Stats
    const [rawWpm, setRawWpm] = useState(0);
    const [netWpm, setNetWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [errors, setErrors] = useState(0); // Uncorrected errors at end
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [backspaceCount, setBackspaceCount] = useState(0);
    const [currentCombo, setCurrentCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    // Timer
    const [timeLeft, setTimeLeft] = useState(60);
    const timerRef = useRef(null);
    const inputRef = useRef(null);
    const certRef = useRef(null);
    const [isCopied, setIsCopied] = useState(false);

    const startGame = () => {
        setInput('');
        setRawWpm(0);
        setNetWpm(0);
        setAccuracy(100);
        setErrors(0);
        setTotalKeystrokes(0);
        setBackspaceCount(0);
        setCurrentCombo(0);
        setMaxCombo(0);
        setTimeLeft(60);
        setStartTime(null);
        setHasStartedTyping(false);
        setGameState('playing');

        if (timerRef.current) clearInterval(timerRef.current);
    };

    const endGame = () => {
        setGameState('name_input');
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            setGameState('gameover');
        }
    };

    // Keep input focused
    useEffect(() => {
        if (gameState === 'playing' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameState]);

    const handleKeyDown = (e) => {
        if (gameState !== 'playing') return;

        if (!hasStartedTyping && e.key.length === 1) {
            setHasStartedTyping(true);
            setStartTime(Date.now());

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        if (e.key === 'Backspace') {
            setBackspaceCount(prev => prev + 1);
            setCurrentCombo(0); // Break combo on backspace
        } else if (e.key.length === 1) {
            setTotalKeystrokes(prev => prev + 1);
        }
    };

    const handleChange = (e) => {
        if (gameState !== 'playing') return;

        const val = e.target.value;
        const currentPrompt = MANIFESTO;

        // Check if just typed char is correct for combo
        if (val.length > input.length) {
            const lastCharIndex = val.length - 1;
            if (val[lastCharIndex] === currentPrompt[lastCharIndex]) {
                const newCombo = currentCombo + 1;
                setCurrentCombo(newCombo);
                if (newCombo > maxCombo) setMaxCombo(newCombo);
            } else {
                setCurrentCombo(0);
            }
        }

        // Calculate uncorrected errors
        let currentErrors = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] !== currentPrompt[i]) {
                currentErrors++;
            }
        }
        setErrors(currentErrors);
        setInput(val);

        const totalEntries = totalKeystrokes || 1;
        // Total correct keystrokes over lifetime of session
        // (totalKeystrokes - number of times they broke a stroke - current uncorrected errors) can be messy.
        // Instead, standard accuracy: (correct typed) / (total keydowns including backspaces ideally, or just total length + backspaces)
        const totalActionCount = input.length + backspaceCount + currentErrors;
        const acc = Math.max(0, Math.round(((input.length - currentErrors) / totalEntries) * 100));
        setAccuracy(acc > 100 ? 100 : acc);

        // Calculate RAW and NET WPM
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        if (elapsedMinutes > 0) {
            const rawWpmCalc = Math.round((totalKeystrokes / 5) / elapsedMinutes);
            setRawWpm(Math.max(0, rawWpmCalc));

            // Standard Net WPM: (Total Keystrokes / 5) - Uncorrected Errors / Time
            // We'll use (totalKeystrokes / 5 - currentErrors) / elapsedMinutes
            const netWpmCalc = Math.round(((totalKeystrokes / 5) - currentErrors) / elapsedMinutes);
            setNetWpm(Math.max(0, netWpmCalc));
        }

        // Check if finished entire manifesto (rare for 60s, but possible)
        if (val === currentPrompt) {
            endGame();
        }
    };

    const downloadCertificate = async () => {
        if (!certRef.current) return;
        try {
            const canvas = await html2canvas(certRef.current, { backgroundColor: '#090909', scale: 2 });
            const link = document.createElement('a');
            link.download = `RE-RENDER-TypeRacer.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error(err);
        }
    };

    const shareWordle = () => {
        const greens = Math.floor(accuracy / 10) || 1;
        const reds = 10 - greens;
        const boxes = '🟩'.repeat(greens) + '🟥'.repeat(reds);

        const nameDisplay = playerName.trim().toUpperCase() || 'ANONYMOUS RACER';
        const shareText = `RE-RENDER Type Racer\n🏆 Typist: ${nameDisplay}\n🔥 NET WPM: ${netWpm} (RAW: ${rawWpm})\n🎯 Accuracy: ${accuracy}%\n⚡ Max Combo: ${maxCombo}\n${boxes}\n\nhttps://re-render.com/arcade/type-racer`;
        navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Component unmount
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const renderPrompt = () => {
        const target = MANIFESTO;

        // Window sliding logic: show ~20 chars before cursor, and ~60 after
        const windowStart = Math.max(0, input.length - 20);
        const windowEnd = Math.min(target.length, input.length + 80);

        const displaySlice = target.substring(windowStart, windowEnd);
        const offset = windowStart;

        return (
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '1.5rem', lineHeight: 1.6,
                padding: '2rem', backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)', position: 'relative',
                whiteSpace: 'pre-wrap', minHeight: '220px',
                overflow: 'hidden', display: 'flex', alignItems: 'center'
            }}>
                <div style={{ position: 'absolute', top: '-12px', left: '1rem', backgroundColor: RED, color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                    CONTINUOUS MANIFESTO
                </div>
                <div style={{ width: '100%' }}>
                    {windowStart > 0 && <span style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }}>... </span>}
                    {displaySlice.split('').map((char, localIndex) => {
                        const globalIndex = offset + localIndex;
                        let color = 'var(--color-text-secondary)';
                        let bg = 'transparent';

                        if (globalIndex < input.length) {
                            if (input[globalIndex] === char) {
                                color = 'var(--color-text)'; // Correct
                            } else {
                                color = '#fff';
                                bg = RED; // Wrong
                            }
                        } else if (globalIndex === input.length) {
                            color = RED; // Next char cursor
                            bg = 'rgba(232, 17, 26, 0.1)';
                        }

                        return (
                            <span key={globalIndex} style={{
                                color,
                                backgroundColor: bg,
                                textDecorationLine: globalIndex === input.length ? 'underline' : 'none',
                                textDecorationColor: RED,
                                textDecorationThickness: '3px'
                            }}>
                                {char}
                            </span>
                        );
                    })}
                    {windowEnd < target.length && <span style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }}> ...</span>}
                </div>
            </div>
        );
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
                            ARCADE // 02
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.9, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--color-text)'
                        }}>
                            TYPE<br />RACER
                        </h1>
                    </div>

                    {gameState === 'playing' && (
                        <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.15em' }}>TIME</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: timeLeft <= 10 ? RED : 'var(--color-text)', lineHeight: 1 }}>{timeLeft}s</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.15em' }}>NET WPM</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: 'var(--color-text)', lineHeight: 1 }}>{netWpm}</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', letterSpacing: '0.15em' }}>COMBO</div>
                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: currentCombo > 20 ? '#34A853' : (currentCombo > 50 ? '#FFD700' : 'var(--color-text)'), lineHeight: 1 }}>{currentCombo}</div>
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
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⌨️</div>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2rem', margin: '0 0 1rem', color: 'var(--color-text)' }}>
                                YOUR KEYBOARD IS THE WEAPON
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                You have 60 seconds to clear as many levels as possible. Clearing a level adds +15s. Type the manifests and code exactly. Speed earns glory.
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
                            {renderPrompt()}
                            {/* Visible input field so they know exactly where to type */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder={hasStartedTyping ? "KEEP TYPING..." : "TYPE FIRST WORD TO START TIMER..."}
                                autoFocus
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    padding: '1.5rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '1.25rem',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-text)',
                                    border: `2px solid ${RED}`,
                                    outline: 'none',
                                    letterSpacing: '0.05em'
                                }}
                            />

                            <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', letterSpacing: '0.1em' }}>
                                TYPE THE TEXT ABOVE EXACTLY (MATCH CASE AND PUNCTUATION)
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'name_input' && (
                        <motion.div key="name_input" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '3rem', margin: '0 0 1rem', color: 'var(--color-text)', textTransform: 'uppercase' }}>
                                ENTER YOUR NAME
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                                For your official typist certificate.
                            </p>
                            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="YOUR NAME"
                                    required
                                    autoFocus
                                    maxLength={25}
                                    style={{
                                        width: '100%', maxWidth: '400px', padding: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.2rem',
                                        backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: `2px solid ${RED}`, outline: 'none',
                                        textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em'
                                    }}
                                />
                                <button type="submit" style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em',
                                    padding: '1.25rem 3rem', backgroundColor: RED, color: '#fff', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', width: '100%', maxWidth: '400px', transition: 'transform 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    GENERATE CERTIFICATE →
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {gameState === 'gameover' && (
                        <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

                            <div ref={certRef} style={{ border: `2px solid ${RED}`, padding: '4rem 3rem', textAlign: 'center', backgroundColor: '#F8F6F1', position: 'relative', overflow: 'hidden', marginBottom: '3rem', color: '#080808' }}>
                                {/* Background texture/pattern */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(#080808 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: RED }} />

                                <div style={{ marginBottom: '3rem' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.4em', color: RED, marginBottom: '0.5rem', fontWeight: 700 }}>
                                        CERTIFICATE OF PROFICIENCY
                                    </div>
                                    <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: '2.5rem', margin: '0', color: '#080808' }}>
                                        Typing Master
                                    </h2>
                                </div>

                                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.9rem', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    THIS CERTIFIES THAT
                                </div>
                                <div style={{
                                    fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '3rem', margin: '0 0 2rem',
                                    color: '#080808', textTransform: 'uppercase', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', display: 'inline-block', minWidth: '300px'
                                }}>
                                    {playerName.trim() || 'ANONYMOUS'}
                                </div>

                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#333', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                                    has successfully completed the RE-RENDER Type Racer simulation, demonstrating exceptional keyboard dexterity and accuracy under pressure.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                                    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#666', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>NET WPM</div>
                                        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#080808', lineHeight: 1 }}>{netWpm}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#888', marginTop: '0.5rem' }}>RAW WPM: {rawWpm}</div>
                                    </div>

                                    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#666', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>ACCURACY</div>
                                        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#080808', lineHeight: 1 }}>{accuracy}%</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: RED, marginTop: '0.5rem' }}>ERRORS: {errors}</div>
                                    </div>

                                    <div style={{ border: '1px solid #ccc', padding: '1rem', backgroundColor: '#080808', color: '#fff' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#999', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>MAX COMBO</div>
                                        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>{maxCombo}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#999', marginTop: '0.5rem' }}>BACKSPACES: {backspaceCount}</div>
                                    </div>
                                </div>

                                {/* Signatures Area */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', padding: '0 2rem' }}>
                                    {/* Date */}
                                    <div style={{ textAlign: 'left', width: '200px' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#080808', borderBottom: '1px solid #ccc', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                                            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#666', letterSpacing: '0.15em' }}>DATE OF ISSUE</div>
                                    </div>

                                    {/* Digital Seal */}
                                    <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src="/Purple Neon Green  Modern Shape Logo.png" alt="RE-RENDER Seal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>

                                    {/* Signature */}
                                    <div style={{ textAlign: 'right', width: '200px' }}>
                                        <div style={{
                                            fontFamily: '"Brush Script MT", "Loved by the King", cursive, serif',
                                            fontSize: '2.5rem', color: '#080808', lineHeight: 0.8, borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.25rem'
                                        }}>
                                            Ifham Ishaq
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#666', letterSpacing: '0.15em' }}>AUTHORIZED SIGNATURE</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={startGame} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                    padding: '1rem 3rem', backgroundColor: 'transparent', color: RED, border: `1px solid ${RED}`, cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.15s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = RED; }}>
                                    PLAY AGAIN ↺
                                </button>

                                <button onClick={downloadCertificate} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                    padding: '1rem 2rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: `1px solid var(--color-border)`, cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.15s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-bg)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface)'; }}>
                                    SAVE CERTIFICATE ⬇
                                </button>

                                <button onClick={shareWordle} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
                                    padding: '1rem 2rem', backgroundColor: isCopied ? '#34A853' : RED, color: '#fff', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.15s'
                                }}>
                                    {isCopied ? 'COPIED TO CLIPBOARD' : 'SHARE RESULTS 🟩'}
                                </button>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default TypeRacer;
