import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, User, Bot, X, Target, Palette, FileText, Zap, Image as ImageIcon, Wand2, Upload, Trash2 } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';
const VISION_MODEL = 'nvidia/nemotron-3-nano-2-vl:free';
const VISION_FAST_MODEL = 'nvidia/nemotron-3-nano-2-vl:free';
const FALLBACK_MODEL = 'openai/gpt-oss-120b:free';

// Quick action templates per mode
const QUICK_ACTIONS = {
    standard: [
        { id: 'hook', label: 'Generate Hook', icon: <Target size={13} />, prompt: "Generate 3 high-impact 'scroll-stopping' hooks for a TikTok/Reel about: " },
        { id: 'aesthetic', label: 'Aesthetic Guide', icon: <Palette size={13} />, prompt: "Give me an 'Aesthetic North Star' (3 words), Hex codes, and font pairings for this 'vibe': " },
        { id: 'script', label: 'Script Doctor', icon: <FileText size={13} />, prompt: "Turn this rough idea into a high-paced, RE-RENDER style short-form script: " },
        { id: 'critique', label: 'Brutal Critique', icon: <Zap size={13} />, prompt: "Give me a 'Brutal Agency Critique' of this creative concept to make it world-class: " }
    ],
    wallpaper: [
        { id: 'cinematic', label: 'Cinematic', icon: <ImageIcon size={13} />, prompt: "Generate a cinematic wallpaper prompt with dramatic lighting and depth for the theme: " },
        { id: 'abstract', label: 'Abstract Art', icon: <Wand2 size={13} />, prompt: "Create an abstract digital art prompt with bold geometric shapes and neon accents for: " },
        { id: 'brutalist', label: 'Brutalist', icon: <Zap size={13} />, prompt: "Design a digital brutalist wallpaper prompt with raw textures, concrete, and electric lime for: " },
        { id: 'nature', label: 'Nature + Tech', icon: <Palette size={13} />, prompt: "Create a wallpaper prompt that blends organic nature with futuristic technology for: " }
    ],
    global: []
};

