import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sparkles, ArrowLeft, RefreshCw, Download, Layout, X, Settings2, Image as ImageIcon, Zap, Wand2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
    GENRES, STYLES, STORAGE_KEY, ARCHIVE_KEY, DAILY_LIMIT,
    COLOR_BIASES, RATIOS, PROMPT_TEMPLATES,
    PROMPT_COLLECTIONS, FEATURED_TAGS, NEGATIVE_PROMPT
} from '../data/wallpaperConfig';
import { useAuth } from '../context/AuthContext';
import { fetchOpenRouter, AI_COSTS } from '../utils/ai';
import { supabase } from '../utils/supabase';

const COLORS = {
    bgLight: '#FAFAFA',
    bgDark: '#0A0A0A',
    surfaceLight: '#FFFFFF',
    surfaceDark: '#121212',
    borderLight: '#EAEAEE',
    borderDark: '#2A2A2A',
    textLight: '#111111',
    textDark: '#EEEEEE',
    textMutedLight: '#666666',
    textMutedDark: '#888888',
    accent: '#39FF14', // We keep the green accent for brand identity
    mono: 'var(--font-mono)',
    sans: 'var(--font-sans)',
    display: 'var(--font-display)'
};

// --- LIGHTWEIGHT Sub-Components ---

const Loader = () => {
    const pixels = Array.from({ length: 16 });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                width: '60px',
                height: '60px'
            }}>
                {pixels.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: [0.1, 1, 0.1] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                        style={{
                            backgroundColor: 'var(--color-text)',
                            borderRadius: '4px',
                        }}
                    />
                ))}
            </div>
            <div style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.2em',
                color: 'var(--color-text)',
                fontWeight: 900
            }}>
                [ SYNTHESIZING_ASSET_V1 ]
            </div>
        </div>
    );
};

const Pill = ({ active, onClick, children }) => (
    <motion.button
        whileHover={{ backgroundColor: active ? 'var(--color-text)' : 'rgba(0,0,0,0.05)' }}
        onClick={onClick}
        style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '100px',
            backgroundColor: active ? 'var(--color-text)' : 'transparent',
            color: active ? 'var(--color-bg)' : 'var(--color-text)',
            border: `1.5px solid var(--color-text)`,
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
        }}
    >
        {children.toUpperCase()}
    </motion.button>
);

