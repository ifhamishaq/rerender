import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, MessageSquare, Trash2, Zap, Send, 
    Image as ImageIcon, RefreshCw, Target, Search, Maximize2,
    Type, FileText, Briefcase, Calendar, FileDown, Edit3
} from 'lucide-react';
import { useOracle } from '../context/OracleContext';
import { useAuth } from '../context/AuthContext';
import LabPill from '../components/LabPill';

// --- Components ---

const MarkdownText = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: 'var(--color-accent)', fontWeight: 900 }}>{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

const seenTexts = new Set();

const TypewriterText = ({ text }) => {
    const [display, setDisplay] = useState(seenTexts.has(text) ? text : '');
    
    useEffect(() => {
        if (seenTexts.has(text)) {
            setDisplay(text);
            return;
        }
        
        let i = 0;
        const interval = setInterval(() => {
            i += 4; // Much faster typing (4 chars per tick)
            if (i >= text.length) {
                setDisplay(text);
                seenTexts.add(text);
                clearInterval(interval);
            } else {
                setDisplay(text.substring(0, i));
            }
        }, 10); 
        return () => clearInterval(interval);
    }, [text]);
    
    return <MarkdownText text={display} />;
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
            <div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 900, marginBottom: '0.25rem' }}>DESKTOP</div>
                <img src={imageUrl} style={{ width: '200px', borderRadius: '8px', objectFit: 'cover' }} />
            </div>
            <div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 900, marginBottom: '0.25rem' }}>MOBILE (120px)</div>
                <img src={imageUrl} style={{ width: '120px', borderRadius: '4px', objectFit: 'cover' }} />
            </div>
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{analysis.grade} <span style={{ fontSize: '1rem', opacity: 0.5 }}>({analysis.estimated_ctr})</span></div>
            
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900, marginBottom: '0.25rem' }}>FIRST IMPRESSION</div>
                <div style={{ fontSize: '0.85rem' }}>{analysis.first_impression}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900, marginBottom: '0.25rem' }}>EMOTIONAL RESPONSE</div>
                <div style={{ fontSize: '0.85rem' }}>{analysis.emotional_response}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 900, marginBottom: '0.25rem' }}>STRENGTHS</div>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem' }}>
                        {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#ff4444', fontWeight: 900, marginBottom: '0.25rem' }}>CRITICAL FIXES</div>
                    <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem' }}>
                        {analysis.critical_fixes?.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', fontWeight: 900, marginBottom: '0.25rem' }}>NEURAL PROMPT</div>
                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.7 }}>{analysis.neural_prompt}</div>
            </div>
        </div>
    </div>
);

// --- Sequential Guided Forms ---

const FORMS = {
    short_film: { steps: ["What is the core premise or idea for the film?", "What is the visual style? (e.g., Cyberpunk, Cinematic)", "What is the target duration? (e.g., 60 seconds)"] },
    storyboard: { steps: ["Paste your script to generate a visual storyboard..."] },
    audit: { steps: ["Paste a URL or topic for viral analysis..."] },
    rewriter: { steps: ["Paste a hook, title, or topic to optimize & rewrite..."] },
    proposal: { steps: ["What specific service are you proposing?", "What is the client's industry or niche?", "What is your target project rate ($)?"] },
    calendar: { steps: ["What is your channel's core niche?", "Roughly how many subscribers do you have?", "What is your main goal? (e.g., Growth, Monetization)"] },
    brief: { steps: ["Paste the messy client message to extract a clean brief..."] }
};

// --- Main Page ---

