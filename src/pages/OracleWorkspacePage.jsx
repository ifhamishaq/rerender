import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, MessageSquare, Trash2, Zap, Send, 
    Image as ImageIcon, RefreshCw, Target, Search, Maximize2
} from 'lucide-react';
import { useOracle } from '../context/OracleContext';
import { useAuth } from '../context/AuthContext';
import LabPill from '../components/LabPill';

// --- Components ---

const TypewriterText = ({ text }) => {
    const [display, setDisplay] = useState('');
    useEffect(() => {
        let i = 0;
        setDisplay('');
        const interval = setInterval(() => {
            setDisplay(text.substring(0, i));
            i++;
            if (i > text.length) clearInterval(interval);
        }, 15); // Fast typing
        return () => clearInterval(interval);
    }, [text]);
    return <span>{display}</span>;
};

const StoryboardCard = ({ scenes, projectTitle }) => {
    const exportPdf = () => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>STORYBOARD: ${projectTitle}</title>
                    <style>
                        body { font-family: -apple-system, sans-serif; padding: 40px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                        .scene { border: 1px solid #ccc; padding: 20px; border-radius: 12px; }
                        img { width: 100%; border-radius: 8px; margin-bottom: 10px; }
                        .meta { font-family: monospace; font-size: 11px; opacity: 0.6; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <h2>${projectTitle}</h2>
                    <button class="no-print" onclick="window.print()">PRINT</button>
                    <div class="grid">
                        ${scenes.map(s => `
                            <div class="scene">
                                ${s.imageUrl ? `<img src="${s.imageUrl}" />` : '<div style="height:200px;background:#eee;"></div>'}
                                <div class="meta">CAM: ${s.camera} // EMO: ${s.emotion}</div>
                                <p>${s.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--color-border)', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>🎬 VISUAL STORYBOARD ({scenes.length} SCENES)</div>
                <button onClick={exportPdf} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Maximize2 size={12} /> EXPORT
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {scenes.map((s, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                        {s.imageUrl ? (
                            <img src={s.imageUrl} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                        ) : (
                            <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', fontSize: '0.6rem' }}>PENDING...</div>
                        )}
                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginBottom: '0.25rem' }}>{s.camera} // {s.emotion}</div>
                        <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{s.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalysisCard = ({ analysis, imageUrl }) => (
    <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <img src={imageUrl} style={{ width: '150px', borderRadius: '8px', objectFit: 'cover' }} />
        <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{analysis.grade} <span style={{ fontSize: '1rem', opacity: 0.5 }}>({analysis.ctr})</span></div>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{analysis.feedback}</div>
        </div>
    </div>
);

// --- Main Page ---

const OracleWorkspacePage = () => {
    const { 
        projects, currentProject, status, 
        createProject, loadProject, renameProject, deleteProject,
        chat, generateImage, analyzeImage,
        runStoryboardEngine, runShortFilmGenerator, runViralBreakdown, runNeuralLoop
    } = useOracle();
    const { user } = useAuth();
    
    const [inputText, setInputText] = useState('');
    const [activeForm, setActiveForm] = useState(null); // { type: 'short_film'|'storyboard'|'audit' }
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentProject?.messages, status.isTyping]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (activeForm) {
            if (activeForm.type === 'short_film') runShortFilmGenerator(inputText, 'cinematic', '60s');
            if (activeForm.type === 'storyboard') runStoryboardEngine(inputText);
            if (activeForm.type === 'audit') runViralBreakdown(inputText);
            setActiveForm(null);
        } else {
            chat(inputText);
        }
        setInputText('');
    };

    if (!user) {
        return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>🚨 LOGIN_REQUIRED</div>;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0a', color: '#fff', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            {/* SIDEBAR */}
            <aside style={{ width: '280px', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div style={{ padding: '1.5rem' }}>
                    <button onClick={() => createProject()} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 900, cursor: 'pointer' }}>
                        <Plus size={14} /> NEW_CHAT
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', fontWeight: 900, marginBottom: '1rem', paddingLeft: '0.5rem' }}>HISTORY</div>
                    {projects.map(p => (
                        <div key={p.id} onClick={() => loadProject(p)} style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', backgroundColor: currentProject?.id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <MessageSquare size={14} opacity={0.5} />
                            <span onDoubleClick={() => { const t = prompt("RENAME:", p.title); if(t) renameProject(p.id, t); }} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{p.title}</span>
                            {currentProject?.id === p.id && (
                                <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', opacity: 0.5 }}><Trash2 size={12} /></button>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* CHAT CANVAS */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {!currentProject ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <Zap size={40} color="var(--color-accent)" />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5 }}>SELECT_OR_CREATE_PROJECT</div>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 10%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {currentProject.messages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: m.role === 'user' ? '0 0 0 auto' : '0 auto' }}>
                                    {m.role === 'assistant' && (
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#fff', color: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Zap size={16} /></div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        {m.role === 'user' && <div style={{ fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5, textAlign: 'right' }}>YOU</div>}
                                        
                                        <div style={{ backgroundColor: m.role === 'user' ? 'rgba(255,255,255,0.05)' : 'transparent', padding: m.role === 'user' ? '1rem' : '0', borderRadius: '12px', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                            {/* TEXT */}
                                            {m.type === 'text' && (m.role === 'assistant' && i === currentProject.messages.length - 1 ? <TypewriterText text={m.content} /> : m.content)}
                                            
                                            {/* UPLOADED IMAGE */}
                                            {m.type === 'image_upload' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <img src={m.image} style={{ maxWidth: '300px', borderRadius: '8px' }} />
                                                    {m.content}
                                                </div>
                                            )}

                                            {/* GENERATED IMAGE */}
                                            {m.type === 'image' && (
                                                <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                                    <img src={m.url} style={{ maxWidth: '400px', borderRadius: '8px', marginBottom: '1rem' }} />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => analyzeImage(m.url)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-accent)', border: 'none', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>ANALYZE</button>
                                                        <button onClick={() => runNeuralLoop(m.content)} style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>NEURAL_LOOP</button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STORYBOARD */}
                                            {m.type === 'storyboard' && <StoryboardCard scenes={m.content} projectTitle={currentProject.title} />}

                                            {/* ANALYSIS */}
                                            {m.type === 'analysis' && <AnalysisCard analysis={m.content} imageUrl={m.imageUrl} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {status.isTyping && <div style={{ margin: '0 auto', width: '100%', maxWidth: '800px', display: 'flex', gap: '1.5rem' }}><div style={{ width: '32px', height: '32px', backgroundColor: '#fff', color: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={16} /></div><div style={{ opacity: 0.5, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RefreshCw size={14} className="spin" /> SYNTHESIZING...</div></div>}
                            <div ref={chatEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div style={{ padding: '2rem 10%', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                
                                {/* Smart Actions */}
                                {!activeForm && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        <LabPill onClick={() => setActiveForm({ type: 'short_film' })}><Target size={12} /> SHORT_FILM</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'storyboard' })}><MessageSquare size={12} /> STORYBOARD</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'audit' })}><Search size={12} /> VIRAL_AUDIT</LabPill>
                                    </div>
                                )}

                                {/* Inline Form Hint */}
                                {activeForm && (
                                    <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--color-accent)' }}>
                                            {activeForm.type === 'short_film' && "Enter a topic or idea for your short film..."}
                                            {activeForm.type === 'storyboard' && "Paste your script to generate a visual storyboard..."}
                                            {activeForm.type === 'audit' && "Paste a URL or topic for viral analysis..."}
                                        </span>
                                        <button onClick={() => setActiveForm(null)} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.5, cursor: 'pointer' }}>CANCEL</button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <input type="file" id="img-upload" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const r = new FileReader();
                                            r.onload = () => chat("Analyze this image.", r.result);
                                            r.readAsDataURL(file);
                                        }
                                    }} />
                                    <button onClick={() => document.getElementById('img-upload').click()} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.5, padding: '0.5rem', cursor: 'pointer' }}>
                                        <ImageIcon size={20} />
                                    </button>
                                    <textarea 
                                        value={inputText} onChange={e => setInputText(e.target.value)}
                                        onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        placeholder={activeForm ? "Type here..." : "Message Oracle..."}
                                        style={{ flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0.75rem 0', outline: 'none', resize: 'none', maxHeight: '150px', fontSize: '0.95rem' }}
                                    />
                                    <button onClick={handleSend} style={{ backgroundColor: '#fff', color: '#000', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default OracleWorkspacePage;
