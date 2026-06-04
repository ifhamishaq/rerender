import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, MessageSquare, Trash2, Send, Image as ImageIcon, RefreshCw,
    Target, Search, Maximize2, FileText, Briefcase, Calendar, FileDown,
    Edit3, X, ArrowUp, Paperclip, Zap, ChevronLeft
} from 'lucide-react';
import { useOracle } from '../context/OracleContext';
import { useAuth } from '../context/AuthContext';

/* ── Markdown renderer ── */
const Md = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return <span>{parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
            ? <strong key={i} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
            : <span key={i}>{p}</span>
    )}</span>;
};

const seen = new Set();
const Typewriter = ({ text }) => {
    const [d, setD] = useState(seen.has(text) ? text : '');
    useEffect(() => {
        if (seen.has(text)) { setD(text); return; }
        let i = 0;
        const iv = setInterval(() => {
            i += 4;
            if (i >= text.length) { setD(text); seen.add(text); clearInterval(iv); }
            else setD(text.substring(0, i));
        }, 10);
        return () => clearInterval(iv);
    }, [text]);
    return <Md text={d} />;
};

/* ── Storyboard export ── */
const StoryboardCard = ({ scenes, title }) => {
    const exportPdf = () => {
        const w = window.open('', '_blank');
        w.document.write(`<html><head><title>${title}</title><style>body{font-family:-apple-system,sans-serif;padding:40px}.g{display:grid;grid-template-columns:1fr 1fr;gap:30px}.s{border:1px solid #ddd;padding:16px;border-radius:12px}img{width:100%;border-radius:8px;margin-bottom:8px}.m{font-size:11px;opacity:.5}@media print{.np{display:none}}</style></head><body><h2>${title}</h2><button class="np" onclick="window.print()">Print</button><div class="g">${scenes.map(s => `<div class="s">${s.imageUrl ? `<img src="${s.imageUrl}"/>` : '<div style="height:180px;background:#f0f0f0;border-radius:8px"></div>'}<div class="m">${s.camera} / ${s.emotion}</div><p>${s.description}</p></div>`).join('')}</div></body></html>`);
        w.document.close();
    };
    return (
        <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Storyboard — {scenes.length} scenes</span>
                <button onClick={exportPdf} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Maximize2 size={12} /> Export</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {scenes.map((s, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 10, padding: 10 }}>
                        {s.imageUrl ? <img src={s.imageUrl} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} /> : <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--color-border)', borderRadius: 6, marginBottom: 6 }} />}
                        <div style={{ fontSize: 11, opacity: .4, marginBottom: 2 }}>{s.camera} · {s.emotion}</div>
                        <div style={{ fontSize: 13, lineHeight: 1.4 }}>{s.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalysisCard = ({ analysis, imageUrl }) => (
    <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
                <img src={imageUrl} alt="" style={{ width: 180, borderRadius: 10 }} />
                <img src={imageUrl} alt="" style={{ width: 100, borderRadius: 6, marginTop: 8 }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>{analysis.grade} <span style={{ fontSize: 14, opacity: .4 }}>{analysis.estimated_ctr}</span></div>
                <p style={{ fontSize: 14, opacity: .7, margin: '8px 0 16px' }}>{analysis.first_impression}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 4 }}>Strengths</div><ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>{analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                    <div><div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Fixes</div><ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>{analysis.critical_fixes?.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
                </div>
            </div>
        </div>
    </div>
);

/* ── Forms config ── */
const FORMS = {
    short_film: { label: 'Short Film', icon: <Target size={14} />, cost: 5, steps: ["Core premise or idea?", "Visual style? (Cyberpunk, Cinematic, etc.)", "Target duration? (60s, 90s, etc.)"] },
    storyboard: { label: 'Storyboard', icon: <ImageIcon size={14} />, cost: 25, steps: ["Paste your script..."] },
    audit: { label: 'Viral Audit', icon: <Search size={14} />, cost: 5, steps: ["Paste a URL or topic..."] },
    rewriter: { label: 'Rewriter', icon: <Edit3 size={14} />, cost: 5, steps: ["Paste a hook or title to optimize..."] },
    proposal: { label: 'Proposal', icon: <Briefcase size={14} />, cost: 5, steps: ["Service you're proposing?", "Client's industry?", "Target rate ($)?"] },
    calendar: { label: 'Calendar', icon: <Calendar size={14} />, cost: 5, steps: ["Channel's core niche?", "Subscriber count?", "Main goal?"] },
    brief: { label: 'Brief Extractor', icon: <FileDown size={14} />, cost: 5, steps: ["Paste the client message..."] }
};

/* ── Main Page ── */
const OracleWorkspacePage = () => {
    const {
        projects, currentProject, status,
        createProject, loadProject, renameProject, deleteProject,
        chat, generateImage, analyzeImage,
        runStoryboardEngine, runShortFilmGenerator, runViralBreakdown, runNeuralLoop,
        runRewriter, runProposalGenerator, runContentCalendar, runBriefExtractor
    } = useOracle();
    const { user, profile } = useAuth();

    const [input, setInput] = useState('');
    const [activeForm, setActiveForm] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [pendingImage, setPendingImage] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const endRef = useRef(null);
    const taRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentProject?.messages, status.isTyping]);
    useEffect(() => {
        if (taRef.current) { taRef.current.style.height = '24px'; taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + 'px'; }
    }, [input]);

    const handleSend = () => {
        if (!input.trim() && !pendingImage) return;
        if (activeForm) {
            const form = FORMS[activeForm.type];
            const answers = [...(activeForm.answers || []), input.trim()];
            if (answers.length < form.steps.length) {
                setActiveForm({ ...activeForm, stepIndex: (activeForm.stepIndex || 0) + 1, answers });
                setInput(''); return;
            }
            const a = answers;
            if (activeForm.type === 'short_film') runShortFilmGenerator(a[0], a[1], a[2]);
            if (activeForm.type === 'storyboard') runStoryboardEngine(a[0]);
            if (activeForm.type === 'audit') runViralBreakdown(a[0]);
            if (activeForm.type === 'rewriter') runRewriter(a[0]);
            if (activeForm.type === 'proposal') runProposalGenerator(`Service: ${a[0]}, Niche: ${a[1]}, Rate: ${a[2]}`);
            if (activeForm.type === 'calendar') runContentCalendar(`Niche: ${a[0]}, Size: ${a[1]}, Goals: ${a[2]}`);
            if (activeForm.type === 'brief') runBriefExtractor(a[0]);
            setActiveForm(null);
        } else {
            chat(input || "Analyze this image.", pendingImage);
        }
        setInput(''); setPendingImage(null);
    };

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <Zap size={32} opacity={0.2} />
            <span style={{ fontSize: 14, opacity: 0.4 }}>Please log in to use Oracle</span>
        </div>
    );

    return (
        <div className="ow-root" style={{ display: 'flex', height: 'calc(100vh - 28px)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden', fontFamily: 'Inter,-apple-system,sans-serif' }}>
            <style>{`
                .ow-root *{box-sizing:border-box}
                .ow-sb::-webkit-scrollbar{width:0}.ow-sb{scrollbar-width:none}
                .ow-spin{animation:owSpin 1s linear infinite}
                @keyframes owSpin{to{transform:rotate(360deg)}}
                @keyframes owPulse{0%,80%,100%{opacity:.15}40%{opacity:.6}}
                .ow-bubble{animation:owFade .25s ease-out}
                @keyframes owFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
                .ow-input-container {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                    padding: 8px 8px 8px 14px;
                    border-radius: 22px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    background-color: rgba(0, 0, 0, 0.02);
                    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                }
                body.dark-mode .ow-input-container {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background-color: rgba(255, 255, 255, 0.03);
                }
                .ow-input-container:focus-within {
                    border-color: #22c55e !important;
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.45);
                    background-color: rgba(0, 0, 0, 0.03);
                }
                body.dark-mode .ow-input-container:focus-within {
                    background-color: rgba(255, 255, 255, 0.05);
                }
                .ow-input {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    outline: none !important;
                }
                .ow-input:focus {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    outline: none !important;
                }
                .ow-input::placeholder{color:var(--color-text);opacity:.3}
                .ow-pill{padding:6px 14px;border-radius:100px;border:1px solid var(--color-border);background:transparent;color:var(--color-text);font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;transition:all .15s}
                .ow-pill:hover{background:var(--color-text);color:var(--color-bg)}
                .ow-side-item{padding:10px 12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:2px;transition:background .1s;font-size:13px}
                .ow-side-item:hover{background:rgba(128,128,128,.08)}
            `}</style>

            {/* ── Sidebar ── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}
                    >
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                            <button onClick={() => createProject()} style={{ width: '100%', padding: '10px', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                                <Plus size={15} /> New Chat
                            </button>
                        </div>
                        <div className="ow-sb" data-lenis-prevent="true" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, opacity: .3, padding: '8px 12px', textTransform: 'uppercase' }}>History</div>
                            {projects.map(p => (
                                <div key={p.id} className="ow-side-item" onClick={() => { if (editId !== p.id) loadProject(p); }}
                                    style={{ background: currentProject?.id === p.id ? 'rgba(128,128,128,.1)' : undefined }}>
                                    <MessageSquare size={14} style={{ opacity: .35, flexShrink: 0 }} />
                                    {editId === p.id ? (
                                        <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                            onBlur={() => { if (editTitle.trim()) renameProject(p.id, editTitle.trim()); setEditId(null); }}
                                            onKeyDown={e => { if (e.key === 'Enter') { renameProject(p.id, editTitle.trim()); setEditId(null); } if (e.key === 'Escape') setEditId(null); }}
                                            style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13, padding: '2px 6px', borderRadius: 6, outline: 'none' }} />
                                    ) : (
                                        <span onDoubleClick={() => { setEditTitle(p.title); setEditId(p.id); }}
                                            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                                    )}
                                    {currentProject?.id === p.id && editId !== p.id && (
                                        <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', opacity: .25, padding: 2, display: 'flex' }}><Trash2 size={13} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', fontSize: 12, opacity: .35, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={12} /> {profile?.credits || 0} credits
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Main Chat ── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--color-text)', opacity: .4 }}>
                        <ChevronLeft size={18} style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform .2s' }} />
                    </button>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Oracle</span>
                    {currentProject && <span style={{ fontSize: 12, opacity: .3 }}>· {currentProject.title}</span>}
                </div>

                {!currentProject ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: .3 }}>
                        <Zap size={36} />
                        <span style={{ fontSize: 14 }}>Select or create a chat to start</span>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="ow-sb" data-lenis-prevent="true" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: 0 }}>
                            <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {currentProject.messages.map((m, i) => (
                                    <div key={i} className="ow-bubble" style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 500, opacity: .25, padding: '0 4px' }}>{m.role === 'user' ? 'You' : 'Oracle'}</span>
                                        <div style={{ maxWidth: '85%' }}>
                                            {m.type === 'text' && (
                                                <div style={{
                                                    padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    background: m.role === 'user' ? 'rgba(128,128,128,.08)' : 'transparent',
                                                    border: m.role === 'user' ? 'none' : '1px solid rgba(128,128,128,.08)',
                                                    fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                                }}>
                                                    {m.role === 'assistant' && m.isNew && i === currentProject.messages.length - 1
                                                        ? <Typewriter text={m.content} /> : <Md text={m.content} />}
                                                </div>
                                            )}
                                            {m.type === 'image_upload' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    <img src={m.image} alt="" style={{ maxWidth: 260, borderRadius: 12, border: '1px solid var(--color-border)' }} />
                                                    {m.content && <span style={{ fontSize: 14 }}>{m.content}</span>}
                                                </div>
                                            )}
                                            {m.type === 'image' && (
                                                <div style={{ padding: 12, background: 'var(--color-surface)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                                                    <img src={m.url} alt="" style={{ maxWidth: 360, borderRadius: 10, marginBottom: 10 }} />
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => analyzeImage(m.url)} className="ow-pill">Analyze</button>
                                                        <button onClick={() => runNeuralLoop(m.content)} className="ow-pill">Neural Loop</button>
                                                    </div>
                                                </div>
                                            )}
                                            {m.type === 'storyboard' && <StoryboardCard scenes={m.content} title={currentProject.title} />}
                                            {m.type === 'analysis' && <AnalysisCard analysis={m.content} imageUrl={m.imageUrl} />}
                                        </div>
                                    </div>
                                ))}
                                {status.isTyping && (
                                    <div className="ow-bubble" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 500, opacity: .25, padding: '0 4px' }}>Oracle</span>
                                        <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(128,128,128,.08)', display: 'flex', gap: 5 }}>
                                            {[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text)', animation: `owPulse 1.4s ease-in-out ${d * .2}s infinite` }} />)}
                                        </div>
                                    </div>
                                )}
                                <div ref={endRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 24px 20px', flexShrink: 0 }}>
                            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                                {/* Smart actions */}
                                {!activeForm && (
                                    <div className="ow-sb" style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
                                        {Object.entries(FORMS).map(([key, f]) => (
                                            <button key={key} className="ow-pill" onClick={() => setActiveForm({ type: key, stepIndex: 0, answers: [] })}>
                                                {f.icon} {f.label} <span style={{ opacity: .35, fontSize: 10 }}>⚡{f.cost}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {activeForm && (
                                    <div style={{ marginBottom: 8, padding: '8px 14px', background: 'rgba(128,128,128,.06)', borderRadius: 12, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ opacity: .7 }}>
                                            {FORMS[activeForm.type].steps.length > 1 && <span style={{ background: 'var(--color-accent)', color: '#000', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, marginRight: 8 }}>
                                                {(activeForm.stepIndex || 0) + 1}/{FORMS[activeForm.type].steps.length}
                                            </span>}
                                            {FORMS[activeForm.type].steps[activeForm.stepIndex || 0]}
                                        </span>
                                        <button onClick={() => setActiveForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .3, display: 'flex', color: 'var(--color-text)' }}><X size={14} /></button>
                                    </div>
                                )}
                                {pendingImage && (
                                    <div style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, background: 'rgba(128,128,128,.06)' }}>
                                        <img src={pendingImage} alt="" style={{ height: 40, borderRadius: 6 }} />
                                        <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .3, display: 'flex', color: 'var(--color-text)' }}><X size={12} /></button>
                                    </div>
                                )}
                                <div className="ow-input-container">
                                    <input type="file" id="ow-img" accept="image/*" style={{ display: 'none' }} onChange={e => {
                                        const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setPendingImage(r.result); r.readAsDataURL(f); } e.target.value = null;
                                    }} />
                                    <button onClick={() => document.getElementById('ow-img').click()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', display: 'flex', color: 'var(--color-text)', opacity: .3, flexShrink: 0, marginBottom: 2 }}>
                                        <Paperclip size={16} />
                                    </button>
                                    <textarea ref={taRef} className="ow-input" value={input} onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder={activeForm ? "Type here..." : "Message Oracle..."} rows={1}
                                        style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--color-text)', fontSize: 14, lineHeight: '24px', resize: 'none', padding: 0, fontFamily: 'inherit', maxHeight: 140 }} />
                                    <button onClick={handleSend} disabled={!input.trim() && !pendingImage}
                                        style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: (input.trim() || pendingImage) ? 'var(--color-text)' : 'transparent', color: (input.trim() || pendingImage) ? 'var(--color-bg)' : 'var(--color-text)',
                                            opacity: (input.trim() || pendingImage) ? 1 : .15, transition: 'all .2s' }}>
                                        <ArrowUp size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default OracleWorkspacePage;