const OracleWorkspacePage = () => {
    const { 
        projects, currentProject, status, 
        createProject, loadProject, renameProject, deleteProject,
        chat, generateImage, analyzeImage,
        runStoryboardEngine, runShortFilmGenerator, runViralBreakdown, runNeuralLoop,
        runRewriter, runProposalGenerator, runContentCalendar, runBriefExtractor
    } = useOracle();
    const { user } = useAuth();
    
    const [inputText, setInputText] = useState('');
    const [activeForm, setActiveForm] = useState(null); // { type: 'short_film'|'storyboard'|'audit' }
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [pendingImage, setPendingImage] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentProject?.messages, status.isTyping]);

    const handleSend = () => {
        if (!inputText.trim() && !pendingImage) return;
        
        if (activeForm) {
            const currentForm = FORMS[activeForm.type];
            const newAnswers = [...(activeForm.answers || []), inputText.trim()];
            
            if (newAnswers.length < currentForm.steps.length) {
                setActiveForm({ ...activeForm, stepIndex: (activeForm.stepIndex || 0) + 1, answers: newAnswers });
                setInputText('');
                return; // Wait for next step
            }

            // All steps complete, trigger generation
            const finalAnswers = newAnswers;
            
            if (activeForm.type === 'short_film') runShortFilmGenerator(finalAnswers[0], finalAnswers[1], finalAnswers[2]);
            if (activeForm.type === 'storyboard') runStoryboardEngine(finalAnswers[0]);
            if (activeForm.type === 'audit') runViralBreakdown(finalAnswers[0]);
            if (activeForm.type === 'rewriter') runRewriter(finalAnswers[0]);
            if (activeForm.type === 'proposal') runProposalGenerator(`Service: ${finalAnswers[0]}, Niche: ${finalAnswers[1]}, Rate: ${finalAnswers[2]}`);
            if (activeForm.type === 'calendar') runContentCalendar(`Niche: ${finalAnswers[0]}, Size: ${finalAnswers[1]}, Goals: ${finalAnswers[2]}`);
            if (activeForm.type === 'brief') runBriefExtractor(finalAnswers[0]);
            
            setActiveForm(null);
        } else {
            chat(inputText || "Analyze this image.", pendingImage);
        }
        setInputText('');
        setPendingImage(null);
    };

    if (!user) {
        return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>🚨 LOGIN_REQUIRED</div>;
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 28px)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }}>
            {/* SIDEBAR */}
            <aside style={{ width: '280px', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div style={{ padding: '1.5rem' }}>
                    <button onClick={() => createProject()} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 900, cursor: 'pointer' }}>
                        <Plus size={14} /> NEW_CHAT
                    </button>
                </div>
                <div data-lenis-prevent="true" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', fontWeight: 900, marginBottom: '1rem', paddingLeft: '0.5rem' }}>HISTORY</div>
                    {projects.map(p => (
                        <div key={p.id} onClick={() => { if(editingProjectId !== p.id) loadProject(p); }} style={{ padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', backgroundColor: currentProject?.id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <MessageSquare size={14} opacity={0.5} />
                            {editingProjectId === p.id ? (
                                <input 
                                    autoFocus
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={() => {
                                        if (editTitle.trim() && editTitle !== p.title) renameProject(p.id, editTitle.trim());
                                        setEditingProjectId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (editTitle.trim() && editTitle !== p.title) renameProject(p.id, editTitle.trim());
                                            setEditingProjectId(null);
                                        }
                                        if (e.key === 'Escape') setEditingProjectId(null);
                                    }}
                                    style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-accent)', color: 'var(--color-text)', fontSize: '0.8rem', padding: '0.25rem', borderRadius: '4px', outline: 'none' }}
                                />
                            ) : (
                                <span onDoubleClick={() => { setEditTitle(p.title); setEditingProjectId(p.id); }} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{p.title}</span>
                            )}
                            {currentProject?.id === p.id && editingProjectId !== p.id && (
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
                        <div data-lenis-prevent="true" style={{ flex: 1, overflowY: 'auto', padding: '2rem 10%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {currentProject.messages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: m.role === 'user' ? '0 0 0 auto' : '0 auto' }}>
                                    {m.role === 'assistant' && (
                                        <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Zap size={16} /></div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        {m.role === 'user' && <div style={{ fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5, textAlign: 'right' }}>YOU</div>}
                                        
                                        <div style={{ backgroundColor: m.role === 'user' ? 'rgba(255,255,255,0.05)' : 'transparent', padding: m.role === 'user' ? '1rem' : '0', borderRadius: '12px', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                            {/* TEXT */}
                                            {m.type === 'text' && (m.role === 'assistant' && m.isNew && i === currentProject.messages.length - 1 ? <TypewriterText text={m.content} /> : <MarkdownText text={m.content} />)}
                                            
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
                                                        <button onClick={() => runNeuralLoop(m.content)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', borderRadius: '4px', fontWeight: 900, cursor: 'pointer' }}>NEURAL_LOOP</button>
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
                            {status.isTyping && <div style={{ margin: '0 auto', width: '100%', maxWidth: '800px', display: 'flex', gap: '1.5rem' }}><div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={16} /></div><div style={{ opacity: 0.5, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RefreshCw size={14} className="spin" /> SYNTHESIZING...</div></div>}
                            <div ref={chatEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div style={{ padding: '2rem 10%', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                
                                {/* Smart Actions */}
                                {!activeForm && (
                                    <div data-lenis-prevent="true" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', whiteSpace: 'nowrap' }}>
                                        <LabPill onClick={() => setActiveForm({ type: 'short_film' })}><Target size={12} /> SHORT_FILM</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'storyboard' })}><ImageIcon size={12} /> STORYBOARD</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'audit' })}><Search size={12} /> VIRAL_AUDIT</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'rewriter' })}><Edit3 size={12} /> REWRITER</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'proposal' })}><Briefcase size={12} /> PROPOSAL</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'calendar' })}><Calendar size={12} /> CALENDAR</LabPill>
                                        <LabPill onClick={() => setActiveForm({ type: 'brief' })}><FileDown size={12} /> BRIEF_EXTRACTOR</LabPill>
                                    </div>
                                )}

                                {/* Inline Form Hint */}
                                {activeForm && (
                                    <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {FORMS[activeForm.type]?.steps?.length > 1 && (
                                                <span style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 900, fontSize: '0.7rem' }}>
                                                    STEP {(activeForm.stepIndex || 0) + 1}/{FORMS[activeForm.type].steps.length}
                                                </span>
                                            )}
                                            <span style={{ color: 'var(--color-accent)' }}>
                                                {FORMS[activeForm.type]?.steps[activeForm.stepIndex || 0]}
                                            </span>
                                        </div>
                                        <button onClick={() => setActiveForm(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.5, cursor: 'pointer' }}>CANCEL</button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <input type="file" id="img-upload" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const r = new FileReader();
                                            r.onload = () => setPendingImage(r.result);
                                            r.readAsDataURL(file);
                                        }
                                        e.target.value = null; // reset
                                    }} />
                                    <button onClick={() => document.getElementById('img-upload').click()} style={{ background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.5, padding: '0.5rem', cursor: 'pointer' }}>
                                        <ImageIcon size={20} />
                                    </button>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {pendingImage && (
                                            <div style={{ position: 'relative', width: 'fit-content', padding: '0.5rem 0' }}>
                                                <img src={pendingImage} style={{ height: '60px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                                                <button onClick={() => setPendingImage(null)} style={{ position: 'absolute', top: 0, right: '-10px', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                                            </div>
                                        )}
                                        <textarea 
                                            value={inputText} onChange={e => setInputText(e.target.value)}
                                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                            placeholder={activeForm ? "Type here..." : "Message Oracle..."}
                                            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--color-text)', padding: '0.75rem 0', outline: 'none', resize: 'none', maxHeight: '150px', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <button onClick={handleSend} style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '4px' }}>
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
