import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Share2, RefreshCw, Layers, Layout, Terminal as TerminalIcon, Plus, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const COLORS = {
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    border: 'var(--color-border)',
    accent: 'var(--color-accent)', 
    success: 'var(--color-accent)', 
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    display: 'var(--font-display)',
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)'
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
    const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, grainy, text, watermark');
    const [isHighQuality, setIsHighQuality] = useState(false);
    const [customSupplement, setCustomSupplement] = useState('');
    
    // Rate Limiting
    const [credits, setCredits] = useState(DAILY_LIMIT);
    const [deviceId] = useState(getDeviceId());
    const [archive, setArchive] = useState([]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

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
            seed: metadata.seed || 'auto',
            isMasterpiece: metadata.isMasterpiece || false,
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

    const handleSurpriseMe = () => {
        const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)].id;
        const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)].id;
        setGenre(randomGenre);
        setStyle(randomStyle);
        addLog(`SURPRISE_ME: Randomized Aesthetic`);
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

        // Apply Negative Prompt if relevant
        if (negativePrompt) {
            // Some Flux variants use [brackets] for negatives if not natively supported, 
            // but we'll prepend/append clearly.
            compositePrompt += ` --no ${negativePrompt}`;
        }

        // Apply Quality Boosts
        if (isHighQuality) {
            compositePrompt += `, hyper-realistic, 8k resolution, cinematic lighting, masterpiece quality, highly detailed`;
        }

        addLog(`INITIATING_RENDER: composite_key_detected`);
        addLog(`AESTHETIC: ${selectedStyle.name} | ${selectedGenre.name}`);

        try {
            const selectedRatio = RATIOS.find(r => r.id === ratio);
            const isLocal = window.location.hostname === 'localhost';
            
            let response;
            if (isLocal) {
                // To test locally without Netlify CLI, you can temporarily put a key here, 
                // but for security, it is best to use Netlify Dev or Environment Variables.
                addLog('INFO: Running in LOCAL_MODE');
            }

            response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: compositePrompt,
                    width: selectedRatio.width,
                    height: selectedRatio.height,
                    seed: seed === -1 ? Math.floor(Math.random() * 1000000) : seed
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.error || errorData.details || 'SERVER_ERROR';
                addLog(`ERR_SVR: ${msg.slice(0, 50)}`);
                throw new Error(msg);
            }

            const data = await response.json();

            // Comprehensive URL extraction from various API response structures
            let extracted = 
                data.url || 
                (typeof data.output === 'string' ? data.output : null) ||
                (data.images && data.images[0]?.url) || 
                (data.data && data.data[0]?.url) || 
                (data.output && (typeof data.output[0] === 'string' ? data.output[0] : data.output[0]?.url)) ||
                (data[0]?.url) ||
                (typeof data[0] === 'string' ? data[0] : null);

            // Sanitize: If it's a raw base64 string, add the data URI prefix
            let finalUrl = extracted;
            if (extracted && typeof extracted === 'string' && !extracted.startsWith('http') && !extracted.startsWith('data:')) {
                // Heuristic: if it's long and has no spaces, assume base64
                if (extracted.length > 100 && !extracted.includes(' ')) {
                    finalUrl = `data:image/png;base64,${extracted}`;
                    addLog('INFO: Detected raw base64 payload');
                }
            }

            if (finalUrl) {
                setResultUrl(finalUrl);
                addLog('GENERATION_SUCCESS: ASSET_RENDERED');
                addLog(`URL_PRV: ${finalUrl.toString().slice(0, 40)}...`);
                updateQuota();
                saveToArchive(finalUrl, {
                    genre: selectedGenre.name,
                    style: selectedStyle.name,
                    prompt: compositePrompt,
                    seed: seed === -1 ? 'auto' : seed,
                    isMasterpiece: isHighQuality
                });
            } else {
                const keys = Object.keys(data).join(', ');
                addLog(`ERR_STRUCTURE: detected_keys [${keys}]`);
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

    // --- UI SUB-COMPONENTS ---

    const Lightbox = ({ asset, onClose }) => {
        if (!asset) return null;
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.92)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backdropFilter: 'blur(20px)'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ position: 'relative', maxWidth: '1200px', width: '100%', maxHeight: '90vh', display: 'flex', gap: '0', background: '#000', border: `1px solid rgba(255,255,255,0.1)`, overflow: 'hidden' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Main Image */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#050505' }}>
                        <img src={asset.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Asset" />
                    </div>

                    {/* Metadata Overlay - Fashion Spec Style */}
                    <div style={{ width: '360px', padding: '2.5rem', fontFamily: COLORS.sans, display: 'flex', flexDirection: 'column', color: '#fff' }}>
                        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <div style={{ fontFamily: COLORS.mono, fontSize: '0.6rem', color: COLORS.accent, fontWeight: 700, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                                ARCHIVE_SPEC_001
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: COLORS.display, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                {asset.genre} // {asset.style}
                            </h3>
                        </div>
                        
                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>PROMPT_MANIFEST</div>
                                <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>"{asset.prompt}"</div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>DATE_CREATED</div>
                                    <div style={{ fontSize: '0.75rem', fontFamily: COLORS.mono }}>{asset.date}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>ENGINE_SEED</div>
                                    <div style={{ fontSize: '0.75rem', fontFamily: COLORS.mono }}>{asset.seed || 'RANDOM'}</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>OUTPUT_ENGINE</div>
                                <div style={{ fontSize: '0.75rem', fontFamily: COLORS.mono }}>FLUX.1_SCHNELL // ULTRA_HD</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = asset.url;
                                    link.download = `render-${asset.id}.png`;
                                    link.click();
                                }}
                                style={{ flex: 1, padding: '1rem', backgroundColor: COLORS.accent, color: '#000', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem', fontFamily: COLORS.display }}
                            > DOWNLOAD_ASSET </button>
                            <button 
                                onClick={onClose}
                                style={{ padding: '1rem', backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: COLORS.display }}
                            > CLOSE </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    const ScanningLoader = () => (
        <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: COLORS.accent, opacity: 0.6, letterSpacing: '0.1em' }}>
                SCANNING PRODUCTION LINE
            </div>
            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: COLORS.accent, opacity: 0.6, letterSpacing: '0.1em' }}>
                INFERENCE ACTIVE // HIGH_FIDELITY
            </div>

            <motion.div 
                animate={{ 
                    top: ['0%', '100%', '0%'],
                }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                    boxShadow: `0 0 20px ${COLORS.accent}`,
                    zIndex: 25
                }}
            />
            
            <div style={{ textAlign: 'center' }}>
                <RefreshCw size={48} className="spin" style={{ color: COLORS.accent, marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
                <div style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.8rem', 
                    letterSpacing: '0.3em', 
                    color: COLORS.accent,
                    fontWeight: 900
                }}>
                    RENDER_IN_PROGRESS
                </div>
            </div>
        </div>
    );

    const getDynamicStyles = () => {
        const selectedGenre = GENRES.find(g => g.id === genre);
        const selectedStyle = STYLES.find(s => s.id === style);
        
        // Dynamic background tint based on genre
        const baseColor = isDarkMode ? '0, 0, 0' : '255, 255, 255';
        let tintColor = '57, 255, 20'; // Default Neon Green
        
        if (genre === 'cyberpunk') tintColor = '255, 0, 255';
        if (genre === 'space') tintColor = '0, 191, 255';
        if (genre === 'horror') tintColor = '255, 69, 0';
        
        return {
            background: `radial-gradient(circle at 50% 50%, rgba(${tintColor}, 0.05) 0%, rgba(${baseColor}, 1) 100%)`,
            accentShadow: `0 0 40px rgba(${tintColor}, 0.2)`
        };
    };

    const dynamicStyles = getDynamicStyles();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: COLORS.bg,
            color: COLORS.text,
            fontFamily: COLORS.sans,
            padding: '8rem 2rem 4rem 2rem',
            position: 'relative',
            overflowX: 'hidden',
            background: dynamicStyles.background,
            transition: 'background 1s ease'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ 
                    marginBottom: '6rem', 
                    borderBottom: `1px solid ${COLORS.border}`, 
                    paddingBottom: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '0.8rem', fontFamily: COLORS.mono, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.3em' }}>
                            WALLPAPER_STUDIO // PRO_EDITION
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.55rem', color: COLORS.textSecondary, letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.2rem' }}>DAILY_COMPUTE</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: COLORS.display }}>{credits}/10 CREDITS</div>
                        </div>
                    </div>
                    <h1 style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', fontFamily: COLORS.display, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.03em', margin: 0 }}>
                        THE_LABORATORY
                    </h1>
                </header>
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

                        <button
                            onClick={handleSurpriseMe}
                            style={{
                                width: '100%',
                                marginBottom: '2rem',
                                padding: '0.75rem',
                                backgroundColor: 'transparent',
                                border: `1px solid ${COLORS.border}`,
                                color: COLORS.accent,
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                textTransform: 'uppercase',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.05)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Sparkles size={16} />
                            [ SURPRISE_ME // SHUFFLE_AESTHETIC ]
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: COLORS.textSecondary, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                                    // COLOR_BIAS
                                </label>
                                <select
                                    value={colorBias || ''}
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
                                    value={ratio || ''}
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
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: COLORS.text, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                                                    RENDER SEED
                                                </label>
                                                <input
                                                    type="number"
                                                    value={seed}
                                                    onChange={(e) => setSeed(parseInt(e.target.value))}
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: 'transparent',
                                                        border: `1px solid ${COLORS.border}`,
                                                        color: COLORS.text,
                                                        padding: '0.75rem',
                                                        fontFamily: COLORS.mono,
                                                        fontSize: '0.8rem',
                                                        outline: 'none'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: COLORS.text, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                                                    PROMPT SUPPLEMENT
                                                </label>
                                                <textarea
                                                    value={customSupplement}
                                                    onChange={(e) => setCustomSupplement(e.target.value)}
                                                    placeholder="Add modifiers (e.g. volumetric, 8k)"
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '60px',
                                                        backgroundColor: 'transparent',
                                                        border: `1px solid ${COLORS.border}`,
                                                        color: COLORS.text,
                                                        padding: '0.75rem',
                                                        fontFamily: COLORS.sans,
                                                        fontSize: '0.8rem',
                                                        outline: 'none',
                                                        resize: 'none'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: COLORS.text, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                                                    NEGATIVE PROMPT
                                                </label>
                                                <textarea
                                                    value={negativePrompt}
                                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                                    placeholder="Things to avoid (e.g. blurry, faces)"
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '60px',
                                                        backgroundColor: 'transparent',
                                                        border: `1px solid ${COLORS.border}`,
                                                        color: COLORS.text,
                                                        padding: '0.75rem',
                                                        fontFamily: COLORS.sans,
                                                        fontSize: '0.8rem',
                                                        outline: 'none',
                                                        resize: 'none'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <Sparkles size={16} style={{ color: isHighQuality ? COLORS.accent : COLORS.textSecondary }} />
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                                        MASTERPIECE_ENGINE
                                                    </span>
                                                </div>
                                                <div 
                                                    onClick={() => setIsHighQuality(!isHighQuality)}
                                                    style={{
                                                        width: '44px',
                                                        height: '24px',
                                                        backgroundColor: isHighQuality ? COLORS.accent : COLORS.border,
                                                        padding: '2px',
                                                        borderRadius: '0',
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <motion.div 
                                                        animate={{ x: isHighQuality ? 20 : 0 }}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            backgroundColor: isHighQuality ? '#000' : COLORS.textSecondary,
                                                            border: `1px solid ${isHighQuality ? '#000' : COLORS.border}`,
                                                            position: 'relative'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Execute Button */}
                        <motion.button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                backgroundColor: isGenerating ? COLORS.surface : COLORS.accent,
                                color: isGenerating ? COLORS.textSecondary : '#000',
                                border: `1px solid ${COLORS.border}`,
                                fontFamily: COLORS.display,
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={20} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                                    ENGINE_ACTIVE...
                                </>
                            ) : (
                                <>
                                    <TerminalIcon size={20} />
                                    GENERATE_RENDER
                                </>
                            )}
                        </motion.button>

                        {/* Production Manifest (Replacing Sys Logs) */}
                        <div style={{ marginTop: '2.5rem', border: `1px solid ${COLORS.border}`, padding: '1.5rem' }}>
                            <div style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: COLORS.mono, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>PRODUCTION_MANIFEST</span>
                                <span style={{ fontFamily: COLORS.mono, fontSize: '0.6rem', color: COLORS.textSecondary }}>DEV_ID: {deviceId}</span>
                            </div>
                            
                            <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {logs.length === 0 && <div style={{ fontSize: '0.7rem', color: COLORS.textSecondary, fontStyle: 'italic' }}>Awaiting production command...</div>}
                                {logs.map((log, i) => (
                                    <div key={i} style={{ 
                                        fontSize: '0.65rem', 
                                        fontFamily: COLORS.mono,
                                        color: log.includes('ERR') ? '#E8111A' : COLORS.text,
                                        display: 'flex',
                                        gap: '1rem'
                                    }}>
                                        <span style={{ color: COLORS.textSecondary, opacity: 0.5 }}>{(i + 1).toString().padStart(2, '0')}</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                            </div>
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
                                    <ScanningLoader />
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
                                    <div key="placeholder" style={{ color: COLORS.textSecondary, textAlign: 'center' }}>
                                        <Layout size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>BUFFER_READY // AWAITING_RENDER</div>
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
                        <div style={{ marginBottom: '3rem', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontFamily: COLORS.mono, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: '1rem' }}>
                                05 — ASSET_ARCHIVE
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
                                <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontFamily: COLORS.display, fontWeight: 900, margin: 0 }}>LOCAL_COLLECTION</h2>
                                <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.5rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.55rem', color: COLORS.textSecondary, letterSpacing: '0.1em', fontWeight: 700 }}>ITEMS_SAVED</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: COLORS.display }}>{archive.length.toString().padStart(2, '0')}</div>
                                    </div>
                                    <button 
                                        onClick={() => { if(confirm('Purge archive?')) setArchive([]); }}
                                        style={{ 
                                            padding: '0.5rem 1rem', 
                                            border: `1px solid ${COLORS.border}`, 
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            fontFamily: COLORS.mono,
                                            height: 'fit-content',
                                            alignSelf: 'flex-end',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        PURGE_DATABASE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <AnimatePresence mode="popLayout">
                                {archive.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        id={`archive-item-${item.id}`}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ 
                                            opacity: 1, 
                                            scale: 1, 
                                            y: 0,
                                            transition: { delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 } 
                                        }}
                                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                        style={{
                                            backgroundColor: COLORS.surface,
                                            border: `1px solid ${COLORS.border}`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        onClick={() => setSelectedAsset(item)}
                                    >
                                        <div style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
                                            <img src={item.url} alt="Archived" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div 
                                                className="hover-overlay"
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.6rem', color: '#000', backgroundColor: COLORS.accent, fontWeight: 900, padding: '0.4rem 0.8rem', fontFamily: COLORS.display }}>
                                                    VIEW_SPEC
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '0.75rem', position: 'relative' }}>
                                            <div style={{ fontSize: '0.6rem', color: COLORS.accent, fontWeight: 900, marginBottom: '0.25rem' }}>
                                                {item.genre} // {item.style}
                                            </div>
                                            <div style={{ fontSize: '0.55rem', color: COLORS.textSecondary, letterSpacing: '0.05em' }}>
                                                {item.date}
                                            </div>
                                        </div>
                                        
                                        {/* Item Delete */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteFromArchive(item.id);
                                            }}
                                            className="delete-btn"
                                            style={{
                                                position: 'absolute',
                                                top: '0.5rem',
                                                right: '0.5rem',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: 'rgba(232, 17, 26, 0.9)',
                                                border: 'none',
                                                color: '#fff',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                zIndex: 5,
                                                opacity: 0,
                                                transition: 'opacity 0.2s'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
            <AnimatePresence>
                {selectedAsset && (
                    <Lightbox asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                div:hover > div > .hover-overlay { opacity: 1 !important; }
                div:hover > .delete-btn { opacity: 1 !important; }
                
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
