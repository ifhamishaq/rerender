import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Share2, RefreshCw, Layers, Layout, Terminal as TerminalIcon, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const COLORS = {
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)',
    accent: 'var(--color-accent)', 
    success: '#39FF14', // Core Accent Green
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)'
};

import { GENRES, STYLES, COLOR_BIASES, RANDOM_MODIFIERS, PROMPT_TEMPLATES } from '../data/wallpaperConfig';

const RATIOS = [
    { id: '9:16', label: 'MOBILE (9:16)', width: 1080, height: 1920 },
    { id: '16:9', label: 'DESKTOP (16:9)', width: 1920, height: 1080 },
    { id: '21:9', label: 'ULTRAWIDE (21:9)', width: 2560, height: 1080 },
    { id: '1:1', label: 'SQUARE (1:1)', width: 1024, height: 1024 }
];

const DAILY_LIMIT = 10;
const STORAGE_KEY = '_sys_compute_quota';
const ARCHIVE_KEY = '_sys_asset_archive';

const getDeviceId = () => {
    // Basic hardware fingerprinting to deter easy bypass
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = gl?.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL) || 'generic';
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const hardwareThreads = navigator.hardwareConcurrency || 4;
    return btoa(`${renderer}-${screenRes}-${hardwareThreads}`).slice(0, 16);
};

