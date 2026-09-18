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
import { useWindowSize } from '../hooks/useWindowSize';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';

const ACCENT = 'var(--color-accent)';

const Pill = ({ active, onClick, children }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        style={{
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            backgroundColor: active ? ACCENT : 'var(--color-surface)',
            color: active ? '#ffffff' : 'var(--color-text)',
            border: `1px solid ${active ? ACCENT : 'var(--color-border)'}`,
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            boxShadow: active ? 'var(--color-accent-glow)' : 'none'
        }}
    >
        {children}
    </motion.button>
);

const WallpaperLab = () => {
    const { width } = useWindowSize();
    const { isDarkMode } = useTheme();
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const isMobile = width < 768;

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
                model: 'openrouter/free',
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
            paddingBottom: isMobile ? '80px' : '6rem',
            paddingTop: '80px'
        }}>
            <LabHeader 
                title="Wallpaper" 
                subtitle="Lab." 
                vol="03" 
                credits={profile?.credits ?? 0} 
                accentColor={ACCENT}
                tag="CREATOR OS"
            />

            <main style={{
                maxWidth: '1200px',
                margin: '3rem auto',
                padding: '0 2rem',
                display: 'grid',
                gridTemplateColumns: width < 1000 ? '1fr' : '440px 1fr',
                gap: '2.5rem'
            }}>
                {/* Column 01: Controls (Jakob's Law: Left-to-Right Order) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '24px',
                        padding: '1.75rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        {/* Aspect Ratio */}
                        <div>
                            <label style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                fontFamily: 'var(--font-mono)', 
                                letterSpacing: '0.08em',
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase',
                                display: 'block',
                                marginBottom: '0.75rem'
                            }}>
                                Aspect Ratio
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {RATIOS.map(r => {
                                    const isSelected = ratio === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => setRatio(r.id)}
                                            style={{
                                                padding: '0.75rem 0',
                                                backgroundColor: isSelected ? ACCENT : 'var(--color-bg)',
                                                color: isSelected ? '#ffffff' : 'var(--color-text)',
                                                border: `1px solid ${isSelected ? ACCENT : 'var(--color-border)'}`,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {r.id === '1:1' ? 'Square' : (r.id === '16:9' ? 'Desktop' : 'Mobile')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Presets & Modifiers Tabs */}
                        <div>
                            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
                                {['genre', 'style', 'modifiers'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: '0.2rem 0',
                                            color: activeTab === tab ? ACCENT : 'var(--color-text-secondary)',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            fontFamily: 'var(--font-mono)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.div 
                                                layoutId="activeTabUnderline" 
                                                style={{ position: 'absolute', bottom: '-0.7rem', left: 0, right: 0, height: '2px', backgroundColor: ACCENT }} 
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div style={{ minHeight: '140px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                                    {activeTab === 'genre' && GENRES.map(g => (
                                        <Pill key={g.id} active={genre === g.id} onClick={() => setGenre(g.id)}>{g.name}</Pill>
                                    ))}
                                    {activeTab === 'style' && STYLES.map(s => (
                                        <Pill key={s.id} active={style === s.id} onClick={() => setStyle(s.id)}>{s.name}</Pill>
                                    ))}
                                    {activeTab === 'modifiers' && (
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <textarea
                                                value={customSupplement}
                                                onChange={(e) => setCustomSupplement(e.target.value)}
                                                placeholder="Add custom visual modifiers, color accents, or lighting details..."
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--color-bg)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '12px',
                                                    color: 'var(--color-text)',
                                                    padding: '0.85rem',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.85rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                    minHeight: '80px',
                                                    resize: 'vertical'
                                                }}
                                            />
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                {FEATURED_TAGS.map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => setCustomSupplement(prev => prev ? `${prev}, ${tag}` : tag)}
                                                        style={{
                                                            background: 'var(--color-bg)',
                                                            border: '1px solid var(--color-border)',
                                                            color: 'var(--color-text-secondary)',
                                                            padding: '0.35rem 0.65rem',
                                                            fontSize: '0.68rem',
                                                            fontFamily: 'var(--font-mono)',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
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

                        {/* Prompt Directive */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                <label style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700, 
                                    fontFamily: 'var(--font-mono)', 
                                    letterSpacing: '0.08em',
                                    color: 'var(--color-text-secondary)',
                                    textTransform: 'uppercase'
                                }}>
                                    Prompt Directive
                                </label>
                                <button
                                    onClick={handleEnhancePrompt}
                                    disabled={isEnhancing}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.35rem 0.7rem',
                                        border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`,
                                        borderRadius: '8px',
                                        backgroundColor: `color-mix(in srgb, ${ACCENT} 10%, transparent)`,
                                        color: ACCENT,
                                        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isEnhancing ? <RefreshCw size={12} className="spin" /> : <Wand2 size={12} />}
                                    <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance'}</span>
                                </button>
                            </div>
                            <div 
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-text)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.5,
                                    maxHeight: '110px',
                                    overflowY: 'auto',
                                    fontStyle: 'italic'
                                }}
                            >
                                "{livePrompt}"
                            </div>
                        </div>

                        {/* Primary Generate Button (Von Restorff Effect) */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                backgroundColor: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'var(--color-border)' : ACCENT,
                                color: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'var(--color-text-muted)' : '#ffffff',
                                border: 'none',
                                borderRadius: '16px',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                boxShadow: (isGenerating || (profile?.credits < AI_COSTS.GEN_IMAGE)) ? 'none' : 'var(--color-accent-glow)'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="spin" />
                                    <span>Synthesizing Canvas...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <span>{(profile?.credits >= AI_COSTS.GEN_IMAGE) ? 'Generate Wallpaper' : 'Insufficient Credits'}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={{ 
                            color: 'var(--color-viral)', 
                            fontSize: '0.85rem', 
                            backgroundColor: 'color-mix(in srgb, var(--color-viral) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--color-viral) 30%, transparent)', 
                            borderRadius: '16px',
                            padding: '1rem 1.25rem',
                            fontWeight: 600
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Column 02: Visual Canvas (Peak-End Rule: Right Panel) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        width: '100%',
                        aspectRatio: ratio === '9:16' ? '9/16' : (ratio === '16:9' ? '16/9' : '1/1'),
                        maxHeight: '620px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
                    }}>
                        {isGenerating ? (
                            <LabLoader label="Rendering wallpaper via Flux Schnell..." accentColor={ACCENT} />
                        ) : resultUrl ? (
                            <motion.img
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                src={resultUrl}
                                alt="Generated Wallpaper"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ 
                                color: 'var(--color-text-secondary)', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '1rem',
                                padding: '2rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    width: '56px', height: '56px',
                                    borderRadius: '16px',
                                    backgroundColor: 'var(--color-bg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid var(--color-border)',
                                    color: ACCENT
                                }}>
                                    <ImageIcon size={26} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                                        Awaiting Visual Synthesis
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                                        Select an aspect ratio and aesthetic style, then click Generate Wallpaper.
                                    </div>
                                </div>
                            </div>
                        )}

                        {resultUrl && !isGenerating && (
                            <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem' }}>
                                <button 
                                    onClick={() => handleDownload(resultUrl)} 
                                    style={{
                                        background: ACCENT, 
                                        color: '#ffffff',
                                        border: 'none', 
                                        padding: '0.85rem 1.25rem', 
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                                    }}
                                >
                                    <Download size={18} />
                                    <span>Download HD</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Metadata Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 1.5rem',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <span><strong>Model:</strong> Flux-1 Schnell</span>
                            <span><strong>Ratio:</strong> {ratio}</span>
                        </div>
                        <div>
                            <span style={{ 
                                color: isGenerating ? 'var(--color-viral)' : ACCENT, 
                                fontWeight: 700 
                            }}>
                                ● {isGenerating ? 'Rendering' : 'Ready'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Local Archive Gallery */}
            {archive.length > 0 && (
                <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 2rem' }}>
                    <header style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        borderBottom: '1px solid var(--color-border)', 
                        paddingBottom: '1rem', 
                        marginBottom: '2rem' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>Recent Creations</h2>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                ({archive.length} saved)
                            </span>
                        </div>
                        <button
                            onClick={clearArchive}
                            style={{
                                background: 'none', 
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                                padding: '0.4rem 0.8rem', 
                                fontSize: '0.7rem',
                                borderRadius: '8px',
                                fontFamily: 'var(--font-mono)', 
                                fontWeight: 600, 
                                cursor: 'pointer'
                            }}
                        >
                            Clear Archive
                        </button>
                    </header>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {archive.map(item => (
                            <div key={item.id} style={{ 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '16px',
                                overflow: 'hidden', 
                                backgroundColor: 'var(--color-surface)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
                            }}>
                                <img src={item.url} alt="Archive wallpaper" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                                <div style={{
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '0.85rem 1rem', 
                                    fontSize: '0.7rem', 
                                    fontFamily: 'var(--font-mono)', 
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    <span>{item.genre} · {item.style}</span>
                                    <button
                                        onClick={() => handleDownload(item.url)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: ACCENT, 
                                            cursor: 'pointer', 
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 0
                                        }}
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default WallpaperLab;
