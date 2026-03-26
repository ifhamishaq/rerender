import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Zap, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

const ProjectEstimator = () => {
    // Top Level Categories
    const [category, setCategory] = useState('video'); // video, 3d, web, graphics
    
    // Sub-Categories / Options
    const [subType, setSubType] = useState(''); // short-form, long-form, map, ads, env, basic, etc.
    const [style, setStyle] = useState('simple'); // simple, documentary, custom, 3d-thumb
    const [duration, setDuration] = useState(1); // minutes for long form
    const [quantity, setQuantity] = useState(1); // count for short-form, posters, thumbs
    const [motionGraphics, setMotionGraphics] = useState(false);
    
    const [estimate, setEstimate] = useState({ min: 0, max: 0 });

    const handleCategoryChange = (c) => {
        setCategory(c);
        const defaults = {
            video: 'short-form',
            '3d': 'map',
            web: 'basic',
            graphics: 'poster'
        };
        setSubType(defaults[c]);
    };

    useEffect(() => {
        let min = 0;
        let max = 0;

        if (category === 'video') {
            if (subType === 'short-form') {
                const base = style === 'simple' ? 30 : 100;
                min = base * quantity;
                max = (base + 50) * quantity;
            } else { // long-form
                const rate = style === 'simple' ? 20 : 40;
                min = rate * duration;
                max = (rate + 10) * duration;
            }
            if (motionGraphics) { min += 150; max += 300; }
        } else if (category === '3d') {
            const prices = { map: [150, 400], ads: [500, 1200], env: [800, 2500] };
            [min, max] = prices[subType] || [0, 0];
        } else if (category === 'web') {
            const prices = { basic: [500, 1000], standard: [1500, 3000], advanced: [3500, 7000] };
            [min, max] = prices[subType] || [0, 0];
        } else if (category === 'graphics') {
            if (subType === 'poster') {
                min = 5 * quantity;
                max = 10 * quantity;
            } else { // thumbnails
                const base = style === 'simple' ? 20 : 50;
                min = base * quantity;
                max = (base + 15) * quantity;
            }
        }

        setEstimate({ min, max });
    }, [category, subType, style, duration, quantity, motionGraphics]);

    return (
        <section style={{
            padding: '6rem 2rem',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            borderTop: '1px solid var(--color-border)'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div className="section-label">PROJECT ESTIMATOR // v2.0</div>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>
                        TAILORED <span style={{ color: 'var(--color-accent)' }}>QUOTES.</span>
                    </h2>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: window.innerWidth > 900 ? '1.2fr 0.8fr' : '1fr', 
                    gap: '2rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '2rem',
                }}>
                    {/* Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* 01: Main Category */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                                [ 01 ] SERVICE_CATEGORY
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
                                {['video', '3d', 'web', 'graphics'].map(c => (
                                    <button 
                                        key={c} onClick={() => handleCategoryChange(c)}
                                        style={{
                                            padding: '0.75rem 0.25rem',
                                            backgroundColor: category === c ? 'var(--color-accent)' : 'transparent',
                                            color: category === c ? '#000' : 'var(--color-text)',
                                            border: '1px solid var(--color-border)',
                                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase'
                                        }}
                                    >
                                        {c === 'graphics' ? 'DESIGN' : c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 02: Sub-Type Options (Contextual) */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                                [ 02 ] SELECTION_DETAILS
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {category === 'video' && (
                                    <>
                                        {['short-form', 'long-form'].map(t => (
                                            <button key={t} onClick={() => setSubType(t)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', background: subType === t ? 'var(--color-text)' : 'none', color: subType === t ? 'var(--color-bg)' : 'var(--color-text)', fontFamily: 'var(--font-mono', fontSize: '0.7rem' }}>{t.toUpperCase()}</button>
                                        ))}
                                    </>
                                )}
                                {category === '3d' && (
                                    <>
                                        {['map', 'ads', 'env'].map(t => (
                                            <button key={t} onClick={() => setSubType(t)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', background: subType === t ? 'var(--color-text)' : 'none', color: subType === t ? 'var(--color-bg)' : 'var(--color-text)', fontFamily: 'var(--font-mono', fontSize: '0.7rem' }}>{t === 'env' ? 'ENVIRONMENTS' : t.toUpperCase()}</button>
                                        ))}
                                    </>
                                )}
                                {category === 'web' && (
                                    <>
                                        {['basic', 'standard', 'advanced'].map(t => (
                                            <button key={t} onClick={() => setSubType(t)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', background: subType === t ? 'var(--color-text)' : 'none', color: subType === t ? 'var(--color-bg)' : 'var(--color-text)', fontFamily: 'var(--font-mono', fontSize: '0.7rem' }}>{t.toUpperCase()}</button>
                                        ))}
                                    </>
                                )}
                                {category === 'graphics' && (
                                    <>
                                        {['poster', 'thumbnail'].map(t => (
                                            <button key={t} onClick={() => setSubType(t)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--color-border)', background: subType === t ? 'var(--color-text)' : 'none', color: subType === t ? 'var(--color-bg)' : 'var(--color-text)', fontFamily: 'var(--font-mono', fontSize: '0.7rem' }}>{t.toUpperCase()}</button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 03: Style & Add-ons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                                    [ 03 ] STYLE_PREFERENCE
                                </label>
                                <select 
                                    value={style} onChange={(e) => setStyle(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
                                >
                                    <option value="simple">SIMPLE / CLEAN</option>
                                    <option value="pro">PROFESSIONAL</option>
                                    <option value="documentary">DOCUMENTARY / HIGH-END</option>
                                    <option value="luxury">LUXURY / CINEMATIC</option>
                                </select>
                            </div>
                            {(category === 'video') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                                        [ 04 ] MOTION_GRAPHICS
                                    </label>
                                    <button 
                                        onClick={() => setMotionGraphics(!motionGraphics)}
                                        style={{ width: '100%', padding: '0.75rem', backgroundColor: motionGraphics ? 'var(--color-accent)' : 'transparent', color: motionGraphics ? '#000' : 'var(--color-text)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900 }}
                                    >
                                        {motionGraphics ? 'ENABLED (+FIXED FEE)' : 'DISABLED'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 04: Quantity / Duration Slider */}
                        <div>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                                <span>[ 05 ] {category === 'video' && subType === 'long-form' ? 'DURATION (MINUTES)' : 'QUANTITY (UNITS)'}</span>
                                <span style={{ color: 'var(--color-accent)' }}>{category === 'video' && subType === 'long-form' ? duration : quantity}</span>
                            </label>
                            <input 
                                type="range" 
                                min="1" max={category === 'graphics' ? 20 : 10} 
                                value={category === 'video' && subType === 'long-form' ? duration : quantity} 
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (category === 'video' && subType === 'long-form') setDuration(val);
                                    else setQuantity(val);
                                }}
                                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                            />
                        </div>
                    </div>

                    {/* Result Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', borderLeft: window.innerWidth > 900 ? '1px solid var(--color-border)' : 'none', paddingLeft: window.innerWidth > 900 ? '2rem' : 0 }}>
                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '0.5rem', letterSpacing: '0.2em' }}>PROJECTED_INVESTMENT</div>
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={`${estimate.min}-${estimate.max}`}
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}
                                >
                                    ${estimate.min}—${estimate.max}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <form name="project-estimator-v2" method="POST" data-netlify="true" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input type="hidden" name="form-name" value="project-estimator-v2" />
                            <input type="hidden" name="category" value={category} />
                            <input type="hidden" name="sub_type" value={subType} />
                            <input type="hidden" name="style" value={style} />
                            <input type="hidden" name="quantity_duration" value={category === 'video' && subType === 'long-form' ? `${duration} min` : `${quantity} units`} />
                            <input type="hidden" name="estimate" value={`$${estimate.min}-$${estimate.max}`} />
                            
                            <input type="text" name="name" placeholder="YOUR NAME" required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }} />
                            <input type="email" name="email" placeholder="EMAIL ADDRESS" required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }} />
                            
                            <button type="submit" style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--color-accent)', color: '#000', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '4px 4px 0px #000' }}>
                                LOCK IN ESTIMATE →
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectEstimator;
