import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Upload, Trash2, ArrowUp, Paperclip } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MODEL = 'openrouter/free';
const VISION_MODEL = 'openrouter/free';
const VISION_FAST_MODEL = 'openrouter/free';
const FALLBACK_MODEL = 'openrouter/free';

const OracleCore = ({
    mode = 'standard',
    context = '',
    initialMessage = "Hey! I'm **Oracle**, your creative AI assistant. How can I help you today?",
    onClose = null
}) => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const { isDarkMode } = useTheme();
    const storageKey = user ? `oracle_chat_${mode}_${user.id}` : `oracle_chat_${mode}_guest`;

    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage }];
        } catch { return [{ role: 'assistant', content: initialMessage }]; }
    });

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [pendingImage, setPendingImage] = useState(null);
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch {}
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            });
        }
    }, [messages, isTyping, storageKey]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
        }
    }, [input]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPendingImage({ base64: reader.result, name: file.name });
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const clearChat = () => {
        setMessages([{ role: 'assistant', content: initialMessage }]);
        try { localStorage.removeItem(storageKey); } catch {}
    };

    const formatContent = (text) => {
        if (!text) return '';
        let s = text.replace(/—/g, '-');
        s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/^### (.*$)/gm, '<h4 style="margin:1em 0 0.3em;font-size:0.9rem">$1</h4>');
        s = s.replace(/^## (.*$)/gm, '<h3 style="margin:1.2em 0 0.4em;font-size:1rem">$1</h3>');
        s = s.replace(/^[\s]*[-*][\s]+(.*)/gm, '<div style="display:flex;gap:6px;margin:2px 0;padding-left:2px"><span style="opacity:0.3">•</span><span>$1</span></div>');
        s = s.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:var(--color-accent);text-decoration:underline" target="_blank">$1</a>');
        return s;
    };

    const handleSend = async (prefill) => {
        const text = prefill || input;
        const hasImage = !!pendingImage;
        if (!text.trim() && !hasImage) return;
        if (isTyping) return;

        if (!user) {
            setMessages(p => [...p, { role: 'assistant', content: "Please **log in** to chat with Oracle." }]);
            setIsAuthModalOpen(true);
            return;
        }

        const success = await spendCredits(AI_COSTS.ORACLE, 'ORACLE');
        if (!success) {
            setMessages(p => [...p, { role: 'assistant', content: "Not enough credits." }]);
            return;
        }

        const userMsg = { role: 'user', content: text || 'Analyze this image', image: hasImage ? pendingImage.base64 : null };
        setMessages(p => [...p, userMsg]);
        setInput('');
        const img = pendingImage;
        setPendingImage(null);
        setIsTyping(true);

        try {
            const sys = `You are Oracle, a creative AI assistant by Ifham at RE-RENDER.
Help with creative ideas, thumbnails, videos, content strategy.
Be concise, professional, friendly. Use **bold** for key points. Never use em-dashes.
Links: Work /work, About /about, Contact /get-in-touch, Tools /tools`;

            const apiMsgs = hasImage
                ? [{ role: 'system', content: sys }, { role: 'user', content: [{ type: 'text', text: text || 'Analyze this image.' }, { type: 'image_url', image_url: { url: img.base64 } }] }]
                : [{ role: 'system', content: sys }, ...messages.filter(m => !m.image).slice(-6).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }];

            let data;
            try {
                data = await fetchOpenRouter({ model: hasImage ? VISION_FAST_MODEL : MODEL, messages: apiMsgs, temperature: 0.7 });
            } catch {
                data = await fetchOpenRouter({ model: hasImage ? VISION_MODEL : FALLBACK_MODEL, messages: apiMsgs, temperature: 0.7 });
            }

            setMessages(p => [...p, { role: 'assistant', content: data.choices?.[0]?.message?.content || "I couldn't generate a response. Try again." }]);
        } catch {
            setMessages(p => [...p, { role: 'assistant', content: "Something went wrong. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const canSend = input.trim() || pendingImage;

    return (
        <div className="oracle-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', fontFamily: 'Inter, -apple-system, sans-serif', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <style>{`
                .oracle-root * { box-sizing: border-box; }
                .oracle-msgs::-webkit-scrollbar { width: 0; }
                .oracle-msgs { scrollbar-width: none; }
                .oracle-bubble { animation: oFadeIn 0.25s ease-out; }
                @keyframes oFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes oPulse { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }
                .oracle-input-container {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                    padding: 8px 8px 8px 14px;
                    border-radius: 22px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    background-color: rgba(0, 0, 0, 0.02);
                    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                }
                body.dark-mode .oracle-input-container {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background-color: rgba(255, 255, 255, 0.03);
                }
                .oracle-input-container:focus-within {
                    border-color: #22c55e !important;
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.45);
                    background-color: rgba(0, 0, 0, 0.03);
                }
                body.dark-mode .oracle-input-container:focus-within {
                    background-color: rgba(255, 255, 255, 0.05);
                }
                .oracle-input {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    outline: none !important;
                }
                .oracle-input:focus {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    outline: none !important;
                }
                .oracle-input::placeholder { color: var(--color-text); opacity: 0.3; }
                .oracle-action:hover { background: var(--color-text) !important; color: var(--color-bg) !important; }
            `}</style>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Oracle</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={clearChat} title="New chat" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', color: 'var(--color-text)', opacity: 0.25 }}>
                        <Trash2 size={14} />
                    </button>
                    {onClose && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', color: 'var(--color-text)', opacity: 0.35 }}>
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Messages ── */}
            <div ref={scrollRef} className="oracle-msgs" data-lenis-prevent="true" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
                {messages.map((m, i) => (
                    <div key={i} className="oracle-bubble" style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
                        {/* Label */}
                        <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.3, paddingLeft: m.role === 'user' ? 0 : 2, paddingRight: m.role === 'user' ? 2 : 0 }}>
                            {m.role === 'user' ? 'You' : 'Oracle'}
                        </span>

                        {/* Image */}
                        {m.image && <img src={m.image} alt="" style={{ maxWidth: 180, borderRadius: 12, border: '1px solid var(--color-border)' }} />}

                        {/* Bubble */}
                        <div style={{
                            maxWidth: '88%',
                            padding: '10px 14px',
                            borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            backgroundColor: m.role === 'user'
                                ? (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                : 'transparent',
                            border: m.role === 'user' ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            fontSize: 14, lineHeight: 1.65, wordBreak: 'break-word'
                        }} dangerouslySetInnerHTML={{ __html: formatContent(m.content) }} />
                    </div>
                ))}

                {/* Typing dots */}
                {isTyping && (
                    <div className="oracle-bubble" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.3, paddingLeft: 2 }}>Oracle</span>
                        <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', gap: 5 }}>
                            {[0, 1, 2].map(d => (
                                <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text)', opacity: 0.2, animation: `oPulse 1.4s ease-in-out ${d * 0.2}s infinite` }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Input ── */}
            <div style={{ padding: '12px 16px 16px', flexShrink: 0 }}>
                {/* Pending image */}
                <AnimatePresence>
                    {pendingImage && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 8, overflow: 'hidden' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                                <img src={pendingImage.base64} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} />
                                <span style={{ fontSize: 12, opacity: 0.5, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingImage.name}</span>
                                <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.4, color: 'var(--color-text)' }}><X size={12} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input bar */}
                <div className="oracle-input-container">
                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', display: 'flex', color: 'var(--color-text)', opacity: 0.3, flexShrink: 0, marginBottom: 2 }}>
                        <Paperclip size={16} />
                    </button>
                    <textarea
                        ref={textareaRef}
                        className="oracle-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Message Oracle..."
                        rows={1}
                        style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--color-text)', fontSize: 14, lineHeight: '24px', resize: 'none', padding: 0, fontFamily: 'inherit', maxHeight: 140 }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isTyping || !canSend}
                        style={{
                            width: 30, height: 30, borderRadius: '50%', border: 'none', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: canSend ? 'var(--color-text)' : 'transparent',
                            color: canSend ? 'var(--color-bg)' : 'var(--color-text)',
                            opacity: canSend ? 1 : 0.15,
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowUp size={16} strokeWidth={2.5} />
                    </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
        </div>
    );
};

export default OracleCore;