const WallpaperLab = () => {
    const { isDarkMode } = useTheme();
    const [genre, setGenre] = useState(GENRES[0].id);
    const [style, setStyle] = useState(STYLES[0].id);
    const [colorBias, setColorBias] = useState(COLOR_BIASES[0].id);
    const [ratio, setRatio] = useState(RATIOS[1].id);
    
    // Advanced Settings
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [seed, setSeed] = useState(-1);
    const [customSupplement, setCustomSupplement] = useState('');
    
    // Rate Limiting
    const [credits, setCredits] = useState(DAILY_LIMIT);
    const [deviceId] = useState(getDeviceId());
    const [archive, setArchive] = useState([]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);

    // Initialize Quota
    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const rawData = localStorage.getItem(STORAGE_KEY);
        let quota = { date: today, count: 0 };

        if (rawData) {
            const parsed = JSON.parse(rawData);
            if (parsed.date === today) {
                quota = parsed;
            }
        }

        setCredits(DAILY_LIMIT - quota.count);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));

        // Load Archive
        const rawArchive = localStorage.getItem(ARCHIVE_KEY);
        if (rawArchive) {
            setArchive(JSON.parse(rawArchive));
        }
    }, []);

    const saveToArchive = (url, metadata) => {
        const newAsset = {
            id: Date.now(),
            url,
            date: new Date().toLocaleString(),
            ...metadata
        };
        const updatedArchive = [newAsset, ...archive].slice(0, 50); // Keep last 50
        setArchive(updatedArchive);
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchive));
    };

    const deleteFromArchive = (id) => {
        const updatedArchive = archive.filter(item => item.id !== id);
        setArchive(updatedArchive);
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchive));
    };

    const clearArchive = () => {
        if (window.confirm("CONFIRM_ACTION: CLEAR_ALL_ASSETS?")) {
            setArchive([]);
            localStorage.removeItem(ARCHIVE_KEY);
        }
    };

    const updateQuota = () => {
        const today = new Date().toISOString().split('T')[0];
        const rawData = localStorage.getItem(STORAGE_KEY);
        let quota = JSON.parse(rawData);
        
        quota.count += 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));
        setCredits(DAILY_LIMIT - quota.count);
    };

    const addLog = (message) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-5));
    };

    const handleGenerate = async () => {
        if (credits <= 0) {
            setError("DAILY_COMPUTE_QUOTA_EXHAUSTED");
            addLog("ERR: QUOTA_LIMIT_REACHED");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResultUrl(null);

        const selectedGenre = GENRES.find(g => g.id === genre);
        const selectedStyle = STYLES.find(s => s.id === style);
        const selectedColor = COLOR_BIASES.find(c => c.id === colorBias);
        const randomModifier = RANDOM_MODIFIERS[Math.floor(Math.random() * RANDOM_MODIFIERS.length)];
        const template = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];

        // Build composite prompt strictly from config + advanced supplement
        let compositePrompt = template
            .replace('{style}', selectedStyle.prompt)
            .replace('{genre}', selectedGenre.prompt)
            .replace('{color}', selectedColor ? selectedColor.name : 'natural')
            + `, ${randomModifier}`;

        if (customSupplement) {
            compositePrompt += `, ${customSupplement}`;
        }

        addLog(`INITIATING_RENDER: composite_key_detected`);
        addLog(`AESTHETIC: ${selectedStyle.name} | ${selectedGenre.name}`);

        try {
            const selectedRatio = RATIOS.find(r => r.id === ratio);
            
            const response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: compositePrompt,
                    width: selectedRatio.width,
                    height: selectedRatio.height,
                    seed: seed === -1 ? Math.floor(Math.random() * 1000000) : seed
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            // The API returns an object which should contain the image URL
            // Based on user's code, data is returned directly
            if (data.url || (data[0] && data[0].url)) {
                const finalUrl = data.url || data[0].url;
                setResultUrl(finalUrl);
                addLog('GENERATION_SUCCESS: ASSET_RENDERED');
                updateQuota();
                saveToArchive(finalUrl, {
                    genre: selectedGenre.name,
                    style: selectedStyle.name,
                    prompt: compositePrompt
                });
            } else {
                throw new Error('No image URL returned from API');
            }

        } catch (err) {
            setError(err.message);
            addLog(`ERR: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!resultUrl) return;
        try {
            const response = await fetch(resultUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `re-render-wallpaper-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    const StackedSelector = ({ genreOptions, styleOptions, currentGenre, currentStyle, onGenreChange, onStyleChange, isGenerating, onGenerate }) => {
        const [genreDir, setGenreDir] = useState(0);
        const [styleDir, setStyleDir] = useState(0);

        const genreIndex = genreOptions.findIndex(g => g.id === currentGenre);
        const styleIndex = styleOptions.findIndex(s => s.id === currentStyle);

        const handleNextGenre = () => {
            setGenreDir(1);
            onGenreChange(genreOptions[(genreIndex + 1) % genreOptions.length].id);
        };

        const handlePrevGenre = () => {
            setGenreDir(-1);
            onGenreChange(genreOptions[(genreIndex - 1 + genreOptions.length) % genreOptions.length].id);
        };

        const handleNextStyle = () => {
            setStyleDir(1);
            onStyleChange(styleOptions[(styleIndex + 1) % styleOptions.length].id);
        };

        const handlePrevStyle = () => {
            setStyleDir(-1);
            onStyleChange(styleOptions[(styleIndex - 1 + styleOptions.length) % styleOptions.length].id);
        };

        const slideVariants = {
            enter: (direction) => ({
                y: direction > 0 ? 100 : -100,
                opacity: 0,
                filter: 'blur(10px)'
            }),
            center: {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)'
            },
            exit: (direction) => ({
                y: direction < 0 ? 100 : -100,
                opacity: 0,
                filter: 'blur(10px)'
            })
        };

        return (
            <div style={{ position: 'relative', width: '100%', maxWidth: '450px', margin: '0 auto 3rem' }}>
                <div style={{
                    backgroundColor: '#000',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    aspectRatio: '0.8/1',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                    border: `1px solid ${COLORS.border}`
                }}>
                    {/* Top: Genre */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
                        <AnimatePresence initial={false} custom={genreDir}>
                            <motion.div
                                key={currentGenre}
                                custom={genreDir}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                style={{ width: '100%', height: '100%', position: 'absolute' }}
                            >
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <img 
                                        src={genreOptions[genreIndex].image} 
                                        alt="" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                            {genreOptions[genreIndex].name}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Genre Nav */}
                        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 5 }}>
                            <button onClick={handlePrevGenre} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronUp size={16} /></button>
                            <button onClick={handleNextGenre} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronDown size={16} /></button>
                        </div>
                    </div>

                    {/* Bottom: Style */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <AnimatePresence initial={false} custom={styleDir}>
                            <motion.div
                                key={currentStyle}
                                custom={styleDir}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                style={{ width: '100%', height: '100%', position: 'absolute' }}
                            >
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <img 
                                        src={styleOptions[styleIndex].image} 
                                        alt="" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                            {styleOptions[styleIndex].name}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Style Nav */}
                        <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 5 }}>
                            <button onClick={handlePrevStyle} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronUp size={16} /></button>
                            <button onClick={handleNextStyle} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronDown size={16} /></button>
                        </div>
                    </div>

                    {/* Central Plus Button (Decorative) */}
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            color: '#000',
                            opacity: 0.8
                        }}
                    >
                        <Plus size={40} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: COLORS.bg,
            color: COLORS.text,
            padding: '100px 2rem 4rem',
            fontFamily: 'var(--font-mono)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Back to Tools */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/tools" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                        letterSpacing: '0.1em', color: COLORS.accent, textDecoration: 'none',
                        textTransform: 'uppercase',
                        transition: 'opacity 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                        onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                        ← BACK_TO_TOOLS
                    </Link>
                </div>

                {/* Header */}
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                        color: COLORS.accent
                    }}>
                        <Layers size={20} />
                        <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}>LABS // ENGINE_V1.0</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        margin: 0,
                        textTransform: 'uppercase'
                    }}>
                        WALLPAPER <span style={{ color: COLORS.accent }}>LAB</span>
                    </h1>
                    <p style={{ color: COLORS.textSecondary, marginTop: '1.5rem', maxWidth: '600px', fontSize: '0.9rem' }}>
                        Leverage our proprietary Flux-1 Schnell engine to render high-fidelity digital backdrops for the post-internet era.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2.5rem',
                    alignItems: 'start'
                }}>
                    {/* Controls Panel */}
                    <div style={{
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-1px',
                            right: '2rem',
                            padding: '0 1rem',
                            backgroundColor: credits > 0 ? COLORS.bg : 'rgba(232, 17, 26, 0.1)',
                            fontSize: '0.6rem',
                            color: credits > 0 ? COLORS.success : COLORS.accent,
                            borderLeft: `1px solid ${COLORS.border}`,
                            borderRight: `1px solid ${COLORS.border}`,
                            fontWeight: 900
                        }}>
                            {credits}/{DAILY_LIMIT} RENDERS_REMAINING
                        </div>

                        <StackedSelector 
                            genreOptions={GENRES}
                            styleOptions={STYLES}
                            currentGenre={genre}
                            currentStyle={style}
                            onGenreChange={setGenre}
                            onStyleChange={setStyle}
                            isGenerating={isGenerating}
                            onGenerate={handleGenerate}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: COLORS.textSecondary, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                                    // COLOR_BIAS
                                </label>
                                <select
                                    value={colorBias}
                                    onChange={(e) => setColorBias(e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--color-bg)',
                                        border: `1px solid ${COLORS.border}`,
                                        color: COLORS.text,
                                        padding: '0.6rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        outline: 'none',
                                        borderRadius: 0
                                    }}
                                >
                                    {COLOR_BIASES.map(c => (
                                        <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: COLORS.textSecondary, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                                    // RATIO
                                </label>
                                <select
                                    value={ratio}
                                    onChange={(e) => setRatio(e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--color-bg)',
                                        border: `1px solid ${COLORS.border}`,
                                        color: COLORS.text,
                                        padding: '0.6rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        outline: 'none',
                                        borderRadius: 0
                                    }}
                                >
                                    {RATIOS.map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div style={{ marginBottom: '2rem' }}>
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${COLORS.border}`,
                                    color: COLORS.textSecondary,
                                    padding: '0.75rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>[ {showAdvanced ? '-' : '+'} ] ADVANCED_SYSTEM_SETTINGS</span>
                                <span>{showAdvanced ? 'COLLAPSE' : 'EXPAND'}</span>
                            </button>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '1.5rem 0', borderBottom: `1px solid ${COLORS.border}` }}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.65rem', color: COLORS.textSecondary, marginBottom: '0.75rem' }}>
                                                    // RENDER_SEED (-1 = RANDOM)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={seed}
                                                    onChange={(e) => setSeed(parseInt(e.target.value))}
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: 'var(--color-bg)',
                                                        border: `1px solid ${COLORS.border}`,
                                                        color: '#fff',
                                                        padding: '0.75rem',
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.8rem',
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.65rem', color: COLORS.textSecondary, marginBottom: '0.75rem' }}>
                                                    // PROMPT_SUPPLEMENT
                                                </label>
                                                <textarea
                                                    value={customSupplement}
                                                    onChange={(e) => setCustomSupplement(e.target.value)}
                                                    placeholder="Add extra modifiers... (e.g. volumetric lighting, 8k resolution)"
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '80px',
                                                        backgroundColor: 'var(--color-bg)',
                                                        border: `1px solid ${COLORS.border}`,
                                                        color: '#fff',
                                                        padding: '0.75rem',
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.8rem',
                                                        outline: 'none',
                                                        resize: 'none'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Execute Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                backgroundColor: isGenerating ? COLORS.surface : COLORS.accent,
                                color: isGenerating ? COLORS.textSecondary : '#000',
                                border: 'none',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 900,
                                fontSize: '1rem',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                transition: 'all 0.1s ease',
                                boxShadow: isGenerating ? 'none' : `4px 4px 0px ${isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`,
                                textTransform: 'uppercase'
                            }}
                            onMouseDown={(e) => {
                                if (!isGenerating) {
                                    e.target.style.transform = 'translate(2px, 2px)';
                                    e.target.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.2)';
                                }
                            }}
                            onMouseUp={(e) => {
                                if (!isGenerating) {
                                    e.target.style.transform = 'translate(0, 0)';
                                    e.target.style.boxShadow = `4px 4px 0px ${isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`;
                                }
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={20} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                                    [ EXECUTING... ]
                                </>
                            ) : (
                                <>
                                    <TerminalIcon size={20} />
                                    [ EXECUTE_RENDER ]
                                </>
                            )}
                        </button>

                        {/* System Logs */}
                        <div style={{ marginTop: '2rem', backgroundColor: 'var(--color-bg)', padding: '1rem', border: `1px solid ${COLORS.border}` }}>
                            <div style={{ fontSize: '0.6rem', color: COLORS.textSecondary, marginBottom: '0.5rem', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between' }}>
                                <span>SYS_LOGS:</span>
                                <span>DEVICE_ID: {deviceId}</span>
                            </div>
                            {logs.length === 0 && <div style={{ fontSize: '0.7rem', color: '#333' }}>STDBY // AWAITING_COMMAND</div>}
                            {logs.map((log, i) => (
                                <div key={i} style={{ fontSize: '0.7rem', color: log.includes('ERR') ? '#E8111A' : COLORS.success, marginBottom: '0.25rem' }}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div style={{
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        padding: '2rem',
                        minHeight: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-1px',
                            right: '2rem',
                            padding: '0 1rem',
                            backgroundColor: COLORS.bg,
                            fontSize: '0.6rem',
                            color: COLORS.textSecondary,
                            borderLeft: `1px solid ${COLORS.border}`,
                            borderRight: `1px solid ${COLORS.border}`
                        }}>
                            RENDER_OUTPUT
                        </div>

                        <div style={{
                            flexGrow: 1,
                            backgroundColor: 'var(--color-bg)',
                            border: `1px solid ${COLORS.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            aspectRatio: ratio === '9:16' ? '9/16' : (ratio === '16:9' ? '16/9' : '1/1'),
                            maxHeight: '600px',
                            margin: '0 auto',
                            width: '100%'
                        }}>
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="generating"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <div style={{ fontSize: '3rem', fontWeight: 900, color: COLORS.border, marginBottom: '1rem' }}>
                                            RENDERING
                                        </div>
                                        <div style={{ width: '100px', height: '2px', backgroundColor: COLORS.accent, margin: '0 auto' }}>
                                            <motion.div
                                                animate={{ scaleX: [0, 1, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                style={{ width: '100%', height: '100%', backgroundColor: COLORS.success, originX: 0 }}
                                            />
                                        </div>
                                    </motion.div>
                                ) : resultUrl ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ width: '100%', height: '100%', position: 'relative' }}
                                    >
                                        <img
                                            src={resultUrl}
                                            alt="AI Generated Wallpaper"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                        
                                        {/* Actions Overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '1rem',
                                            right: '1rem',
                                            display: 'flex',
                                            gap: '0.5rem'
                                        }}>
                                            <button
                                                onClick={handleDownload}
                                                style={{
                                                    backgroundColor: COLORS.bg,
                                                    border: `1px solid ${COLORS.border}`,
                                                    color: COLORS.text,
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                <Download size={16} />
                                                SAVE
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div key="placeholder" style={{ textAlign: 'center', opacity: 0.2 }}>
                                        <Layout size={60} strokeWidth={1} />
                                        <div style={{ fontSize: '0.7rem', marginTop: '1rem', letterSpacing: '0.2em' }}>
                                            AWAITING_INPUT
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: 'rgba(232, 17, 26, 0.1)',
                                border: `1px solid ${COLORS.accent}`,
                                color: COLORS.accent,
                                fontSize: '0.8rem'
                            }}>
                                [!] ERROR: {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Local Archive Section */}
                {archive.length > 0 && (
                    <div style={{ marginTop: '6rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '2rem',
                            borderBottom: `2px solid ${COLORS.border}`,
                            paddingBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <RefreshCw size={20} style={{ color: COLORS.accent }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    LOCAL_ASSET_ARCHIVE
                                </h2>
                            </div>
                            <button 
                                onClick={clearArchive}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: COLORS.textSecondary,
                                    fontSize: '0.65rem',
                                    fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                                onMouseEnter={e => e.target.style.color = COLORS.accent}
                                onMouseLeave={e => e.target.style.color = COLORS.textSecondary}
                            >
                                [ CLEAR_ALL ]
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {archive.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    style={{
                                        backgroundColor: COLORS.surface,
                                        border: `1px solid ${COLORS.border}`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setResultUrl(item.url)}
                                >
                                    <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                                        <img src={item.url} alt="Archived" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '0.75rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: COLORS.accent, fontWeight: 900, marginBottom: '0.25rem' }}>
                                            {item.genre} // {item.style}
                                        </div>
                                        <div style={{ fontSize: '0.55rem', color: COLORS.textSecondary }}>
                                            {item.date}
                                        </div>
                                    </div>
                                    
                                    {/* Item Delete */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFromArchive(item.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            width: '24px',
                                            height: '24px',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            border: `1px solid ${COLORS.border}`,
                                            color: '#fff',
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 5
                                        }}
                                    >
                                        ×
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                }
            `}</style>
        </div>
    );
};

export default WallpaperLab;
