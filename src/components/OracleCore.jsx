import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, RefreshCw, User, Bot, X, Target, Palette, FileText, Zap, Image as ImageIcon, Wand2, Upload } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LabPill from './LabPill';

const MODEL = 'google/gemma-4-31b:free';
const VISION_MODEL = 'google/gemma-4-26b-a4b:free';
const FALLBACK_MODEL = 'tencent/hy3-preview:free';

// Mode-specific use-case templates
const USE_CASE_SETS = {
    standard: [
        { id: 'hook', label: 'GENERATE HOOK', icon: <Target size={14} />, prompt: "Generate 3 high-impact 'scroll-stopping' hooks for a TikTok/Reel about: " },
        { id: 'aesthetic', label: 'AESTHETIC STAR', icon: <Palette size={14} />, prompt: "Give me an 'Aesthetic North Star' (3 words), Hex codes, and font pairings for this 'vibe': " },
        { id: 'script', label: 'SCRIPT DOCTOR', icon: <FileText size={14} />, prompt: "Turn this rough idea into a high-paced, RE-RENDER style short-form script: " },
        { id: 'critique', label: 'BRUTAL CRITIQUE', icon: <Zap size={14} />, prompt: "Give me a 'Brutal Agency Critique' of this creative concept to make it world-class: " }
    ],
    wallpaper: [
        { id: 'cinematic', label: 'CINEMATIC PROMPT', icon: <ImageIcon size={14} />, prompt: "Generate a cinematic wallpaper prompt with dramatic lighting and depth for the theme: " },
        { id: 'abstract', label: 'ABSTRACT ART', icon: <Wand2 size={14} />, prompt: "Create an abstract digital art prompt with bold geometric shapes and neon accents for: " },
        { id: 'brutalist', label: 'BRUTALIST STYLE', icon: <Zap size={14} />, prompt: "Design a digital brutalist wallpaper prompt with raw textures, concrete, and electric lime for: " },
        { id: 'nature', label: 'NATURE + TECH', icon: <Palette size={14} />, prompt: "Create a wallpaper prompt that blends organic nature with futuristic technology for: " }
    ],
    global: []
};

const OracleCore = ({
    mode = 'standard',
    context = '',
    initialMessage = "ORACLE_ONLINE. How shall we re-render your vision today?",
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
    const useCases = USE_CASE_SETS[mode] || [];

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
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping, storageKey]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const formatContent = (content) => {
        if (!content) return '';
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-accent); font-weight: 900;">$1</strong>');
        formatted = formatted.replace(/^### (.*$)/gm, '<h3 style="color: var(--color-accent); font-size: 0.9rem; margin-top: 1.5rem; margin-bottom: 0.5rem; font-family: var(--font-mono); letter-spacing: 0.1em; font-weight: 900;">$1</h3>');
        formatted = formatted.replace(/^## (.*$)/gm, '<h2 style="color: var(--color-text); font-size: 1.1rem; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.25rem; font-weight: 900;">$1</h2>');
        formatted = formatted.replace(/^[\s]*[-*][\s]+(.*)/gm, '<div style="display: flex; gap: 0.75rem; margin-bottom: 0.5rem; padding-left: 0.5rem;"><span style="color: var(--color-accent)">•</span><span>$1</span></div>');
        formatted = formatted.replace(/^---$/gm, '<div style="height: 1px; background: var(--color-border); margin: 2rem 0; opacity: 0.5;"></div>');
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: var(--color-accent); text-decoration: underline; font-weight: 700;" target="_blank" rel="noopener noreferrer">$1</a>');
        return formatted;
    };

    const handleSendMessage = async (text) => {
        const messageText = text || input;
        const hasImage = !!pendingImage;

        if (!messageText.trim() && !hasImage) return;
        if (isTyping) return;

        if (!user) {
            setMessages(prev => [...prev, { role: 'assistant', content: "🚨 **ACCESS_DENIED**: You must be logged in to use the Oracle." }]);
            setIsAuthModalOpen(true);
            return;
        }

        if (!profile || profile.credits < AI_COSTS.ORACLE) {
            setMessages(prev => [...prev, { role: 'assistant', content: "📉 **OUT_OF_COMPUTE**: Insufficient credits." }]);
            return;
        }

        const success = await spendCredits(AI_COSTS.ORACLE, 'ORACLE_SUMMON');
        if (!success) return;

        const userMessage = {
            role: 'user',
            content: messageText || (hasImage ? '📸 Analyze this image' : ''),
            image: hasImage ? pendingImage.preview : null
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        const currentImage = pendingImage;
        setPendingImage(null);
        setIsTyping(true);

        try {
            const apiMessages = hasImage ? [
                { role: 'system', content: 'You are the RE-RENDER VISION ENGINE. Analyze the image and provide a creative breakdown.' },
                { role: 'user', content: [
                    { type: 'text', text: messageText || 'Analyze this image.' },
                    { type: 'image_url', image_url: { url: currentImage.base64 } }
                ]}
            ] : [
                { role: 'system', content: 'You are the RE-RENDER AESTHETIC ORACLE. Expert creative director.' },
                ...messages.filter(m => !m.image).slice(-5).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: messageText }
            ];

            const data = await fetchOpenRouter({
                model: hasImage ? VISION_MODEL : MODEL,
                messages: apiMessages,
                temperature: 0.7,
            }, { title: 'RE-RENDER Aesthetic Oracle' });

            const assistantMessage = data.choices?.[0]?.message?.content || 'EMPTY_RESPONSE';
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `SYSTEM_FAIL: ${error.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100%', width: '100%',
            fontFamily: 'var(--font-sans)', position: 'relative',
            backgroundColor: 'var(--color-bg)',
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem 2rem', 
                borderBottom: '1.5px solid var(--color-text)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-mono)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-accent)', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                        {mode.toUpperCase()}_UNIT // ACTIVE
                    </span>
                </div>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                )}
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.5rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                        <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: m.role === 'user' ? 'var(--color-border)' : 'var(--color-text)', color: m.role === 'user' ? 'var(--color-text)' : 'var(--color-bg)', borderRadius: '4px' }}>
                            {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div style={{ flex: 1, maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>
                                {m.role === 'user' ? 'CLIENT_NODE' : 'ORACLE_CORE'}
                            </div>
                            {m.image && <img src={m.image} alt="Uploaded" style={{ maxWidth: '250px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--color-border)' }} />}
                            <div style={{
                                backgroundColor: m.role === 'user' ? 'rgba(0,0,0,0.02)' : 'transparent',
                                padding: '1rem',
                                border: m.role === 'user' ? '1px solid var(--color-border)' : 'none',
                                fontSize: '0.95rem',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap'
                            }} dangerouslySetInnerHTML={{ __html: formatContent(m.content) }} />
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900 }}>
                        <RefreshCw size={12} className="spin" /> SYNTHESIZING...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '2rem', borderTop: '1.5px solid var(--color-text)' }}>
                {useCases.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {useCases.map(uc => (
                            <LabPill key={uc.id} onClick={() => setInput(uc.prompt)}>{uc.label}</LabPill>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="INPUT_DIRECTIVE..."
                        style={{
                            flex: 1, backgroundColor: 'transparent', border: '1.5px solid var(--color-text)',
                            padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none', resize: 'none',
                            maxHeight: '150px'
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: '1.5px solid var(--color-text)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Upload size={18} />
                        </button>
                        <button onClick={() => handleSendMessage()} style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Send size={18} />
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default OracleCore;