const OracleCore = ({
    mode = 'standard',
    context = '',
    initialMessage = "Hey! I'm Oracle, your creative AI assistant built by **Ifham**. How can I help you today?",
    onExecute = null,
    onClose = null
}) => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const { isDarkMode } = useTheme();
    const storageKey = user ? `oracle_chat_${mode}_${user.id}` : `oracle_chat_${mode}_guest`;

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage }];
    });

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [pendingImage, setPendingImage] = useState(null);
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const actions = QUICK_ACTIONS[mode] || [];

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setPendingImage({ base64: reader.result, preview: reader.result, name: file.name });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages));
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            });
        }
    }, [messages, isTyping, storageKey]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const clearChat = () => {
        setMessages([{ role: 'assistant', content: initialMessage }]);
        localStorage.removeItem(storageKey);
    };

    const formatContent = (content) => {
        if (!content) return '';
        let cleaned = content.replace(/—/g, '-');
        let formatted = cleaned.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-accent); font-weight: 700;">$1</strong>');
        formatted = formatted.replace(/^### (.*$)/gm, '<h3 style="color: var(--color-accent); font-size: 0.85rem; margin-top: 1.2rem; margin-bottom: 0.4rem; font-weight: 700;">$1</h3>');
        formatted = formatted.replace(/^## (.*$)/gm, '<h2 style="font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">$1</h2>');
        formatted = formatted.replace(/^[\s]*[-*][\s]+(.*)/gm, '<div style="display: flex; gap: 0.5rem; margin-bottom: 0.3rem; padding-left: 0.25rem;"><span style="color: var(--color-accent); flex-shrink: 0;">•</span><span>$1</span></div>');
        formatted = formatted.replace(/^---$/gm, '<div style="height: 1px; background: var(--color-border); margin: 1rem 0;"></div>');
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: var(--color-accent); text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>');
        return formatted;
    };

    const handleSendMessage = async (text) => {
        const messageText = text || input;
        const hasImage = !!pendingImage;

        if (!messageText.trim() && !hasImage) return;
        if (isTyping) return;

        if (!user) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Please **log in** to use Oracle." }]);
            setIsAuthModalOpen(true);
            return;
        }

        if (!profile || profile.credits < AI_COSTS.ORACLE) {
            setMessages(prev => [...prev, { role: 'assistant', content: "You're out of credits. Visit your **profile** to get more." }]);
            return;
        }

        const success = await spendCredits(AI_COSTS.ORACLE, 'ORACLE_SUMMON');
        if (!success) return;

        const userMessage = {
            role: 'user',
            content: messageText || (hasImage ? 'Analyze this image' : ''),
            image: hasImage ? pendingImage.preview : null
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        const currentImage = pendingImage;
        setPendingImage(null);
        setIsTyping(true);

        try {
            const systemPrompt = `You are Oracle, an AI creative assistant built by Ifham, founder of RE-RENDER.
Your job is to help users with creative ideas, thumbnails, videos, and content strategy.
Be professional but friendly. Give clear, actionable advice.
Use **bold text** to highlight important points.
Keep answers concise and well-structured.
NEVER use em-dashes.

SITEMAP: Home /, Our Work /work, About /about, Contact /get-in-touch, Caption Writer /lab/caption-writer, Thumbnail Analyser /lab/thumbnail-analyser, Wallpaper Lab /tools/wallpaper-lab

If user asks for help: Give value first, then suggest RE-RENDER services naturally.`;

            const apiMessages = hasImage ? [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: [
                    { type: 'text', text: messageText || 'Analyze this image.' },
                    { type: 'image_url', image_url: { url: currentImage.base64 } }
                ]}
            ] : [
                { role: 'system', content: systemPrompt },
                ...messages.filter(m => !m.image).slice(-5).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: messageText }
            ];

            let data;
            const modelToUse = hasImage ? VISION_FAST_MODEL : MODEL;

            try {
                data = await fetchOpenRouter({
                    model: modelToUse,
                    messages: apiMessages,
                    temperature: 0.7,
                });
            } catch (err) {
                data = await fetchOpenRouter({
                    model: hasImage ? VISION_MODEL : FALLBACK_MODEL,
                    messages: apiMessages,
                    temperature: 0.7,
                });
            }

            const assistantMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Something went wrong. Please try again.` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100%', width: '100%',
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--color-bg)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <style>{`
                .oracle-scrollbar::-webkit-scrollbar { width: 4px; }
                .oracle-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .oracle-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }
                .oracle-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.4); }
                .oracle-spin { animation: oracle-spin 1s linear infinite; }
                @keyframes oracle-spin { 100% { transform: rotate(360deg); } }
                .oracle-msg-enter { animation: oracle-fade-up 0.3s ease-out; }
                @keyframes oracle-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* ─── Header ─── */}
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0,
                backgroundColor: 'var(--color-bg)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-accent)', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        Oracle
                    </span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 500 }}>
                        {mode === 'global' ? `• ${context || 'Home'}` : '• AI Assistant'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                        onClick={clearChat} 
                        title="Clear chat"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, padding: '4px', display: 'flex', color: 'var(--color-text)' }}
                    >
                        <Trash2 size={14} />
                    </button>
                    {onClose && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: 'var(--color-text)', opacity: 0.5 }}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Messages ─── */}
            <div 
                ref={scrollRef} 
                className="oracle-scrollbar"
                style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    overflowX: 'hidden',
                    padding: '1.25rem',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.25rem',
                    minHeight: 0
                }}
            >
                {messages.map((m, i) => (
                    <div key={i} className="oracle-msg-enter" style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start'
                    }}>
                        {/* Avatar */}
                        <div style={{ 
                            width: '28px', height: '28px', flexShrink: 0, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            backgroundColor: m.role === 'user' ? 'var(--color-border)' : 'var(--color-accent)', 
                            color: m.role === 'user' ? 'var(--color-text)' : '#000', 
                            borderRadius: '50%'
                        }}>
                            {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                        </div>

                        {/* Message Bubble */}
                        <div style={{ 
                            flex: 1, maxWidth: '85%', 
                            display: 'flex', flexDirection: 'column', 
                            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' 
                        }}>
                            {m.image && (
                                <img src={m.image} alt="Uploaded" style={{ 
                                    maxWidth: '200px', borderRadius: '12px', marginBottom: '0.5rem', 
                                    border: '1px solid var(--color-border)' 
                                }} />
                            )}
                            <div style={{
                                backgroundColor: m.role === 'user' 
                                    ? 'var(--color-accent)' 
                                    : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                                color: m.role === 'user' ? '#000' : 'var(--color-text)',
                                padding: '0.75rem 1rem',
                                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }} dangerouslySetInnerHTML={{ __html: formatContent(m.content) }} />
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="oracle-msg-enter" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                            width: '28px', height: '28px', flexShrink: 0, display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', 
                            backgroundColor: 'var(--color-accent)', color: '#000', borderRadius: '50%' 
                        }}>
                            <Bot size={13} />
                        </div>
                        <div style={{ 
                            padding: '0.75rem 1rem', 
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            borderRadius: '16px 16px 16px 4px',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            fontSize: '0.8rem', opacity: 0.6
                        }}>
                            <RefreshCw size={12} className="oracle-spin" /> Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Input Area ─── */}
            <div style={{ 
                borderTop: '1px solid var(--color-border)', 
                padding: '1rem 1.25rem',
                flexShrink: 0,
                backgroundColor: 'var(--color-bg)'
            }}>
                {/* Quick Actions */}
                {actions.length > 0 && (
                    <div style={{ 
                        display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', 
                        overflowX: 'auto', paddingBottom: '0.25rem',
                        scrollbarWidth: 'none', msOverflowStyle: 'none'
                    }}>
                        {actions.map(a => (
                            <button 
                                key={a.id} 
                                onClick={() => setInput(a.prompt)}
                                style={{ 
                                    padding: '0.4rem 0.75rem', 
                                    borderRadius: '100px',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-text)',
                                    fontSize: '0.65rem', fontWeight: 600,
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {a.icon} {a.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Pending Image Preview */}
                {pendingImage && (
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        marginBottom: '0.5rem', padding: '0.5rem',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        borderRadius: '8px'
                    }}>
                        <img src={pendingImage.preview} alt="Preview" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, flex: 1 }}>{pendingImage.name}</span>
                        <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, display: 'flex', color: 'var(--color-text)' }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Input Row */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        style={{ 
                            background: 'none', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '10px',
                            width: '38px', height: '38px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer', color: 'var(--color-text)', opacity: 0.5,
                            transition: 'opacity 0.15s'
                        }}
                    >
                        <Upload size={15} />
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Ask Oracle anything..."
                        rows={1}
                        style={{
                            flex: 1, 
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            padding: '0.6rem 0.9rem', 
                            fontSize: '0.85rem', 
                            outline: 'none', 
                            resize: 'none',
                            color: 'var(--color-text)',
                            fontFamily: 'inherit',
                            lineHeight: 1.5,
                            maxHeight: '120px',
                            transition: 'border-color 0.15s'
                        }}
                    />
                    <button 
                        onClick={() => handleSendMessage()} 
                        disabled={isTyping || (!input.trim() && !pendingImage)}
                        style={{ 
                            background: 'var(--color-accent)', 
                            color: '#000', 
                            border: 'none', 
                            borderRadius: '10px',
                            width: '38px', height: '38px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer',
                            opacity: (isTyping || (!input.trim() && !pendingImage)) ? 0.4 : 1,
                            transition: 'opacity 0.15s'
                        }}
                    >
                        <Send size={15} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
            </div>
        </div>
    );
};

export default OracleCore;
