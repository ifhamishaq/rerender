import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Instagram, Twitter, Video, Sparkles } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';
import LabPill from '../components/LabPill';

const ACCENT = '#E8111A';

const MODEL = 'google/gemma-4-31b-it:free';
const FALLBACK_MODEL = 'tencent/hy3-preview:free';

const PLATFORMS = [
    { id: 'instagram', name: 'INSTAGRAM', icon: <Instagram size={16} />, color: '#E1306C' },
    { id: 'tiktok', name: 'TIKTOK', icon: <Video size={16} />, color: '#00F2EA' },
    { id: 'x', name: 'X / TWITTER', icon: <Twitter size={16} />, color: '#1DA1F2' },
    { id: 'youtube', name: 'YOUTUBE', icon: <Video size={16} />, color: '#FF0000' },
    { id: 'linkedin', name: 'LINKEDIN', icon: <Twitter size={16} />, color: '#0077B5' },
    { id: 'facebook', name: 'FACEBOOK', icon: <Instagram size={16} />, color: '#1877F2' }
];

const TONES = ['professional', 'casual', 'witty', 'inspirational', 'edgy', 'gen-z'];

const CaptionWriterPage = () => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const [description, setDescription] = useState('');
    const [tone, setTone] = useState('professional');
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
            setError("📉 OUT_OF_COMPUTE: Insufficient credits. Costs 1 credit.");
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
                        content: `You are a social media conversion expert. Generate platform-specific captions using psychological persuasion triggers.
RESPOND ONLY IN THIS EXACT JSON FORMAT:
{"captions":[{"platform":"instagram","caption":"...","hashtags":"#tag1 #tag2 #tag3","psychology":"Curiosity Loop"},{"platform":"tiktok","caption":"...","hashtags":"#tag1 #tag2","psychology":"Trend Authority"},{"platform":"x","caption":"...","hashtags":"","psychology":"Pattern Interrupt"},{"platform":"youtube","caption":"...","hashtags":"","psychology":"Benefit Clarity"},{"platform":"linkedin","caption":"...","hashtags":"","psychology":"Social Proof"},{"platform":"facebook","caption":"...","hashtags":"","psychology":"Community Belonging"}]}

CRITICAL RULES:
- Apply triggers: Scarcity, Authority, Social Proof, Curiosity, or Liking.
- Use structured, punchy sentences. Avoid repetitive long dashes.
- Instagram: engaging, emoji-rich, with 5-8 relevant hashtags
- TikTok: hook-first, trendy, short, with 3-4 hashtags
- X/Twitter: concise (under 280 chars), punchy, no hashtags
- YouTube: SEO-optimized description style, with tags
- LinkedIn: professional, thought-leadership tone
- Facebook: conversational, community-focused, shareable
- Adapt tone to: ${tone}`
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
            setError(err.message === "INVALID_JSON_FORMAT" ? "AI_SYNTAX_ERROR" : "SYSTEM_OVERLOAD");
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
                title="CAPTION" 
                subtitle="Writer." 
                vol="02" 
                credits={profile?.credits ?? 0} 
                accentColor={ACCENT}
            />

            <main style={{
                maxWidth: '1200px',
                margin: '3rem auto',
                padding: '0 2rem',
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '1fr 400px',
                gap: window.innerWidth < 1000 ? '2rem' : '4rem'
            }}>
                {/* Column 01: Results / Canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        width: '100%',
                        minHeight: '400px',
                        backgroundColor: 'var(--color-surface)',
                        border: '2px solid var(--color-text)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: captions ? 'stretch' : 'center',
                        justifyContent: captions ? 'flex-start' : 'center',
                        padding: captions ? '0' : '2rem',
                        boxShadow: '10px 10px 0px rgba(0,0,0,0.05)',
                        position: 'relative'
                    }}>
                        {isGenerating ? (
                            <LabLoader label="GENERATING_COPY..." />
                        ) : captions ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                                {captions.captions?.map((c, i) => {
                                    const platform = PLATFORMS.find(p => p.id === c.platform) || PLATFORMS[0];
                                    return (
                                        <div key={i} style={{ 
                                            borderBottom: i === captions.captions.length - 1 ? 'none' : '1px solid var(--color-border)',
                                            padding: '2rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ color: platform.color }}>{platform.icon}</span>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900 }}>{platform.name}</span>
                                                    {c.psychology && (
                                                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: ACCENT, fontWeight: 900 }}>// {c.psychology.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => copyCaption(c.caption + (c.hashtags ? '\n\n' + c.hashtags : ''))}
                                                    style={{ background: 'none', border: '1.5px solid var(--color-text)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900 }}
                                                >
                                                    {copied === c.caption + (c.hashtags ? '\n\n' + c.hashtags : '') ? 'COPIED' : 'COPY'}
                                                </button>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.caption}</p>
                                            {c.hashtags && (
                                                <p style={{ marginTop: '1rem', color: ACCENT, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>{c.hashtags}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.3 }}>
                                <RefreshCw size={48} style={{ marginBottom: '1.5rem' }} />
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>AWAITING_INPUT_CONTEXT</div>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        padding: '1.5rem',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--color-text-secondary)',
                        gap: '2rem'
                    }}>
                        <div>
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>NEURAL_MODEL:</span> {MODEL.split('/')[1].toUpperCase()}<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>LATENCY:</span> {isGenerating ? 'CALCULATING' : 'IDLE'}
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>OUTPUT_FORMAT:</span> JSON_PURE<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>ACCURACY:</span> HIGH_RES
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: ACCENT, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 900, border: `1px solid ${ACCENT}`, padding: '1rem' }}>
                            CRITICAL_ERROR: {error.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Column 02: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    
                    {/* Description Area */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>INPUT_CONTEXT</div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="WHAT ARE WE RE-RENDERING?"
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: '1.5px solid var(--color-text)',
                                color: 'var(--color-text)',
                                padding: '1.5rem',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                minHeight: '200px',
                                resize: 'none'
                            }}
                        />
                    </div>

                    {/* Tones Area */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>VOICE_TONE</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {TONES.map(t => (
                                <LabPill key={t} active={tone === t} onClick={() => setTone(t)} accentColor={ACCENT}>{t}</LabPill>
                            ))}
                        </div>
                    </div>

                    {/* Execute Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !description.trim()}
                        style={{
                            width: '100%', padding: '1.5rem',
                            backgroundColor: (isGenerating || !description.trim()) ? 'var(--color-border)' : 'var(--color-text)',
                            color: (isGenerating || !description.trim()) ? 'var(--color-text-secondary)' : 'var(--color-bg)',
                            border: 'none',
                            fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.9rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                            letterSpacing: '0.1em'
                        }}
                    >
                        {isGenerating ? <RefreshCw size={20} className="spin" /> : (
                            <>
                                <Sparkles size={18} />
                                INITIALIZE_SYNTHESIS
                            </>
                        )}
                        <style>{`
                            .spin { animation: spin 1s linear infinite; }
                            @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default CaptionWriterPage;
