import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const Comparison = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const isDragging = useRef(false);

    const handleMouseMove = (e) => {
        if (!isDragging.current && !e.buttons) return;
        // Allow click-and-drag or just drag if buttons pressed

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <section id="compare" style={{
            padding: '6rem 2rem',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 5rem)',
                marginBottom: '4rem',
                textAlign: 'center',
                borderBottom: '2px solid var(--color-accent)',
                paddingBottom: '1rem'
            }}>
                THE TRANSFORMATION
            </h2>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1000px',
                    aspectRatio: '16/9',
                    cursor: 'col-resize',
                    border: '1px solid var(--color-text)',
                    overflow: 'hidden',
                    userSelect: 'none'
                }}
            >
                {/* AFTER Image (Background) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        zIndex: 1
                    }}>AFTER</span>
                    {/* Simulated detailed content */}
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: '20%',
                        right: '20%',
                        bottom: '20%',
                        border: '1px solid var(--color-accent)',
                        opacity: 0.5
                    }}></div>
                </div>

                {/* BEFORE Image (Foreground, clipped) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${sliderPosition}%`,
                    height: '100%',
                    backgroundColor: '#E0E0E0',
                    overflow: 'hidden',
                    borderRight: '2px solid var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                    // We don't use object-fit here because we're just simulating divs, 
                    // but for real images we would set width: 100vw (or container width) and clip it.
                    // Better approach for div simulation:
                }}>
                    <div style={{
                        width: '1000px', // Fixed width matching container max-width approx
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <span style={{
                            color: 'var(--color-text)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            zIndex: 1
                        }}>BEFORE</span>
                        {/* Lo-fi patterns */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: 'repeating-linear-gradient(45deg, #ccc 0, #ccc 1px, transparent 0, transparent 10px)'
                        }}></div>
                    </div>
                </div>

                {/* Slider Handle */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${sliderPosition}%`,
                    width: '2px',
                    backgroundColor: 'var(--color-accent)',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'var(--color-accent)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                            <polyline points="9 18 3 12 9 6"></polyline>
                            {/* Custom arrows */}
                            <path d="M16 12h-6" />
                            <path d="M20 12h-2" />
                        </svg>
                    </div>
                </div>
            </div>

            <p style={{
                marginTop: '2rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: '#666'
            }}>
                DRAG TO RE-RENDER
            </p>
        </section>
    );
};

export default Comparison;
