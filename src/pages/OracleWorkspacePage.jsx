import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, MessageSquare, History, Trash2, Edit3, 
    Layout, BarChart3, Wand2, ChevronRight, Send, 
    Image as ImageIcon, Zap, Target, RefreshCw, 
    MoreHorizontal, Maximize2, Download, Search
} from 'lucide-react';
import { useOracle } from '../context/OracleContext';
import { useAuth } from '../context/AuthContext';
import LabPill from '../components/LabPill';

const OracleWorkspacePage = () => {
    const { 
        projects, currentProject, activeAsset, rightPanelTab, status, error,
        setRightPanelTab, setActiveAsset, createProject, loadProject, chat, generateImage, analyzeAsset,
        runNeuralLoop, runViralBreakdown, deleteAsset, downloadAsset
    } = useOracle();
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentProject?.messages, status.isTyping]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        chat(inputText);
        setInputText('');
    };

    if (!user) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
                🚨 [AUTH_REQUIRED] PLEASE_LOGIN_TO_ACCESS_WORKSPACE
            </div>
        );
    }

    return (
        <div style={{ 
            display: 'flex', 
            height: 'calc(100vh - 28px)', // Full height minus Mac bar
            backgroundColor: 'var(--color-bg)',
            overflow: 'hidden',
            position: 'fixed',
            top: '28px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000 // Ensure it covers everything
        }}>
            {/* LEFT SIDEBAR: Project Navigator */}
            <aside style={{ 
                width: '280px', 
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255,255,255,0.01)'
            }}>
                <div style={{ padding: '1.5rem' }}>
                    <button 
                        onClick={() => createProject()}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            border: 'none',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={14} /> NEW_PROJECT
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', fontWeight: 900, marginBottom: '1rem', paddingLeft: '0.5rem' }}>HISTORY</div>
                    {projects.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => loadProject(p)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: currentProject?.id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.25rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <MessageSquare size={14} opacity={0.5} />
                            <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.title}
                            </span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* CENTER: Chat Canvas */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {!currentProject ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <Zap size={40} color="var(--color-accent)" />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5 }}>SELECT_OR_CREATE_PROJECT_TO_BEGIN</div>
                    </div>
                ) : (
                    <>
                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {currentProject.messages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.5rem', maxWidth: '800px', margin: m.role === 'user' ? '0 0 0 auto' : '0' }}>
                                    {m.role === 'assistant' && (
                                        <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Zap size={16} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.55rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', opacity: 0.5, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                            {m.role === 'user' ? 'CLIENT_NODE' : 'ORACLE_CORE'}
                                        </div>
                                        <div style={{ 
                                            backgroundColor: m.role === 'user' ? 'rgba(0,0,0,0.02)' : 'transparent',
                                            border: m.role === 'user' ? '1px solid var(--color-border)' : 'none',
                                            padding: m.role === 'user' ? '1rem' : '0',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.6,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {m.image && (
                                                <img 
                                                    src={m.image} 
                                                    alt="Upload" 
                                                    style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--color-border)' }} 
                                                />
                                            )}
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {status.isTyping && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900 }}>
                                    <RefreshCw size={12} className="spin" /> SYNTHESIZING...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Smart Actions & Input */}
                        <div style={{ padding: '2rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <LabPill onClick={() => chat("Generate a high-performance thumbnail idea for this niche.")}>
                                    <Target size={12} /> IDEA_GEN
                                </LabPill>
                                {currentProject.messages.length > 2 && (
                                    <LabPill onClick={() => generateImage("A high-fidelity thumbnail for " + currentProject.title)}>
                                        <ImageIcon size={12} /> GENERATE_ASSET
                                    </LabPill>
                                )}
                                {currentProject.assets?.length > 0 && (
                                    <LabPill onClick={() => runNeuralLoop(currentProject.assets[currentProject.assets.length - 1].prompt)}>
                                        <RefreshCw size={12} /> AUTO_OPTIMIZE (LOOP)
                                    </LabPill>
                                )}
                                <LabPill onClick={() => {
                                    const idea = prompt("Describe your short film idea (e.g. 'Ronaldo discipline'):");
                                    if (idea) runShortFilmGenerator(idea);
                                }}>
                                    <Zap size={12} /> SHORT_FILM
                                </LabPill>
                                <LabPill onClick={() => {
                                    const script = prompt("Paste your script for visual storyboard:");
                                    if (script) runStoryboardEngine(script);
                                }}>
                                    <MessageSquare size={12} /> STORYBOARD_GEN
                                </LabPill>
                                <LabPill onClick={() => {
                                    const url = prompt("Enter YouTube or Reel URL for audit:");
                                    if (url) runViralBreakdown(url);
                                }}>
                                    <Search size={12} /> VIRAL_AUDIT
                                </LabPill>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => document.getElementById('workspace-upload').click()}
                                        style={{ background: 'none', border: '1px solid var(--color-border)', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '8px' }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <input 
                                        id="workspace-upload"
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => chat("IMAGE_UPLOAD: " + file.name, reader.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }} 
                                        style={{ display: 'none' }} 
                                    />
                                </div>
                                <textarea 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder="INPUT_DIRECTIVE..."
                                    style={{
                                        flex: 1, backgroundColor: 'transparent', border: '1px solid var(--color-border)',
                                        padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none', resize: 'none',
                                        maxHeight: '120px', borderRadius: '8px'
                                    }}
                                />
                                <button 
                                    onClick={handleSend}
                                    style={{
                                        backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none',
                                        width: '45px', height: '45px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* RIGHT PANEL: Dynamic Inspector */}
            <aside style={{ 
                width: '400px', 
                borderLeft: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
                    {[
                        { id: 'sketchboard', icon: <Layout size={14} />, label: 'SKETCH' },
                        { id: 'analysis', icon: <BarChart3 size={14} />, label: 'NEURAL' },
                        { id: 'prompt', icon: <Wand2 size={14} />, label: 'LAB' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setRightPanelTab(tab.id)}
                            style={{
                                flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none',
                                color: rightPanelTab === tab.id ? 'var(--color-accent)' : 'var(--color-text)',
                                opacity: rightPanelTab === tab.id ? 1 : 0.5,
                                borderBottom: rightPanelTab === tab.id ? '2px solid var(--color-accent)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {rightPanelTab === 'sketchboard' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            {currentProject?.assets?.map(asset => (
                                <div 
                                    key={asset.id} 
                                    onClick={() => setActiveAsset(asset)}
                                    style={{ 
                                        borderRadius: '12px', overflow: 'hidden', border: activeAsset?.id === asset.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                        cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                                    }}
                                >
                                    <img src={asset.url} alt="Gen" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-accent)' }}>
                                                {asset.sceneData ? `SCENE_${asset.sceneData.id}` : (asset.grade ? `GRADE_${asset.grade}` : 'PENDING_AUDIT')}
                                            </div>
                                            {asset.sceneData && (
                                                <div style={{ fontSize: '0.6rem', opacity: 0.5, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {asset.sceneData.camera} // {asset.sceneData.emotion}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); downloadAsset(asset); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', opacity: 0.5 }}
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', opacity: 0.5, color: 'var(--color-accent)' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {status.isGenerating && (
                                <div style={{ aspectRatio: '16/9', borderRadius: '12px', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                                    <RefreshCw className="spin" opacity={0.3} />
                                </div>
                            )}
                            {(!currentProject?.assets?.length && !status.isGenerating) && (
                                <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                                    NO_ASSETS_GENERATED_YET
                                </div>
                            )}
                        </div>
                    )}

                    {rightPanelTab === 'analysis' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {!activeAsset ? (
                                <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>SELECT_ASSET_TO_ANALYZE</div>
                            ) : (
                                <>
                                    <img src={activeAsset.url} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--color-border)' }} />
                                    {activeAsset.sceneData ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                                <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginBottom: '0.5rem' }}>SCENE_DESCRIPTION</div>
                                                <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{activeAsset.sceneData.description}</div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.01)', borderRadius: '8px' }}>
                                                    <div style={{ fontSize: '0.5rem', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>CAMERA</div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>{activeAsset.sceneData.camera}</div>
                                                </div>
                                                <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.01)', borderRadius: '8px' }}>
                                                    <div style={{ fontSize: '0.5rem', fontFamily: 'var(--font-mono)', opacity: 0.5 }}>EMOTION</div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>{activeAsset.sceneData.emotion}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => analyzeAsset(activeAsset)}
                                                disabled={status.isAnalyzing}
                                                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}
                                            >
                                                {status.isAnalyzing ? 'RUNNING_AUDIT...' : 'RUN_NEURAL_AUDIT'}
                                            </button>
                                            {activeAsset.analysis && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                                                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginBottom: '0.5rem' }}>CTR_PROJECTION</div>
                                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-accent)' }}>{activeAsset.ctr}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, marginBottom: '0.5rem' }}>VERDICT</div>
                                                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{activeAsset.analysis.feedback || activeAsset.analysis.verdict}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {rightPanelTab === 'prompt' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {!activeAsset ? (
                                <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>SELECT_ASSET_TO_VIEW_METADATA</div>
                            ) : (
                                <>
                                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', opacity: 0.5, marginBottom: '0.75rem' }}>ENGINE_PROMPT</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8, fontStyle: 'italic' }}>"{activeAsset.prompt}"</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>METADATA</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ opacity: 0.5 }}>ID:</span>
                                            <span style={{ fontFamily: 'var(--font-mono)' }}>{activeAsset.id.slice(0, 8)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ opacity: 0.5 }}>TIMESTAMP:</span>
                                            <span>{new Date(activeAsset.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </aside>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default OracleWorkspacePage;
