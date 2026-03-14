import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Download, Share2, RefreshCw, Layers, Layout, 
    Terminal as TerminalIcon, Plus, ChevronUp, ChevronDown, 
    Sparkles, Wand2, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Magnetic from '../components/Animations/Magnetic';
import { 
    GENRES, STYLES, STORAGE_KEY, ARCHIVE_KEY, DAILY_LIMIT, 
    COLOR_BIASES, RATIOS, PROMPT_TEMPLATES,
    PROMPT_COLLECTIONS, FEATURED_TAGS, NEGATIVE_PROMPT
} from '../data/wallpaperConfig';

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

// --- SUB-COMPONENTS (Moved outside to prevent re-renders) ---

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

const MistyReveal = () => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0.2, 0.8, 0.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
            <motion.div
                animate={{ 
                    backgroundPosition: ['0% 0%', '100% 100%'],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                    mixBlendMode: 'overlay',
                }}
            />
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1.5rem',
                zIndex: 2
            }}>
                <div className="pulse-ring" />
                <div style={{ 
                    fontFamily: COLORS.display, 
                    fontSize: '1.2rem', 
                    fontWeight: 900, 
                    letterSpacing: '0.4em',
                    color: COLORS.accent,
                    textShadow: `0 0 20px ${COLORS.accent}44`
                }}>
                    RESOLVING_AESTHETIC
                </div>
            </div>
            <style>{`
                .pulse-ring {
                    width: 60px;
                    height: 60px;
                    border: 2px solid ${COLORS.accent};
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 ${COLORS.accent}66; }
                    70% { transform: scale(1.2); opacity: 0; box-shadow: 0 0 0 20px ${COLORS.accent}00; }
                    100% { transform: scale(0.8); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const Lightbox = ({ asset, onClose, onExportSpecCard }) => {
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
                    <div style={{ marginTop: '3rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <button 
                                onClick={() => onExportSpecCard(asset)}
                                style={{ 
                                    flex: 1, 
                                    padding: '1rem', 
                                    backgroundColor: 'transparent', 
                                    color: COLORS.accent, 
                                    border: `1px solid ${COLORS.accent}`, 
                                    fontWeight: 900, 
                                    cursor: 'pointer', 
                                    fontSize: '0.7rem', 
                                    fontFamily: COLORS.display 
                                }}
                            > EXPORT_SPEC_CARD </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = asset.url;
                                    link.download = `render-${asset.id}.png`;
                                    link.click();
                                }}
                                style={{ flex: 1, padding: '1rem', backgroundColor: COLORS.accent, color: '#000', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem', fontFamily: COLORS.display }}
                            > DOWNLOAD_RAW </button>
                            <button 
                                onClick={onClose}
                                style={{ padding: '1rem', backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: COLORS.display }}
                            > CLOSE </button>
                        </div>
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

const WallpaperLab = () => {
    const { isDarkMode } = useTheme();
    const [genre, setGenre] = useState(GENRES[0].id);
    const [style, setStyle] = useState(STYLES[0].id);
    const [colorBias, setColorBias] = useState(COLOR_BIASES[0].id);
    const [ratio, setRatio] = useState(RATIOS[1].id);
    
    // Advanced Settings
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [seed, setSeed] = useState(-1);
    const [negativePrompt, setNegativePrompt] = useState(NEGATIVE_PROMPT);
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
    const [activeSelector, setActiveSelector] = useState(null); // 'genre' | 'style' | 'mods' | null

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

    const removeMod = (modToRemove) => {
        const mods = customSupplement.split(',').map(m => m.trim());
        const updatedMods = mods.filter(m => m !== modToRemove);
        setCustomSupplement(updatedMods.join(', '));
        addLog(`ENGINE: Removed modifier segment`);
    };

    const applyWatermark = async (imageUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Minimalist RE-RENDER Watermark
                const fontSize = Math.max(24, Math.floor(img.width * 0.025));
                ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctx.textAlign = "right";
                ctx.letterSpacing = "2px";
                ctx.fillText("RE-RENDER", canvas.width - fontSize, canvas.height - fontSize);
                
                // Secondary stamp
                ctx.font = `500 ${fontSize * 0.4}px "JetBrains Mono", monospace`;
                ctx.fillText("// PRODUCTION_ASSET", canvas.width - fontSize, canvas.height - (fontSize * 0.5));
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(imageUrl); // Fallback to original
            img.src = imageUrl;
        });
    };

    const generateSpecCard = async (asset) => {
        addLog('ENGINE: Composite rendering active...');
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1080;
                canvas.height = 1440; // Editorial Portrait
                const ctx = canvas.getContext('2d');
                
                // Styling
                const ACCENT = '#39FF14'; 
                
                // 1. Background
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // 2. Draw Wallpaper (Square Crop/Fit)
                const targetH = 800;
                const aspect = img.width / img.height;
                let drawW = canvas.width;
                let drawH = canvas.width / aspect;
                
                ctx.drawImage(img, 0, 80, drawW, drawH);
                
                // 3. Editorial Masthead
                ctx.fillStyle = ACCENT;
                ctx.font = `900 70px "Space Grotesk"`;
                ctx.fillText("RE-RENDER", 60, drawH + 180);
                
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.font = `700 18px "JetBrains Mono"`;
                ctx.fillText("PRO_MANIFEST // VOLUME_01", 60, drawH + 210);
                
                // 4. Metadata
                ctx.fillStyle = "#fff";
                ctx.font = `900 32px "Space Grotesk"`;
                ctx.fillText(`${asset.genre.toUpperCase()} // ${asset.style.toUpperCase()}`, 60, drawH + 300);
                
                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.font = `500 20px "Inter"`;
                const promptLines = asset.prompt.match(/.{1,50}(\s|$)/g) || [];
                promptLines.slice(0, 2).forEach((line, i) => {
                    ctx.fillText(line.trim(), 60, drawH + 350 + (i * 30));
                });
                
                // 5. Technical Footer
                ctx.fillStyle = ACCENT;
                ctx.fillRect(60, canvas.height - 120, 100, 4);
                
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                ctx.font = `500 14px "JetBrains Mono"`;
                ctx.fillText(`ENGINE: FLUX.1_SCHNELL`, 60, canvas.height - 80);
                ctx.fillText(`SEED: ${asset.seed}`, canvas.width - 250, canvas.height - 80);
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = asset.url;
        });
    };

    const handleSurpriseMe = () => {
        const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)].id;
        const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)].id;
        setGenre(randomGenre);
        setStyle(randomStyle);
        addLog(`SURPRISE_ME: Randomized Aesthetic`);
    };

    const handleMagicEnhance = () => {
        const categories = Object.keys(PROMPT_COLLECTIONS);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const collection = PROMPT_COLLECTIONS[randomCategory];
        const randomEnhancer = collection[Math.floor(Math.random() * collection.length)];
        
        setCustomSupplement(prev => prev ? `${prev}, ${randomEnhancer}` : randomEnhancer);
        addLog(`ENGINE: Orchestrating ${randomCategory.toLowerCase()} aesthetic...`);
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
        const template = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];
        
        // Pick one random modifier from each major collection for variety
        const lighting = PROMPT_COLLECTIONS.LIGHTING[Math.floor(Math.random() * PROMPT_COLLECTIONS.LIGHTING.length)];
        const atmosphere = PROMPT_COLLECTIONS.ATMOSPHERE[Math.floor(Math.random() * PROMPT_COLLECTIONS.ATMOSPHERE.length)];
        const randomModifier = `${lighting}, ${atmosphere}`;

        // Build composite prompt strictly from config + advanced supplement
        let compositePrompt = template
            .replace('{style_prompt}', selectedStyle.prompt)
            .replace('{genre_prompt}', selectedGenre.prompt)
            .replace('{style_keywords}', selectedStyle.keywords || '')
            .replace('{color}', selectedColor ? selectedColor.name : 'natural')
            .replace('{random_modifier}', randomModifier)
            .replace('{style_tag}', selectedStyle.name.toUpperCase());

        if (customSupplement) {
            compositePrompt += `, ${customSupplement}`;
        }

        // Apply Negative Prompt
        if (negativePrompt) {
            compositePrompt += ` --no ${negativePrompt}`;
        }

        // Apply Quality Boosts
        if (isHighQuality) {
            compositePrompt += `, hyper-realistic 8k resolution, cinematic mastery, high fidelity render`;
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
                // Apply Watermark before displaying/saving
                addLog('ENGINE: Watermarking active...');
                const watermarkedUrl = await applyWatermark(finalUrl);
                
                setResultUrl(watermarkedUrl);
                addLog('GENERATION_SUCCESS: ASSET_RENDERED');
                updateQuota();
                saveToArchive(watermarkedUrl, {
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


    // --- UI SUB-COMPONENTS ---




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

    const dynamicStyles = getDynamicStyles();    return (
        <div style={{
            backgroundColor: COLORS.bg,
            color: COLORS.text,
            minHeight: '100vh',
            fontFamily: COLORS.sans,
            position: 'relative',
            overflowX: 'hidden',
            paddingBottom: '120px' // Space for floating bar
        }}>
            {/* Ambient Sync Background */}
            <div className="ambient-glow" style={{
                background: resultUrl ? `url(${resultUrl}) center/cover` : `linear-gradient(45deg, ${COLORS.accent}22, #000 70%)`
            }} />

            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
                {/* Minimal Editorial Header */}
                <header style={{
                    paddingTop: '2rem',
                    paddingBottom: '6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', fontFamily: COLORS.mono, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.3em' }}>
                        HIGGSFIELD_X_RERENDER // VOID_ENGINE
                    </div>
                    <h1 style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontFamily: COLORS.display, fontWeight: 900, lineHeight: 0.8, letterSpacing: '-0.04em', margin: 0 }}>
                        GENERATION
                    </h1>
                </header>

                {/* Main Centered Stage */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>
                    
                    {/* Immersive Preview */}
                    <div style={{
                        width: '100%',
                        maxWidth: ratio === '16:9' ? '1200px' : (ratio === '9:16' ? '500px' : '800px'),
                        position: 'relative'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(5,5,5,0.4)',
                            backdropFilter: 'blur(40px)',
                            border: `1px solid rgba(255,255,255,0.05)`,
                            borderRadius: '32px',
                            padding: '1.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
                        }}>
                             <div style={{
                                aspectRatio: ratio === '9:16' ? '9/16' : (ratio === '16:9' ? '16/9' : '1/1'),
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <AnimatePresence mode="wait">
                                    {isGenerating ? (
                                        <MistyReveal />
                                    ) : resultUrl ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ width: '100%', height: '100%' }}
                                        >
                                            <img
                                                src={resultUrl}
                                                alt="AI Render"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        </motion.div>
                                    ) : (
                                        <div style={{ textAlign: 'center', opacity: 0.3 }}>
                                            <Sparkles size={64} style={{ marginBottom: '1rem' }} />
                                            <div style={{ fontFamily: COLORS.display, fontSize: '1.5rem', fontWeight: 900 }}>READY_TO_ENGINEER</div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Floating Action Buttons over preview */}
                            {resultUrl && !isGenerating && (
                                <div style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', display: 'flex', gap: '0.75rem' }}>
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        onClick={handleDownload}
                                        style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                                    > <Download size={20} /> </motion.button>
                                     <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSelectedAsset({url: resultUrl, prompt: 'Current Render', genre: 'Active', style: 'Active', seed: seed === -1 ? 'auto' : seed, id: Date.now()})}
                                        style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                                    > <Layout size={20} /> </motion.button>
                                </div>
                            )}
                        </div>

                        {/* Credits / Status Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: COLORS.accent,
                            color: '#000',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '40px',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            fontFamily: COLORS.display,
                            zIndex: 10,
                            boxShadow: '0 10px 20px rgba(57, 255, 20, 0.3)'
                        }}>
                            {credits}/10 COMPUTATIONAL_CREDITS_REMAINING
                        </div>
                    </div>

                    {/* Featured Manifests (Prompt Tags) */}
                    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                        {FEATURED_TAGS.map(tag => (
                            <motion.button
                                key={tag}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                onClick={() => setCustomSupplement(tag)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '30px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: '0.7rem',
                                    fontFamily: COLORS.mono,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tag}
                            </motion.button>
                        ))}
                    </div>

                    {/* Local Archive Section */}
                     <div style={{ width: '100%', maxWidth: '1200px' }}>
                        {archive.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
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
                                                </div>
                                                <div style={{ padding: '0.75rem', position: 'relative' }}>
                                                    <div style={{ fontSize: '0.6rem', color: COLORS.accent, fontWeight: 900, marginBottom: '0.25rem' }}>
                                                        {item.genre} // {item.style}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Command Bar */}
            <div className="floating-bar glass-panel" style={{ 
                boxShadow: '0 -20px 50px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* Prompt & Controls Composite */}
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>
                        {RATIOS.map(r => (
                            <motion.button
                                key={r.id}
                                whileHover={{ scale: 1.1 }}
                                onClick={() => setRatio(r.id)}
                                style={{
                                    width: '32px',
                                    height: '42px',
                                    backgroundColor: ratio === r.id ? COLORS.accent : 'transparent',
                                    border: `1px solid ${ratio === r.id ? COLORS.accent : 'rgba(255,255,255,0.2)'}`,
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.5rem',
                                    fontWeight: 900,
                                    color: ratio === r.id ? '#000' : '#fff'
                                }}
                            >
                                {r.id}
                            </motion.button>
                        ))}
                    </div>
                    
                    {/* Prompt Recipe Preview */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '100%', 
                        left: '0', 
                        right: '0', 
                        padding: '1rem 2rem', 
                        backgroundColor: 'rgba(5,5,5,0.9)', 
                        backdropFilter: 'blur(30px)',
                        borderTop: `1px solid rgba(255,255,255,0.05)`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        zIndex: 1000
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
                            <span style={{ fontSize: '0.6rem', fontFamily: COLORS.mono, color: COLORS.accent, fontWeight: 700 }}>RECIPE:</span>
                            
                            <motion.button 
                                whileHover={{ color: COLORS.accent }}
                                onClick={() => setActiveSelector(activeSelector === 'genre' ? null : 'genre')}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.65rem', color: activeSelector === 'genre' ? COLORS.accent : 'rgba(255,255,255,0.6)', fontWeight: 700 }}
                            >
                                {GENRES.find(g => g.id === genre)?.name}
                            </motion.button>

                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                            
                            <motion.button 
                                whileHover={{ color: COLORS.accent }}
                                onClick={() => setActiveSelector(activeSelector === 'style' ? null : 'style')}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.65rem', color: activeSelector === 'style' ? COLORS.accent : '#fff', fontWeight: 900 }}
                            >
                                {STYLES.find(s => s.id === style)?.name.toUpperCase()}
                            </motion.button>

                            {isHighQuality && (
                                <>
                                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                                    <span style={{ fontSize: '0.65rem', color: COLORS.accent, fontWeight: 900 }}>ULTRA_HD</span>
                                </>
                            )}

                            {customSupplement && (
                                <>
                                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                                    <motion.button 
                                        whileHover={{ color: COLORS.accent }}
                                        onClick={() => setActiveSelector(activeSelector === 'mods' ? null : 'mods')}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.65rem', color: activeSelector === 'mods' ? COLORS.accent : 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}
                                    >
                                        +MODS
                                    </motion.button>
                                </>
                            )}
                        </div>

                        {/* Interactive Selector Overlays */}
                        <AnimatePresence>
                            {activeSelector && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    style={{ 
                                        padding: '1.5rem', 
                                        backgroundColor: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '16px' 
                                    }}
                                >
                                    {activeSelector === 'genre' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                            {GENRES.map(g => (
                                                <button 
                                                    key={g.id}
                                                    onClick={() => { setGenre(g.id); setActiveSelector(null); }}
                                                    style={{ 
                                                        padding: '0.5rem', 
                                                        background: genre === g.id ? COLORS.accent : 'rgba(255,255,255,0.05)', 
                                                        color: genre === g.id ? '#000' : '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {g.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {activeSelector === 'style' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                            {STYLES.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => { setStyle(s.id); setActiveSelector(null); }}
                                                    style={{ 
                                                        padding: '0.5rem', 
                                                        background: style === s.id ? COLORS.accent : 'rgba(255,255,255,0.05)', 
                                                        color: style === s.id ? '#000' : '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {s.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {activeSelector === 'mods' && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {customSupplement.split(',').map((mod, i) => (
                                                <div 
                                                    key={i}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.5rem', 
                                                        padding: '0.4rem 0.8rem', 
                                                        background: 'rgba(255,255,255,0.1)', 
                                                        borderRadius: '20px',
                                                        fontSize: '0.65rem'
                                                    }}
                                                >
                                                    <span>{mod.trim()}</span>
                                                    <button 
                                                        onClick={() => removeMod(mod.trim())}
                                                        style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', padding: '0 0.2rem', fontWeight: 900 }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {customSupplement.trim() && (
                                                <button 
                                                    onClick={() => { setCustomSupplement(''); setActiveSelector(null); }}
                                                    style={{ padding: '0.4rem 0.8rem', background: 'none', border: `1px solid ${COLORS.border}`, color: 'rgba(255,255,255,0.5)', borderRadius: '20px', fontSize: '0.6rem', cursor: 'pointer' }}
                                                >
                                                    CLEAR_ALL
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <input 
                        value={customSupplement}
                        onChange={(e) => setCustomSupplement(e.target.value)}
                        placeholder="Define your aesthetic manifest..."
                        style={{
                            flexGrow: 1,
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontFamily: COLORS.sans,
                            fontSize: '0.9rem',
                            outline: 'none',
                            padding: '0.5rem'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.1, color: COLORS.accent }}
                            onClick={handleMagicEnhance}
                            title="Magic Enhance"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                transition: 'color 0.2s ease'
                            }}
                        >
                            <Wand2 size={20} />
                        </motion.button>
                         <motion.button
                            onClick={() => setIsHighQuality(!isHighQuality)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: isHighQuality ? COLORS.accent : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer'
                            }}
                        >
                            <Sparkles size={20} />
                        </motion.button>
                        <Magnetic strength={0.2}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                style={{
                                    backgroundColor: isGenerating ? COLORS.surface : COLORS.accent,
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '12px',
                                    fontFamily: COLORS.display,
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isGenerating ? <RefreshCw size={18} className="spin" /> : <TerminalIcon size={18} />}
                                {isGenerating ? 'INGESTING...' : 'GENERATE'}
                            </motion.button>
                        </Magnetic>
                    </div>
                </div>
            </div>

            {/* Lightbox / Archive Detail */}
            <AnimatePresence>
                {selectedAsset && (
                    <Lightbox 
                        asset={selectedAsset} 
                        onClose={() => setSelectedAsset(null)} 
                        onExportSpecCard={async (asset) => {
                            const specUrl = await generateSpecCard(asset);
                            const link = document.createElement('a');
                            link.href = specUrl;
                            link.download = `spec-card-${asset.id}.png`;
                            link.click();
                        }}
                    />
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                div:hover > div > .hover-overlay { opacity: 1 !important; }
                div:hover > .delete-btn { opacity: 1 !important; }
                
                .glass-panel {
                    background: rgba(10, 10, 10, 0.7);
                    backdrop-filter: blur(12px) saturate(180%); /* Reduced blur from 20px */
                    -webkit-backdrop-filter: blur(12px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transform: translateZ(0); /* Force GPU acceleration */
                }

                .floating-bar {
                    position: fixed;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 900px;
                    z-index: 1000;
                    padding: 1rem 2rem;
                    border-radius: 24px;
                }

                .ambient-glow {
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    opacity: 0.3;
                    filter: blur(80px); /* Reduced blur for performance */
                    transition: opacity 1.5s ease;
                    will-change: opacity; /* GPU optimization */
                }

                @keyframes float {
                    0% { transform: translate(-50%, 0px); }
                    50% { transform: translate(-50%, -10px); }
                    100% { transform: translate(-50%, 0px); }
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
