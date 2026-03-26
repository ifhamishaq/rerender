import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Instagram, Twitter, Video } from 'lucide-react';

import { fetchOpenRouter } from '../utils/ai';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'stepfun/step-3.5-flash:free';
const FALLBACK_MODEL = 'google/gemma-3-27b-it:free';

const PLATFORMS = [
    { id: 'instagram', name: 'INSTAGRAM', icon: <Instagram size={16} />, color: '#E1306C' },
    { id: 'tiktok', name: 'TIKTOK', icon: <Video size={16} />, color: '#00F2EA' },
    { id: 'x', name: 'X / TWITTER', icon: <Twitter size={16} />, color: '#1DA1F2' },
    { id: 'youtube', name: 'YOUTUBE', icon: <Video size={16} />, color: '#FF0000' },
    { id: 'linkedin', name: 'LINKEDIN', icon: <Twitter size={16} />, color: '#0077B5' },
    { id: 'facebook', name: 'FACEBOOK', icon: <Instagram size={16} />, color: '#1877F2' }
];

const CaptionWriterPage = () => {
    const [description, setDescription] = useState('');
    const [tone, setTone] = useState('professional');
    const [captions, setCaptions] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(null);

    const TONES = ['professional', 'casual', 'witty', 'inspirational', 'edgy', 'gen-z'];

    const handleGenerate = async () => {
        if (!description.trim() || isGenerating) return;
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
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) setCaptions(JSON.parse(jsonMatch[0]));
        } catch (err) {
            console.error('Caption generation failed:', err);
            alert("SYSTEM_OVERLOAD: AI nodes are currently congested. Please try again in 30 seconds.");
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
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: 'var(--nav-height)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
                <Link to="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: '3rem' }}>
                    <ArrowLeft size={14} /> BACK_TO_TOOLS
                </Link>

                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '1rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                        AI_TEXT // MULTI_PLATFORM
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>
                        CAPTION<br /><span style={{ color: 'var(--color-accent)' }}>WRITER</span>
                    </h1>
                </div>

                {/* Input */}
                <div style={{ marginBottom: '2rem' }}>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your post... (e.g., 'Launching our new brutalist website redesign for a tech startup')"
                        rows={4}
                        style={{
                            width: '100%', padding: '1.5rem', backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)', color: 'var(--color-text)',
                            fontFamily: 'var(--font-sans)', fontSize: '1rem', resize: 'none', outline: 'none'
                        }}
                    />
                </div>

                {/* Tone Selector */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {TONES.map(t => (
                        <button
                            key={t}
                            onClick={() => setTone(t)}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid',
                                borderColor: tone === t ? 'var(--color-accent)' : 'var(--color-border)',
                                backgroundColor: tone === t ? 'var(--color-accent)' : 'transparent',
                                color: tone === t ? '#000' : 'var(--color-text-secondary)',
                                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900,
                                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <button onClick={handleGenerate} disabled={isGenerating || !description.trim()} style={{
                    padding: '1rem 2.5rem', backgroundColor: (isGenerating || !description.trim()) ? 'var(--color-border)' : 'var(--color-accent)',
                    color: '#000', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    fontWeight: 900, cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '3rem'
                }}>
                    {isGenerating ? <><RefreshCw size={14} className="spin" /> GENERATING...</> : 'GENERATE_CAPTIONS'}
                </button>

                {/* Results */}
                {captions && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {captions.captions?.map((c, i) => {
                            const platform = PLATFORMS.find(p => p.id === c.platform) || PLATFORMS[0];
                            return (
                                <div key={i} style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                                    <div style={{
                                        padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-border)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        backgroundColor: 'rgba(255,255,255,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: platform.color }}>{platform.icon}</span>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                                                    {platform.name}
                                                </span>
                                            </div>
                                            {c.psychology && (
                                                <div style={{ 
                                                    padding: '0.1rem 0.5rem', border: '1px solid var(--color-accent)', 
                                                    color: 'var(--color-accent)', fontSize: '0.5rem', 
                                                    fontFamily: 'var(--font-mono)', fontWeight: 900,
                                                    letterSpacing: '0.05em', opacity: 0.8
                                                }}>
                                                    {c.psychology.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => copyCaption(c.caption + (c.hashtags ? '\n\n' + c.hashtags : ''))}
                                            style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.3rem 0.75rem', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            {copied === c.caption + (c.hashtags ? '\n\n' + c.hashtags : '') ? <><Check size={10} /> COPIED</> : <><Copy size={10} /> COPY</>}
                                        </button>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{c.caption}</p>
                                        {c.hashtags && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '1rem', opacity: 0.7 }}>{c.hashtags}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
            <style>{`.spin { animation: spin 1.5s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </main>
    );
};

export default CaptionWriterPage;
