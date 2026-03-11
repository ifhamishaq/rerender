import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ACCENT = 'var(--color-accent)';

// Values to display on the reels
const REEL_VALUES = [10, 20, 30, 40, 50, 60, 70, 80, 90];

// Rigged probability logic
const getRiggedPrize = () => {
    const r = Math.random();
    if (r < 0.35) return 10;     // 35% chance of 10%
    if (r < 0.60) return 20;     // 25% chance of 20%
    if (r < 0.80) return 30;     // 20% chance of 30%
    if (r < 0.90) return 40;     // 10% chance of 40%
    if (r < 0.95) return 50;     // 5% chance of 50%
    if (r < 0.97) return 60;     // 2% chance of 60%
    if (r < 0.985) return 70;    // 1.5% chance of 70%
    if (r < 0.995) return 80;    // 1% chance of 80%
    return 90;                   // 0.5% chance of 90%
};

const SlotMachineWidget = () => {
    const [gameState, setGameState] = useState('idle'); // idle, spinning, finished
    const [prize, setPrize] = useState(null);
    const [currentDisplay, setCurrentDisplay] = useState(0);
    const spinIntervalRef = useRef(null);
    const navigate = useNavigate();

    const startSpin = () => {
        setGameState('spinning');
        const finalPrize = getRiggedPrize();
        setPrize(finalPrize);

        // Visual spinning effect
        let ticks = 0;
        const totalTicks = 35;
        spinIntervalRef.current = setInterval(() => {
            ticks++;
            setCurrentDisplay(REEL_VALUES[Math.floor(Math.random() * REEL_VALUES.length)]);

            if (ticks >= totalTicks) {
                clearInterval(spinIntervalRef.current);
                setCurrentDisplay(finalPrize);
                localStorage.setItem('re_render_discount', finalPrize);
                setTimeout(() => setGameState('finished'), 600);
            }
        }, 50); // Faster tick rate for smoother roll
    };

    useEffect(() => {
        return () => {
            if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        };
    }, []);

    const handleClaim = () => {
        navigate('/services#inquiry');
    };

    return (
        <div style={{
            width: '100%',
            border: `1px solid var(--color-border)`,
            backgroundColor: 'var(--color-bg)',
            padding: '2.5rem',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', backgroundColor: ACCENT }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '2rem', textAlign: 'center' }}>
                <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.25rem', color: ACCENT }}>⚡</span>
                        <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: 'var(--color-text)' }}>
                            UNLOCK A PROJECT DISCOUNT
                        </h3>
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Get up to 90% off on your first project. Generate a randomized discount and apply it instantly to your project inquiry.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                    <div style={{
                        width: '100px', height: '120px', backgroundColor: 'var(--color-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid var(--color-border)`, overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Overlay gradient for depth */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30px', background: 'linear-gradient(to bottom, var(--color-bg) 0%, transparent 100%)', zIndex: 5 }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)', zIndex: 5 }} />

                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={`${currentDisplay}-${gameState === 'spinning' ? Date.now() : 'static'}`}
                                initial={{ y: gameState === 'spinning' ? 60 : 0, opacity: gameState === 'spinning' ? 0 : 1 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: gameState === 'spinning' ? -60 : 0, opacity: gameState === 'spinning' ? 0 : 1 }}
                                transition={{ duration: gameState === 'spinning' ? 0.05 : 0.4, ease: "linear" }}
                                style={{
                                    fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '3.5rem', color: 'var(--color-text)', zIndex: 1, position: 'absolute',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'
                                }}
                            >
                                {currentDisplay}%
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem', marginTop: '2rem' }}>
                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.button key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={startSpin} style={{
                            width: '100%', padding: '1rem', backgroundColor: ACCENT, color: '#000',
                            fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.1em',
                            border: '1px solid #000', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = '#000';
                                e.currentTarget.style.color = ACCENT;
                                e.currentTarget.style.borderColor = ACCENT;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = ACCENT;
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.borderColor = '#000';
                            }}>
                            GENERATE DISCOUNT
                        </motion.button>
                    )}

                    {gameState === 'spinning' && (
                        <motion.div key="spinning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{
                            width: '100%', textAlign: 'center', padding: '1rem', fontFamily: 'var(--font-mono)',
                            color: ACCENT, letterSpacing: '0.2em', fontSize: '0.9rem', fontWeight: 700
                        }}>
                            CALCULATING...
                        </motion.div>
                    )}

                    {gameState === 'finished' && prize > 0 && (
                        <motion.div key="win" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: ACCENT, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                YOU WON {prize}% OFF
                            </div>

                            <button onClick={handleClaim} style={{
                                flexGrow: 1, padding: '1rem 2rem', backgroundColor: ACCENT, color: '#000', border: '1px solid #000',
                                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                                textTransform: 'uppercase'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#000';
                                    e.currentTarget.style.color = ACCENT;
                                    e.currentTarget.style.borderColor = ACCENT;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = ACCENT;
                                    e.currentTarget.style.color = '#000';
                                    e.currentTarget.style.borderColor = '#000';
                                }}>
                                APPLY DISCOUNT TO PROJECT INQUIRY →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SlotMachineWidget;
