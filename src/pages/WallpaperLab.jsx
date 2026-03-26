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
import { AI_COSTS } from '../utils/ai';

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
    const pixels = Array.from({ length: 36 }); 
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '4px',
                width: '40px',
                height: '40px'
            }}>
                {pixels.map((_, i) => {
                    const delay = (i % 3) * 0.2 + (i % 5) * 0.15 + (i % 4) * 0.1;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.1, scale: 0.8 }}
                            animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1, 0.8] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: delay,
                                ease: "easeInOut"
                            }}
                            style={{
                                backgroundColor: 'var(--theme-text)',
                                borderRadius: '1px',
                                willChange: 'opacity, transform'
                            }}
                        />
                    );
                })}
            </div>
            <div style={{ fontSize: '0.7rem', fontFamily: COLORS.mono, letterSpacing: '0.2em', color: 'var(--theme-text-muted)', display: 'flex', gap: '0.2rem' }}>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
                    SYNTHESIZING_PATTERN
                </motion.span>
            </div>
        </div>
    );
};

const Pill = ({ active, onClick, children }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            backgroundColor: active ? 'var(--theme-text)' : 'transparent',
            color: active ? 'var(--theme-bg)' : 'var(--theme-text-muted)',
            border: `1px solid ${active ? 'var(--theme-text)' : 'var(--theme-border)'}`,
            fontSize: '0.8rem',
            fontFamily: COLORS.sans,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.1s ease',
            whiteSpace: 'nowrap'
        }}
    >
        {children}
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
            const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'RE-RENDER Wallpaper Lab',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'stepfun/step-3.5-flash:free',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert AI image prompt engineer. The user will give you a wallpaper generation prompt. Your ONLY job is to enhance it — make it more vivid, detailed, and optimized for AI image generation. Reply with ONLY the enhanced prompt text. No explanations, no headers, no bullet points, no markdown. Just the raw enhanced prompt.'
                        },
                        { role: 'user', content: livePrompt }
                    ],
                    temperature: 0.7
                })
            });
            const data = await response.json();
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
        const success = await spendCredits(AI_COSTS.GEN_IMAGE);
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
                const watermarkedUrl = await applyWatermark(finalUrl);
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

    const handleDownload = async () => {
        if (!resultUrl) return;
        try {
            const response = await fetch(resultUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rerender-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    return (
        <div style={{ ...themeVars, backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)', minHeight: '100vh', fontFamily: COLORS.sans, transition: 'background-color 0.2s', paddingBottom: isMobile ? '80px' : '0', paddingTop: '80px' }}>
            
            {/* Top Navigation */}
            <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--theme-text)', textDecoration: 'none' }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontFamily: COLORS.mono, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em' }}>BACK</span>
                </Link>
                <div style={{ fontFamily: COLORS.display, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    RE-RENDER STUDIO
                </div>
                <div style={{ fontSize: '0.8rem', fontFamily: COLORS.mono, color: 'var(--theme-text-muted)' }}>
                    CREDITS: <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>{profile?.credits ?? 0}</span>
                </div>
            </header>



            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '3rem' }}>
                
                {/* Canvas Area (Left side on Desktop, Top on Mobile) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100%',
                        maxWidth: ratio === '16:9' ? '800px' : (ratio === '9:16' ? '400px' : '600px'),
                        aspectRatio: ratio === '9:16' ? '9/16' : (ratio === '16:9' ? '16/9' : '1/1'),
                        backgroundColor: 'var(--theme-surface)',
                        border: '1px solid var(--theme-border)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
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
                            <div style={{ color: 'var(--theme-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <ImageIcon size={32} opacity={0.5} />
                                <span style={{ fontFamily: COLORS.mono, fontSize: '0.8rem' }}>AWAITING_PROMPT</span>
                            </div>
                        )}
                        
                        {/* Download CTA on Render */}
                        {resultUrl && !isGenerating && (
                            <button onClick={handleDownload} style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'var(--theme-text)', color: 'var(--theme-bg)', border: 'none', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                <Download size={20} />
                            </button>
                        )}
                    </div>

                    {error && (
                        <div style={{ marginTop: '1rem', color: '#FF3333', fontSize: '0.8rem', fontFamily: COLORS.mono }}>
                            ERROR: {error}
                        </div>
                    )}
                </div>

                {/* Configuration Panel (Right side on Desktop, Bottom on Mobile) */}
                <div style={{ width: isMobile ? '100%' : '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Aspect Ratio */}
                    <div>
                        <div style={{ fontSize: '0.7rem', fontFamily: COLORS.mono, color: 'var(--theme-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>DIMENSIONS</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {RATIOS.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => setRatio(r.id)}
                                    style={{
                                        flex: 1, padding: '0.75rem 0',
                                        backgroundColor: ratio === r.id ? 'var(--theme-text)' : 'transparent',
                                        color: ratio === r.id ? 'var(--theme-bg)' : 'var(--theme-text)',
                                        border: `1px solid ${ratio === r.id ? 'var(--theme-text)' : 'var(--theme-border)'}`,
                                        borderRadius: '12px', cursor: 'pointer', fontFamily: COLORS.mono, fontSize: '0.8rem', fontWeight: 600
                                    }}
                                >
                                    {r.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Navigation for Configuration */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem', gap: '1.5rem' }}>
                        {['genre', 'style', 'modifiers'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: 'none', border: 'none', padding: 0,
                                    color: activeTab === tab ? 'var(--theme-text)' : 'var(--theme-text-muted)',
                                    fontWeight: activeTab === tab ? 700 : 400,
                                    fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                {tab}
                                {activeTab === tab && <motion.div layoutId="underline" style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '2px', backgroundColor: 'var(--theme-text)' }} />}
                            </button>
                        ))}
                    </div>

                    {/* Highly Optimized Scrollable Pill Lists */}
                    <div style={{ flexGrow: 1, minHeight: '200px' }}>
                        {activeTab === 'genre' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {GENRES.map(g => (
                                    <Pill key={g.id} active={genre === g.id} onClick={() => setGenre(g.id)}>
                                        {g.name}
                                    </Pill>
                                ))}
                            </div>
                        )}
                        {activeTab === 'style' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {STYLES.map(s => (
                                    <Pill key={s.id} active={style === s.id} onClick={() => setStyle(s.id)}>
                                        {s.name}
                                    </Pill>
                                ))}
                            </div>
                        )}
                        {activeTab === 'modifiers' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <textarea 
                                    value={customSupplement}
                                    onChange={(e) => setCustomSupplement(e.target.value)}
                                    placeholder="Add custom keywords (e.g., neon lighting, misty, trending on artstation)"
                                    style={{
                                        width: '100%', height: '100px', padding: '1rem',
                                        backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)',
                                        border: '1px solid var(--theme-border)', borderRadius: '12px',
                                        fontFamily: COLORS.sans, fontSize: '0.9rem', resize: 'none'
                                    }}
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {FEATURED_TAGS.map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => setCustomSupplement(prev => prev ? `${prev}, ${tag}` : tag)}
                                            style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Prompt Preview */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', fontFamily: COLORS.mono, color: 'var(--theme-text-muted)', letterSpacing: '0.05em' }}>LIVE_PROMPT</div>
                            <button
                                onClick={handleEnhancePrompt}
                                disabled={isEnhancing}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.4rem 0.8rem', border: '1px solid var(--color-accent)',
                                    backgroundColor: isEnhancing ? 'var(--color-accent)' : 'transparent',
                                    color: isEnhancing ? '#000' : 'var(--color-accent)',
                                    borderRadius: '8px', fontFamily: COLORS.mono, fontSize: '0.65rem', fontWeight: 900,
                                    cursor: isEnhancing ? 'wait' : 'pointer', letterSpacing: '0.05em',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isEnhancing ? <RefreshCw size={12} className="spin" /> : <Wand2 size={12} />}
                                <span>{isEnhancing ? 'ENHANCING...' : 'AI ENHANCE'}</span>
                            </button>
                        </div>
                        <div style={{
                            width: '100%', padding: '1rem',
                            backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)',
                            border: '1px solid var(--theme-border)', borderRadius: '12px',
                            fontFamily: COLORS.mono, fontSize: '0.75rem', lineHeight: 1.6,
                            maxHeight: '120px', overflowY: 'auto', opacity: 0.8,
                            wordBreak: 'break-word'
                        }}>
                            {livePrompt}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)}
                        style={{
                            width: '100%', padding: '1.25rem',
                            backgroundColor: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'var(--theme-border)' : 'var(--theme-text)',
                            color: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'var(--theme-text-muted)' : 'var(--theme-bg)',
                            border: 'none', borderRadius: '16px',
                            fontFamily: COLORS.sans, fontWeight: 700, fontSize: '1rem',
                            cursor: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isGenerating ? <RefreshCw size={20} className="spin" /> : (
                            <>
                                <Sparkles size={20} />
                                {(profile?.credits >= AI_COSTS.GEN_IMAGE) ? 'GENERATE WALLPAPER' : 'INSUFFICIENT_CREDITS'}
                            </>
                        )}
                        <style>{`
                            .spin { animation: spin 1s linear infinite; }
                            @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
                    </button>
                </div>
            </main>

            {/* Archive Section - Minimal List */}
            {archive.length > 0 && (
                <section style={{ maxWidth: '1200px', margin: '4rem auto 0', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.8rem', fontFamily: COLORS.mono, color: 'var(--theme-text-muted)', letterSpacing: '0.05em' }}>
                            LOCAL_ARCHIVE ({archive.length}/12)
                        </div>
                        <button 
                            onClick={clearArchive}
                            style={{ 
                                background: 'none', border: '1px solid #FF3333', color: '#FF3333', 
                                padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.6rem', 
                                fontFamily: COLORS.mono, cursor: 'pointer' 
                            }}
                        >
                            CLEAR_ALL
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {archive.map(item => (
                            <div key={item.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--theme-border)' }}>
                                <img src={item.url} alt="Archive" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default WallpaperLab;
