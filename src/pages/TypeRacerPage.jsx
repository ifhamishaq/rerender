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
        const shareText = `RE-RENDER Type Racer\n🏆 Typist: ${nameDisplay}\n🔥 NET WPM: ${netWpm} (RAW: ${rawWpm})\n🎯 Accuracy: ${accuracy}%\n⚡ Max Combo: ${maxCombo}\n${boxes}\n\nhttps://re-render.com/tools/type-racer`;
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
        <main style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', minHeight: '100vh', backgroundColor: '#F8F6F1', color: '#000' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
                <Link to="/tools" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                    letterSpacing: '0.1em', color: '#000', textDecoration: 'none',
                    textTransform: 'uppercase', marginBottom: '3rem', opacity: 0.5
                }}>
                    ← RETURN_TO_ARCHIVE
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', marginBottom: '4rem', alignItems: 'end' }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.25em',
                            color: RED, textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 900
                        }}>
                            ISSUE_03 // KINETIC_LITERACY
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 900,
                            fontSize: 'clamp(4rem, 10vw, 7rem)', lineHeight: 0.8, margin: 0,
                            letterSpacing: '-0.06em', color: '#000'
                        }}>
                            TYPE<br />
                            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>RACER.</span>
                        </h1>
                    </div>

                    {gameState === 'playing' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '4px solid #000', backgroundColor: '#fff' }}>
                            <div style={{ padding: '1.5rem', borderRight: '2px solid #000' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#666', fontWeight: 900 }}>TIME</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: timeLeft <= 10 ? RED : '#000', lineHeight: 1 }}>{timeLeft}</div>
                            </div>
                            <div style={{ padding: '1.5rem', borderRight: '2px solid #000' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#666', fontWeight: 900 }}>NET_WPM</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: '#000', lineHeight: 1 }}>{netWpm}</div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#666', fontWeight: 900 }}>COMBO</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: currentCombo > 20 ? '#34A853' : '#000', lineHeight: 1 }}>{currentCombo}</div>
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
                            <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.3, fontWeight: 900 }}>060_SECONDS_LIMIT</div>
                            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '3rem', margin: '0 0 2rem', color: '#000', lineHeight: 1 }}>
                                YOUR KEYBOARD<br />AS A PRECISION INSTRUMENT.
                            </h2>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: '#333', maxWidth: '600px', margin: '0 0 4rem', lineHeight: 1.6, fontWeight: 500 }}>
                                Speed is a deliverable. You have sixty seconds to transcribe the manifesto with absolute fidelity. Accuracy earns the certificate; speed earns the legacy.
                            </p>
                            <button onClick={startGame} style={{
                                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                padding: '1.5rem 4rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                                textTransform: 'uppercase', transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000'; }}>
                                INITIATE_TRIAL →
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'playing' && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderPrompt()}
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder={hasStartedTyping ? "CONTINUE..." : "TYPE TO COMMENCE..."}
                                autoFocus
                                style={{
                                    width: '100%',
                                    marginTop: '2rem',
                                    padding: '2rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '1.5rem',
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    border: `8px solid #000`,
                                    outline: 'none',
                                    fontWeight: 900
                                }}
                            />
                        </motion.div>
                    )}

                    {gameState === 'name_input' && (
                        <motion.div key="name_input" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', backgroundColor: '#fff', border: '8px solid #000', padding: '5rem' }}>
                            <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '3.5rem', margin: '0 0 1rem', color: '#000' }}>
                                ARCHIVE YOUR SCORE.
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#666', marginBottom: '3rem', fontWeight: 900 }}>
                                IDENTIFICATION REQUIRED FOR LOGGING.
                            </p>
                            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="DESIGNER_NAME"
                                    required
                                    autoFocus
                                    maxLength={25}
                                    style={{
                                        width: '100%', maxWidth: '500px', padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '1.5rem',
                                        backgroundColor: '#fff', color: '#000', border: `4px solid #000`, outline: 'none',
                                        textAlign: 'center', textTransform: 'uppercase', fontWeight: 900
                                    }}
                                />
                                <button type="submit" style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 4rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', width: '100%', maxWidth: '500px', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000'; }}>
                                    ISSUE_CERTIFICATE →
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {gameState === 'gameover' && (
                        <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

                            <div ref={certRef} style={{ border: `8px solid #000`, padding: '5rem 4rem', textAlign: 'center', backgroundColor: '#F8F6F1', position: 'relative', overflow: 'hidden', marginBottom: '4rem', color: '#000' }}>
                                {/* Background texture/pattern */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }} />

                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12px', backgroundColor: '#000' }} />

                                <div style={{ marginBottom: '4rem' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.5em', color: RED, marginBottom: '1rem', fontWeight: 900 }}>
                                        EDITORIAL_CERTIFICATION
                                    </div>
                                    <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '3.5rem', margin: '0', color: '#000', textTransform: 'uppercase', letterSpacing: '-0.04em' }}>
                                        Master of Type
                                    </h2>
                                </div>

                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#666', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 900 }}>
                                    THIS_CERTIFIES_THAT
                                </div>
                                <div style={{
                                    fontFamily: 'Playfair Display', fontWeight: 900, fontSize: '4.5rem', margin: '0 0 3rem',
                                    color: '#000', textTransform: 'uppercase', borderBottom: '6px solid #000', paddingBottom: '0.5rem', display: 'inline-block', minWidth: '400px', letterSpacing: '-0.06em'
                                }}>
                                    {playerName.trim() || 'ANONYMOUS'}
                                </div>

                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: '#333', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem', lineHeight: 1.6, fontWeight: 500 }}>
                                    has successfully completed the RE-RENDER kinetic literacy simulation, demonstrating extraordinary cognitive-manual synchronization.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '5rem' }}>
                                    <div style={{ border: '4px solid #000', padding: '2rem', backgroundColor: '#fff' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#666', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>NET_WPM</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3.5rem', color: '#000', lineHeight: 1 }}>{netWpm}</div>
                                    </div>

                                    <div style={{ border: '4px solid #000', padding: '2rem', backgroundColor: '#fff' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#666', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>ACCURACY</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3.5rem', color: '#000', lineHeight: 1 }}>{accuracy}%</div>
                                    </div>

                                    <div style={{ border: '4px solid #000', padding: '2rem', backgroundColor: '#000', color: '#fff' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#999', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>EFFICIENCY</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3.5rem', color: '#fff', lineHeight: 1 }}>{maxCombo}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', padding: '0 2rem' }}>
                                    <div style={{ textAlign: 'left', width: '250px' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#000', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontWeight: 900 }}>
                                            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#999', letterSpacing: '0.2em', fontWeight: 900 }}>ISSUE_DATE_STAMP</div>
                                    </div>

                                    <div style={{ textAlign: 'right', width: '250px' }}>
                                        <div style={{
                                            fontFamily: 'Playfair Display',
                                            fontStyle: 'italic',
                                            fontSize: '2.5rem', color: '#000', lineHeight: 0.8, borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '0.5rem'
                                        }}>
                                            Ifham Ishaq
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#999', letterSpacing: '0.2em', fontWeight: 900 }}>EDITORIAL_DIRECTOR</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button onClick={startGame} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 4rem', backgroundColor: 'transparent', color: '#000', border: `4px solid #000`, cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000'; }}>
                                    RETRY_TRIAL ↺
                                </button>

                                <button onClick={downloadCertificate} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 3rem', backgroundColor: '#fff', color: '#000', border: `4px solid #000`, cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; }}>
                                    SAVE_DOCUMENT ⬇
                                </button>

                                <button onClick={shareWordle} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.1em',
                                    padding: '1.5rem 3rem', backgroundColor: isCopied ? '#34A853' : RED, color: '#fff', border: 'none', cursor: 'pointer',
                                    textTransform: 'uppercase', transition: 'all 0.2s'
                                }}>
                                    {isCopied ? 'STAMPED_&_COPIED' : 'SHARE_RESULTS 🟩'}
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