const WallpaperLab = () => {
    const { isDarkMode } = useTheme();
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const themeVars = {
        '--theme-bg': isDarkMode ? COLORS.bgDark : COLORS.bgLight,
        '--theme-surface': isDarkMode ? COLORS.surfaceDark : COLORS.surfaceLight,
        '--theme-border': isDarkMode ? COLORS.borderDark : COLORS.borderLight,
        '--theme-text': isDarkMode ? COLORS.textDark : COLORS.textLight,
        '--theme-text-muted': isDarkMode ? COLORS.textMutedDark : COLORS.textMutedLight,
    };

    // State
    const [genre, setGenre] = useState(GENRES[0].id);
    const [style, setStyle] = useState(STYLES[0].id);
    const [ratio, setRatio] = useState(RATIOS[1].id);
    const [customSupplement, setCustomSupplement] = useState('');
    const [archive, setArchive] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('genre'); // genre, style, modifiers
    const [isEnhancing, setIsEnhancing] = useState(false);


    // Live prompt that auto-builds from selections
    const buildLivePrompt = () => {
        const selectedGenre = GENRES.find(g => g.id === genre);
        const selectedStyle = STYLES.find(s => s.id === style);
        let prompt = `${selectedGenre?.prompt || ''}, ${selectedStyle?.prompt || ''}, cinematic lighting, highly detailed`;
        if (customSupplement) prompt += `, ${customSupplement}`;
        return prompt;
    };

    const livePrompt = buildLivePrompt();

    // AI Enhance: silently sends the prompt to OpenRouter and returns only the enhanced version
    const handleEnhancePrompt = async () => {
        if (isEnhancing) return;
        setIsEnhancing(true);
        try {
            const data = await fetchOpenRouter({
                model: 'google/gemma-4-31b:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert AI image prompt engineer. The user will give you a wallpaper generation prompt. Your ONLY job is to enhance it — make it more vivid, detailed, and optimized for AI image generation. Reply with ONLY the enhanced prompt text. No explanations, no headers, no bullet points, no markdown. Just the raw enhanced prompt.'
                    },
                    { role: 'user', content: livePrompt }
                ],
                temperature: 0.7
            }, { title: 'RE-RENDER Wallpaper Lab' });

            const enhanced = data.choices?.[0]?.message?.content?.trim();
            if (enhanced) setCustomSupplement(enhanced);
        } catch (err) {
            console.error('AI Enhance failed:', err);
        } finally {
            setIsEnhancing(false);
        }
    };

    // Init storage (Local Archive Only)
    useEffect(() => {
        const rawArchive = localStorage.getItem(ARCHIVE_KEY);
        if (rawArchive) setArchive(JSON.parse(rawArchive));
    }, []);

    const saveToArchive = (url, metadata) => {
        const newAsset = { id: Date.now(), url, date: new Date().toLocaleString(), ...metadata };
        // Base64 images are large. Limit archive to 10-15 items to stay under 5MB localStorage quota.
        let updatedArchive = [newAsset, ...archive].slice(0, 12);

        try {
            setArchive(updatedArchive);
            localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchive));
        } catch (e) {
            console.error('Storage Quota Exceeded. Purging old assets...', e);
            // If still failing, keep only the most recent 5
            updatedArchive = updatedArchive.slice(0, 5);
            setArchive(updatedArchive);
            try {
                localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchive));
            } catch (innerError) {
                // Last resort: clear all
                localStorage.removeItem(ARCHIVE_KEY);
                setArchive([]);
            }
        }
    };

    const clearArchive = () => {
        localStorage.removeItem(ARCHIVE_KEY);
        setArchive([]);
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

                const fontSize = Math.max(24, Math.floor(img.width * 0.025));
                ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctx.textAlign = "right";
                ctx.letterSpacing = "2px";
                ctx.fillText("RE-RENDER", canvas.width - fontSize, canvas.height - fontSize);

                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(imageUrl);
            img.src = imageUrl;
        });
    };

    const handleGenerate = async () => {
        if (isGenerating) return;

        // AUTH CHECK
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        // CREDIT CHECK
        if (!profile || profile.credits < AI_COSTS.GEN_IMAGE) {
            setError("📉 OUT_OF_COMPUTE: Insufficient credits. Costs 10 credits.");
            return;
        }

        // SPEND CREDIT
        const success = await spendCredits(AI_COSTS.GEN_IMAGE, 'WALLPAPER_GEN');
        if (!success) return;

        setIsGenerating(true);
        setError(null);
        setResultUrl(null);

        const selectedGenre = GENRES.find(g => g.id === genre);
        const selectedStyle = STYLES.find(s => s.id === style);

        // Use the live prompt directly
        const compositePrompt = livePrompt;

        try {
            const selectedRatio = RATIOS.find(r => r.id === ratio);
            const response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: compositePrompt,
                    width: selectedRatio.width,
                    height: selectedRatio.height,
                    seed: Math.floor(Math.random() * 1000000)
                })
            });

            if (!response.ok) throw new Error("Server communication failed.");
            const data = await response.json();

            let finalUrl = data.url || (data.images && data.images[0]?.url) || data.output || data[0]?.url;
            if (finalUrl && typeof finalUrl === 'string' && !finalUrl.startsWith('http')) {
                if (finalUrl.length > 100) finalUrl = `data:image/png;base64,${finalUrl}`;
            }

            if (finalUrl) {
                // Remove watermark if user is PRO
                const watermarkedUrl = profile?.is_pro ? finalUrl : await applyWatermark(finalUrl);
                setResultUrl(watermarkedUrl);
                saveToArchive(watermarkedUrl, { genre: selectedGenre.name, style: selectedStyle.name, prompt: compositePrompt });
            } else {
                throw new Error("No payload generated.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (url) => {
        const downloadUrl = url || resultUrl;
        if (!downloadUrl) return;
        try {
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `rerender-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            minHeight: '100vh',
            fontFamily: 'var(--font-sans)',
            paddingBottom: isMobile ? '80px' : '0',
            paddingTop: '80px'
        }}>

            {/* Masthead Header */}
            <header style={{
                padding: '2rem',
                borderBottom: '4px solid var(--color-text)',
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: window.innerWidth < 600 ? 'flex-start' : 'baseline',
                gap: window.innerWidth < 600 ? '1.5rem' : '0'
            }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.2em',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '0.5rem'
                    }}>
                        VOL. 01 // LAB_REPORTS // RE-RENDER_STUDIO
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 15vw, 5rem)',
                        fontWeight: 900,
                        margin: 0,
                        letterSpacing: '-0.04em',
                        lineHeight: 0.9,
                        fontFamily: 'var(--font-display)'
                    }}>
                        WALLPAPER<br />
                        <span style={{
                            fontFamily: 'Playfair Display',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: 'var(--color-accent)'
                        }}>LAB</span>
                    </h1>
                </div>

                <div style={{
                    textAlign: window.innerWidth < 600 ? 'left' : 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    width: window.innerWidth < 600 ? '100%' : 'auto'
                }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.6 }}>COMPUTE_RESERVE</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                        {profile?.credits ?? 0}<span style={{ fontSize: '0.8rem', marginLeft: '0.2rem' }}>CR</span>
                    </div>
                    <Link to="/profile" style={{
                        textDecoration: 'none',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-text)',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        marginTop: '0.5rem',
                        display: 'inline-block',
                        width: 'fit-content'
                    }}>
                        GET_CREDITS
                    </Link>
                </div>
            </header>

            <main style={{
                maxWidth: '1200px',
                margin: '3rem auto',
                padding: '0 2rem',
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '1fr 400px',
                gap: window.innerWidth < 1000 ? '2rem' : '4rem'
            }}>

                {/* Column 01: Visual Canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        width: '100%',
                        aspectRatio: ratio === '9:16' ? '9/16' : (ratio === '16:9' ? '16/9' : '1/1'),
                        backgroundColor: 'var(--color-surface)',
                        border: '2px solid var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                    }}>
                        {isGenerating ? (
                            <Loader />
                        ) : resultUrl ? (
                            <motion.img
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={resultUrl}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <ImageIcon size={48} opacity={0.2} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>AWAITING_VISUAL_INPUT</span>
                            </div>
                        )}
                        {resultUrl && !isGenerating && (
                            <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => handleDownload(resultUrl)} style={{
                                    background: 'var(--color-text)', color: 'var(--color-bg)',
                                    border: 'none', padding: '1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Download size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                        gap: '1.5rem',
                        padding: '1.5rem',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>ENGINE_STATUS:</span> {isGenerating ? 'PROCESSING' : 'IDLE'}<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>ASPECT_RATIO:</span> {ratio}
                        </div>
                        <div style={{ flex: 1 }}>
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>RE-RENDER_ID:</span> {resultUrl ? 'GEN_SUCCESS' : 'NULL'}<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>TIMESTAMP:</span> {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#FF0000', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 900, border: '1px solid #FF0000', padding: '1rem' }}>
                            CRITICAL_ERROR: {error.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Column 02: Editorial Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                    {/* Dimension Select */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>DIMENSIONS</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {RATIOS.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setRatio(r.id)}
                                    style={{
                                        padding: '1rem 0',
                                        backgroundColor: ratio === r.id ? 'var(--color-text)' : 'transparent',
                                        color: ratio === r.id ? 'var(--color-bg)' : 'var(--color-text)',
                                        border: '1.5px solid var(--color-text)',
                                        cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900,
                                        transition: 'all 0.1s'
                                    }}
                                >
                                    {r.id === '1:1' ? 'SQUARE' : (r.id === '16:9' ? 'DESKTOP' : 'MOBILE')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor's Blocks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                            {['genre', 'style', 'modifiers'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: 'none', border: 'none', padding: 0,
                                        color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                        fontWeight: 900,
                                        fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {tab}
                                    {activeTab === tab && <motion.div layoutId="underline" style={{ position: 'absolute', bottom: '-0.85rem', left: 0, right: 0, height: '3px', backgroundColor: 'var(--color-text)' }} />}
                                </button>
                            ))}
                        </div>

                        <div style={{ minHeight: '180px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {activeTab === 'genre' && GENRES.map(g => (
                                    <Pill key={g.id} active={genre === g.id} onClick={() => setGenre(g.id)}>{g.name}</Pill>
                                ))}
                                {activeTab === 'style' && STYLES.map(s => (
                                    <Pill key={s.id} active={style === s.id} onClick={() => setStyle(s.id)}>{s.name}</Pill>
                                ))}
                                {activeTab === 'modifiers' && (
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <textarea
                                            value={customSupplement}
                                            onChange={(e) => setCustomSupplement(e.target.value)}
                                            placeholder="KEYWORDS..."
                                            style={minimalInputStyle}
                                        />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {FEATURED_TAGS.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setCustomSupplement(prev => prev ? `${prev}, ${tag}` : tag)}
                                                    style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', padding: '0.4rem 0.8rem', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 900 }}
                                                >
                                                    + {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Prompt Audit */}
                    <div style={{ borderTop: '2.5px solid var(--color-text)', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>GENERATION_DIRECTIVE</div>
                            <button
                                onClick={handleEnhancePrompt}
                                disabled={isEnhancing}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.5rem 1rem', border: '1.5px solid var(--color-text)',
                                    backgroundColor: isEnhancing ? 'var(--color-text)' : 'transparent',
                                    color: isEnhancing ? 'var(--color-bg)' : 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {isEnhancing ? <RefreshCw size={12} className="spin" /> : <Wand2 size={12} />}
                                <span>{isEnhancing ? 'ENHANCING' : 'AI_ENHANCE'}</span>
                            </button>
                        </div>
                        <div style={{
                            width: '100%', padding: '1.5rem',
                            backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6,
                            maxHeight: '150px', overflowY: 'auto', fontStyle: 'italic'
                        }}>
                            "{livePrompt}"
                        </div>
                    </div>

                    {/* Execute Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)}
                        style={{
                            width: '100%', padding: '1.5rem',
                            backgroundColor: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'var(--color-border)' : 'var(--color-text)',
                            color: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'var(--color-text-secondary)' : 'var(--color-bg)',
                            border: 'none',
                            fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.9rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                            letterSpacing: '0.1em'
                        }}
                    >
                        {isGenerating ? <RefreshCw size={20} className="spin" /> : (
                            <>
                                <Sparkles size={18} />
                                {(profile?.credits >= AI_COSTS.GEN_IMAGE) ? 'EXECUTE_GEN_COMMAND' : 'INSUFFICIENT_FUNDS'}
                            </>
                        )}
                        <style>{`
                            .spin { animation: spin 1s linear infinite; }
                            @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
                    </button>
                </div>
            </main>

            {/* Local Archive List */}
            {archive.length > 0 && (
                <section style={{ maxWidth: '1200px', margin: '6rem auto 0', padding: '0 2rem 6rem' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid var(--color-text)', paddingBottom: '1rem', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>LOCAL_ARCHIVE</h2>
                            <span style={{ fontSize: '0.7rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>// {archive.length} ENTRIES</span>
                        </div>
                        <button
                            onClick={clearArchive}
                            style={{
                                background: 'none', border: '1px solid var(--color-border)',
                                padding: '0.5rem 1rem', fontSize: '0.6rem',
                                fontFamily: 'var(--font-mono)', fontWeight: 900, cursor: 'pointer'
                            }}
                        >
                            PURGE_ARCHIVE
                        </button>
                    </header>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                        {archive.map(item => (
                            <div key={item.id} style={{ border: '1px solid var(--color-border)', padding: '0.5rem', backgroundColor: 'var(--color-surface)', position: 'relative' }}>
                                <img src={item.url} alt="Archive" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                    padding: '1rem 0', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', opacity: 0.6
                                }}>
                                    <div>{item.genre} // {item.style}</div>
                                    <button
                                        onClick={() => handleDownload(item.url)}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: '0 0.5rem' }}
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

const minimalInputStyle = {
    width: '100%',
    background: 'transparent',
    border: '1.5px solid var(--color-text)',
    color: 'var(--color-text)',
    padding: '1rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '120px'
};

export default WallpaperLab;
