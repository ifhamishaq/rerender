import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Instagram, Twitter, Video } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';

const RED = '#E8111A';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-oss-20b:free'; // 3.6B active — lowest latency
const FALLBACK_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

const PLATFORMS = [
    { id: 'instagram', name: 'INSTAGRAM', icon: <Instagram size={16} />, color: '#E1306C' },
    { id: 'tiktok', name: 'TIKTOK', icon: <Video size={16} />, color: '#00F2EA' },
    { id: 'x', name: 'X / TWITTER', icon: <Twitter size={16} />, color: '#1DA1F2' },
    { id: 'youtube', name: 'YOUTUBE', icon: <Video size={16} />, color: '#FF0000' },
    { id: 'linkedin', name: 'LINKEDIN', icon: <Twitter size={16} />, color: '#0077B5' },
    { id: 'facebook', name: 'FACEBOOK', icon: <Instagram size={16} />, color: '#1877F2' }
];

const CaptionWriterPage = () => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const [description, setDescription] = useState('');
    const [tone, setTone] = useState('professional');
    const [captions, setCaptions] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(null);

    const TONES = ['professional', 'casual', 'witty', 'inspirational', 'edgy', 'gen-z'];

    const handleGenerate = async () => {
        if (!description.trim() || isGenerating) return;

        // AUTH CHECK
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        // CREDIT CHECK
        if (!profile || profile.credits < AI_COSTS.CAPTION) {
            alert(`📉 OUT_OF_COMPUTE: Insufficient credits. Costs ${AI_COSTS.CAPTION} credit.`);
            return;
        }

        // SPEND CREDIT
        const success = await spendCredits(AI_COSTS.CAPTION, 'CAPTION_GENERATION');
        if (!success) return;

        setIsGenerating(true);

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
            console.error('Caption generation failed:', err);
            const msg = err.message === "INVALID_JSON_FORMAT"
                ? "AI_SYNTAX_ERROR: The model returned an invalid format. Retrying may help."
                : "SYSTEM_OVERLOAD: AI nodes are currently congested. Please try again.";
            alert(msg);
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
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                <Link to="/tools" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', marginBottom: '3rem',
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0.6rem 1.25rem', borderRadius: '100px', fontWeight: 900,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                >
                    <ArrowLeft size={14} /> BACK_TO_LAB
                </Link>

                <div style={{ marginBottom: '5rem' }}>
                    <div style={{ 
                        fontSize: '0.6rem', fontFamily: 'var(--font-mono)', 
                        color: RED, marginBottom: '1rem', letterSpacing: '0.4em', 
                        fontWeight: 900, opacity: 0.8 
                    }}>
                        VOL_02 // NEURAL_COPY
                    </div>
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 900, 
                        fontFamily: 'var(--font-display)', lineHeight: 0.85, 
                        textTransform: 'uppercase', margin: 0, letterSpacing: '-0.04em' 
                    }}>
                        CAPTION<br />
                        <span style={{ 
                            fontFamily: 'Playfair Display', fontStyle: 'italic', 
                            fontWeight: 400, color: '#fff', opacity: 0.9, textTransform: 'none' 
                        }}>Writer.</span>
                    </h1>
                </div>

                {/* Input Area */}
                <div style={{ 
                    borderRadius: '32px', padding: '3rem', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(30px)',
                    marginBottom: '3rem', position: 'relative',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ 
                        position: 'absolute', top: '-0.75rem', left: '2rem', 
                        backgroundColor: RED, color: '#fff', 
                        padding: '0.3rem 1rem', fontSize: '0.55rem', 
                        fontFamily: 'var(--font-mono)', fontWeight: 900,
                        borderRadius: '100px', letterSpacing: '0.1em'
                    }}>SOURCE_CONTEXT</div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide subject matter or creative direction..."
                        rows={5}
                        style={{
                            width: '100%', padding: '0', backgroundColor: 'transparent',
                            border: 'none', color: '#fff',
                            fontFamily: 'Playfair Display', fontSize: '1.75rem', fontStyle: 'italic',
                            resize: 'none', outline: 'none', lineHeight: 1.4,
                            opacity: 0.9
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {TONES.map(t => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                style={{
                                    padding: '0.6rem 1.25rem', border: 'none',
                                    borderRadius: '100px',
                                    backgroundColor: tone === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: tone === t ? '#fff' : 'rgba(255,255,255,0.4)',
                                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900,
                                    cursor: 'pointer', textTransform: 'uppercase',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button onClick={handleGenerate} disabled={isGenerating || !description.trim()} style={{
                        padding: '1rem 2.5rem', backgroundColor: (isGenerating || !description.trim()) ? 'rgba(255,255,255,0.05)' : RED,
                        color: '#fff', border: 'none', borderRadius: '100px',
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                        fontWeight: 900, cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        textTransform: 'uppercase',
                        boxShadow: (isGenerating || !description.trim()) ? 'none' : `0 10px 30px ${RED}44`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {isGenerating ? <><RefreshCw size={16} className="spin" /> [ PROCESSING ]</> : '[ INITIALIZE_GEN ]'}
                    </button>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {captions && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                            {captions.captions?.map((c, i) => {
                                const platform = PLATFORMS.find(p => p.id === c.platform) || PLATFORMS[0];
                                return (
                                    <div key={i} style={{ 
                                        borderRadius: '24px', 
                                        backgroundColor: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(20px)',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                                    }}>
                                        <div style={{
                                            padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'rgba(255,255,255,0.01)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <span style={{ color: platform.color }}>{platform.icon}</span>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>
                                                        {platform.name}
                                                    </span>
                                                </div>
                                                {c.psychology && (
                                                    <div style={{
                                                        padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255,255,255,0.05)',
                                                        color: 'var(--color-accent)', fontSize: '0.55rem',
                                                        fontFamily: 'var(--font-mono)', fontWeight: 900,
                                                        letterSpacing: '0.05em', borderRadius: '4px'
                                                    }}>
                                                        {c.psychology.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => copyCaption(c.caption + (c.hashtags ? '\n\n' + c.hashtags : ''))}
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.05)', 
                                                    border: 'none', 
                                                    color: '#fff', 
                                                    cursor: 'pointer', 
                                                    padding: '0.4rem 0.8rem', 
                                                    fontSize: '0.6rem', 
                                                    fontFamily: 'var(--font-mono)', 
                                                    fontWeight: 900, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.4rem',
                                                    borderRadius: '100px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            >
                                                {copied === c.caption + (c.hashtags ? '\n\n' + c.hashtags : '') ? <Check size={12} /> : <Copy size={12} />}
                                                {copied === c.caption + (c.hashtags ? '\n\n' + c.hashtags : '') ? 'COPIED' : 'COPY'}
                                            </button>
                                        </div>
                                        <div style={{ padding: '2.5rem' }}>
                                            <p style={{ fontSize: '1.15rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', color: '#fff', fontWeight: 500, opacity: 0.9 }}>{c.caption}</p>
                                            {c.hashtags && (
                                                <p style={{ fontSize: '0.8rem', color: RED, marginTop: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.05em' }}>{c.hashtags}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </main>
    );
};

export default CaptionWriterPage;
