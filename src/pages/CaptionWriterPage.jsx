import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Instagram, Twitter, Video, Sparkles } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';
import LabPill from '../components/LabPill';
import { useWindowSize } from '../hooks/useWindowSize';

const ACCENT = 'var(--color-accent)';

const MODEL = 'openrouter/free';
const FALLBACK_MODEL = 'openrouter/free';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={16} />, color: '#E1306C' },
    { id: 'tiktok', name: 'TikTok', icon: <Video size={16} />, color: '#00F2EA' },
    { id: 'x', name: 'X / Twitter', icon: <Twitter size={16} />, color: '#1DA1F2' },
    { id: 'youtube', name: 'YouTube', icon: <Video size={16} />, color: '#FF0000' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Twitter size={16} />, color: '#0077B5' },
    { id: 'facebook', name: 'Facebook', icon: <Instagram size={16} />, color: '#1877F2' }
];

const TONES = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Edgy', 'Gen-Z'];

const QUICK_PROMPTS = [
    "Behind-the-scenes build of our new AI creator tool",
    "Why 90% of creators fail at thumbnail click-through rates",
    "Dropping a free workflow template for digital artists",
    "A controversial truth about modern content monetization"
];

const CaptionWriterPage = () => {
    const { width } = useWindowSize();
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const [description, setDescription] = useState('');
    const [tone, setTone] = useState('Professional');
    const [captions, setCaptions] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!description.trim() || isGenerating) return;

        // AUTH CHECK
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        // CREDIT CHECK
        if (!profile || profile.credits < AI_COSTS.CAPTION) {
            setError("Insufficient credits. Generating captions costs 1 credit.");
            return;
        }

        // SPEND CREDIT
        const success = await spendCredits(AI_COSTS.CAPTION, 'CAPTION_GENERATION');
        if (!success) return;

        setIsGenerating(true);
        setError(null);
        setCaptions(null);

        try {
            const body = {
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are SYNTHESIS, a high-performance caption generation system built by Ifham at RE-RENDER.

Your job is to write captions that drive Attention, Engagement, Clicks, and Shares.
Do NOT write generic captions. Every caption must feel intentional and strategic.

---
CORE RULES:
1. HOOK FIRST: The first line must grab attention immediately.
2. KEEP IT SIMPLE: Simple English. Short sentences. Scroll-friendly.
3. PLATFORM AWARE:
   - Instagram: Engaging, emotional, relatable.
   - TikTok: Fast, punchy, trend-driven.
   - X (Twitter): Sharp, bold, opinionated.
   - YouTube: Clear value or curiosity.
   - LinkedIn: Professional but human.
   - Facebook: Conversational and community-focused.
4. PSYCHOLOGY DRIVEN: Use triggers like Curiosity, FOMO, Social Proof, or Authority.
5. NO FLUFF: Avoid "Check this out" or "Hope you like this".
6. HUMAN TOUCH: Do not sound robotic. Write like a real creator.

---
WRITING STYLE:
- Use line breaks for readability.
- Use **bold words** to highlight key emotional triggers.
- NEVER use em-dashes (—).

---
OUTPUT FORMAT: Return ONLY valid JSON in this exact structure:
{"captions":[{"platform":"instagram","caption":"...","hashtags":"#tag1 #tag2","psychology":"..."},{"platform":"tiktok","caption":"...","hashtags":"#tag1","psychology":"..."},{"platform":"x","caption":"...","hashtags":"","psychology":"..."},{"platform":"youtube","caption":"...","hashtags":"","psychology":"..."},{"platform":"linkedin","caption":"...","hashtags":"","psychology":"..."},{"platform":"facebook","caption":"...","hashtags":"","psychology":"..."}]}

Adapt tone to: ${tone.toLowerCase()}`
                    },
                    { role: 'user', content: `Write captions for this post: ${description}` }
                ],
                temperature: 0.8
            };

            let data;
            try {
                data = await fetchOpenRouter(body, { title: 'RE-RENDER Caption Writer' });
            } catch (err) {
                console.warn('[CAPTION] Primary model failed, attempting fallback...');
                data = await fetchOpenRouter({ ...body, model: FALLBACK_MODEL }, { title: 'RE-RENDER Caption Writer' });
            }

            const raw = data.choices?.[0]?.message?.content || '';
            const parsed = safeParseJSON(raw);

            if (parsed) {
                setCaptions(parsed);
            } else {
                throw new Error("NO_JSON_FOUND");
            }
        } catch (err) {
            setError(err.message === "INVALID_JSON_FORMAT" ? "AI syntax error. Please try generating again." : "Service is busy. Please retry in a moment.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyCaption = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 1500);
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            minHeight: '100vh',
            fontFamily: 'var(--font-sans)',
            paddingTop: '80px',
            paddingBottom: '8rem'
        }}>
            <LabHeader 
                title="Caption" 
                subtitle="Writer." 
                vol="02" 
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
                {/* Column 01: Controls & Inputs (Jakob's Law: Left-to-Right Reading Order) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Prompt Box Card */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '24px',
                        padding: '1.75rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                fontFamily: 'var(--font-mono)', 
                                letterSpacing: '0.08em',
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase'
                            }}>
                                Post Context & Concept
                            </label>
                            <span style={{ 
                                fontSize: '0.7rem', 
                                fontFamily: 'var(--font-mono)', 
                                color: description.length > 500 ? 'var(--color-viral)' : 'var(--color-text-muted)' 
                            }}>
                                {description.length} chars
                            </span>
                        </div>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your video, carousel idea, product drop, or message..."
                            style={{
                                width: '100%',
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '16px',
                                color: 'var(--color-text)',
                                padding: '1.25rem',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.95rem',
                                lineHeight: 1.6,
                                outline: 'none',
                                boxSizing: 'border-box',
                                minHeight: '160px',
                                resize: 'vertical',
                                transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = ACCENT}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />

                        {/* Quick Prompts (Hick's Law / Paradox of Active User) */}
                        <div>
                            <span style={{ 
                                fontSize: '0.68rem', 
                                fontFamily: 'var(--font-mono)', 
                                color: 'var(--color-text-muted)', 
                                letterSpacing: '0.05em',
                                display: 'block', 
                                marginBottom: '0.6rem' 
                            }}>
                                QUICK TEMPLATES
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {QUICK_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setDescription(prompt)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.5rem 0.75rem',
                                            fontSize: '0.78rem',
                                            fontFamily: 'var(--font-sans)',
                                            color: 'var(--color-text-secondary)',
                                            background: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = ACCENT;
                                            e.currentTarget.style.color = 'var(--color-text)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                                        }}
                                    >
                                        💡 {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tone Selection */}
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
                                Voice & Tone
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {TONES.map(t => (
                                    <LabPill key={t} active={tone === t} onClick={() => setTone(t)} accentColor={ACCENT}>{t}</LabPill>
                                ))}
                            </div>
                        </div>

                        {/* Primary Action Button (Von Restorff Effect) */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !description.trim()}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                backgroundColor: (isGenerating || !description.trim()) ? 'var(--color-border)' : ACCENT,
                                color: (isGenerating || !description.trim()) ? 'var(--color-text-muted)' : '#ffffff',
                                border: 'none',
                                borderRadius: '16px',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: (isGenerating || !description.trim()) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                boxShadow: (isGenerating || !description.trim()) ? 'none' : 'var(--color-accent-glow)',
                                marginTop: '0.5rem'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={18} className="spin" />
                                    <span>Synthesizing Copy...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <span>Generate Captions</span>
                                </>
                            )}
                        </button>
                        <style>{`
                            .spin { animation: spin 1s linear infinite; }
                            @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
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

                {/* Column 02: Results / Generated Captions (Peak-End Rule: Rich feedback) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        width: '100%',
                        minHeight: '520px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: captions ? 'stretch' : 'center',
                        justifyContent: captions ? 'flex-start' : 'center',
                        padding: captions ? '0' : '3rem 2rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {isGenerating ? (
                            <LabLoader label="Synthesizing multi-platform copy..." accentColor={ACCENT} />
                        ) : captions ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                                {captions.captions?.map((c, i) => {
                                    const platform = PLATFORMS.find(p => p.id === c.platform) || PLATFORMS[0];
                                    const fullText = c.caption + (c.hashtags ? '\n\n' + c.hashtags : '');
                                    const isItemCopied = copied === fullText;

                                    return (
                                        <div key={i} style={{ 
                                            borderBottom: i === captions.captions.length - 1 ? 'none' : '1px solid var(--color-border)',
                                            padding: '2rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ 
                                                        color: platform.color,
                                                        background: 'var(--color-bg)',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--color-border)'
                                                    }}>
                                                        {platform.icon}
                                                    </span>
                                                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 800 }}>
                                                        {platform.name}
                                                    </span>
                                                    {c.psychology && (
                                                        <span style={{ 
                                                            fontSize: '0.68rem', 
                                                            fontFamily: 'var(--font-mono)', 
                                                            color: ACCENT, 
                                                            backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '12px',
                                                            fontWeight: 700 
                                                        }}>
                                                            {c.psychology}
                                                        </span>
                                                    )}
                                                </div>

                                                <button 
                                                    onClick={() => copyCaption(fullText)}
                                                    style={{ 
                                                        background: isItemCopied ? ACCENT : 'var(--color-bg)', 
                                                        color: isItemCopied ? '#ffffff' : 'var(--color-text)',
                                                        border: `1px solid ${isItemCopied ? ACCENT : 'var(--color-border)'}`, 
                                                        padding: '0.45rem 0.9rem', 
                                                        cursor: 'pointer', 
                                                        fontFamily: 'var(--font-mono)', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 700,
                                                        borderRadius: '10px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    {isItemCopied ? <Check size={14} /> : <Copy size={14} />}
                                                    <span>{isItemCopied ? 'Copied' : 'Copy'}</span>
                                                </button>
                                            </div>

                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '0.95rem', 
                                                lineHeight: 1.65, 
                                                whiteSpace: 'pre-wrap',
                                                color: 'var(--color-text)'
                                            }}>
                                                {c.caption.replace(/—/g, '-')}
                                            </p>

                                            {c.hashtags && (
                                                <p style={{ 
                                                    marginTop: '1rem', 
                                                    color: ACCENT, 
                                                    fontFamily: 'var(--font-mono)', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 600,
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {c.hashtags}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', maxWidth: '360px' }}>
                                <div style={{
                                    width: '64px', height: '64px',
                                    borderRadius: '20px',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.25rem',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    <Sparkles size={28} />
                                </div>
                                <h3 style={{ 
                                    fontFamily: 'var(--font-display)', 
                                    fontSize: '1.2rem', 
                                    fontWeight: 800, 
                                    margin: '0 0 0.5rem',
                                    color: 'var(--color-text)'
                                }}>
                                    Ready to Generate
                                </h3>
                                <p style={{ 
                                    fontFamily: 'var(--font-sans)', 
                                    fontSize: '0.9rem', 
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    Enter your post context or pick a quick template on the left, then click Generate Captions.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Metadata Footer */}
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
                            <span><strong>Engine:</strong> OpenRouter Multi-Model</span>
                            <span><strong>Cost:</strong> 1 Credit / Run</span>
                        </div>
                        <div>
                            <span style={{ 
                                color: isGenerating ? 'var(--color-viral)' : 'var(--color-accent)', 
                                fontWeight: 700 
                            }}>
                                ● {isGenerating ? 'Processing' : 'Idle / Ready'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CaptionWriterPage;
