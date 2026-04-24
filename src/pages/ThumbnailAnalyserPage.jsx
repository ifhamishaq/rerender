import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Zap, Download, BarChart3, ArrowLeft, Upload, RefreshCw, FileText, Cpu, X, Sparkles, Image as ImageIcon } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';
import LabPill from '../components/LabPill';

const VISION_MODEL = 'google/gemma-4-26b-a4b-it:free';
const VISION_FAST_MODEL = 'baidu/qianfan-ocr-fast:free';
const FALLBACK_MODEL = 'google/gemma-4-31b-it:free';

const ACCENT = 'var(--color-accent)';

const ThumbnailAnalyserPage = () => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageB, setImageB] = useState(null);
    const [previewB, setPreviewB] = useState(null);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isThermal, setIsThermal] = useState(false);
    const [error, setError] = useState(null);

    const fileRef = useRef(null);

    const handleUpload = (e, target = 'A') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (target === 'A') {
                setImage(reader.result);
                setPreview(reader.result);
            } else {
                setImageB(reader.result);
                setPreviewB(reader.result);
            }
            setAnalysis(null);
            setIsThermal(false);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!image || isAnalyzing) return;

        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!profile || profile.credits < AI_COSTS.ANALYSER) {
            setError("📉 OUT_OF_COMPUTE: Insufficient credits.");
            return;
        }

        const success = await spendCredits(AI_COSTS.ANALYSER, 'THUMBNAIL_ANALYSIS');
        if (!success) return;

        setIsAnalyzing(true);
        setAnalysis(null);
        setError(null);

        try {
            const systemPrompt = `You are the RE-RENDER Visual Strategist. Analyze thumbnails for CTR performance.
            JSON_SCHEMA: {
                "predictedCTR": "X.X%",
                "thumbnailGrade": "A+ | A | B | C | D",
                "verdict": "One-line brutal honest verdict",
                "metrics": { "contrast": 0-10, "faceDetails": 0-10, "textEmphasis": 0-10, "hook": 0-10 },
                "improvements": ["Step 1", "Step 2", "Step 3"],
                "heatmap": [ { "x": 0-100, "y": 0-100, "intensity": 0.1-1.0, "label": "string" } ]
            }`;

            const body = {
                model: VISION_FAST_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: [
                        { type: 'text', text: "Audit this thumbnail. Be extremely fast." },
                        { type: 'image_url', image_url: { url: image } }
                    ]}
                ],
                temperature: 0.3
            };

            let data;
            try {
                data = await fetchOpenRouter(body, { title: 'RE-RENDER Thumbnail Audit (Fast)' });
            } catch (err) {
                console.warn('[ANALYSER] Fast model failed, trying primary...', err);
                data = await fetchOpenRouter({ ...body, model: VISION_MODEL }, { title: 'RE-RENDER Thumbnail Audit' });
            }

            const parsed = safeParseJSON(data.choices?.[0]?.message?.content);
            if (parsed) {
                setAnalysis(parsed);
            } else {
                throw new Error("MALFORMED_RESPONSE");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const ThermalOverlay = ({ heatmap, active }) => {
        if (!active || !heatmap) return null;
        return (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
                {heatmap.map((point, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: '60px',
                        height: '60px',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(255,0,0,0.4) 0%, transparent 70%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        textShadow: '0 0 5px #000'
                    }}>
                        {point.label}
                    </div>
                ))}
            </div>
        );
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
                title="NEURAL" 
                subtitle="Analyser." 
                vol="01" 
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
                {/* Column 01: Visual Canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        backgroundColor: 'var(--color-surface)',
                        border: '2px solid var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                    }}>
                        {isAnalyzing ? (
                            <LabLoader label="NEURAL_SCAN_IN_PROGRESS" />
                        ) : preview ? (
                            <>
                                <img src={preview} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <ThermalOverlay heatmap={analysis?.heatmap} active={isThermal} />
                            </>
                        ) : (
                            <div onClick={() => fileRef.current?.click()} style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                                <ImageIcon size={48} opacity={0.2} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>UPLOAD_ASSET_FOR_AUDIT</span>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        padding: '1.5rem',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>ENGINE:</span> {VISION_MODEL.split('/')[1].toUpperCase()}<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>SCAN_MODE:</span> {isCompareMode ? 'BATTLE' : 'SINGLE'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>RE-RENDER_ID:</span> {analysis ? 'SCAN_SUCCESS' : 'NULL'}<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>TIMESTAMP:</span> {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#FF0000', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 900, border: '1px solid #FF0000', padding: '1rem' }}>
                            CRITICAL_ERROR: {error.toUpperCase()}
                        </div>
                    )}

                    {analysis && !isAnalyzing && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setIsThermal(!isThermal)} style={{ flex: 1, padding: '1rem', background: isThermal ? ACCENT : 'none', border: `1.5px solid ${ACCENT}`, color: isThermal ? '#000' : ACCENT, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>
                                    {isThermal ? 'DISABLE_HEAT_GRID' : 'ENABLE_HEAT_GRID'}
                                </button>
                                <button onClick={() => { setPreview(null); setAnalysis(null); }} style={{ padding: '1rem', background: 'none', border: '1.5px solid var(--color-text)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>
                                    RESET
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column 02: Controls & Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    
                    {analysis ? (
                        <>
                            {/* Dashboard */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>AUDIT_DASHBOARD</div>
                                <div style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-text)', padding: '2rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: ACCENT }}>{analysis.thumbnailGrade}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5 }}>PREDICTED_CTR</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{analysis.predictedCTR}</div>
                                    <p style={{ marginTop: '2rem', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>"{analysis.verdict}"</p>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>VISUAL_METRICS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(analysis.metrics || {}).map(([key, val]) => (
                                        <div key={key}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 900, marginBottom: '0.4rem' }}>
                                                <span>{key.toUpperCase()}</span>
                                                <span>{val}/10</span>
                                            </div>
                                            <div style={{ height: '4px', backgroundColor: 'var(--color-border)' }}>
                                                <div style={{ height: '100%', width: `${val * 10}%`, backgroundColor: ACCENT }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Improvements */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>SYNTHETIC_IMPROVEMENTS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {analysis.improvements?.map((imp, i) => (
                                        <div key={i} style={{ padding: '1rem', border: '1px solid var(--color-border)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                                            <span style={{ color: ACCENT, fontWeight: 900 }}>[{i+1}]</span> {imp}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>DIRECTIVE_COMMAND</div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !preview}
                                style={{
                                    width: '100%', padding: '1.5rem',
                                    backgroundColor: (isAnalyzing || !preview) ? 'var(--color-border)' : 'var(--color-text)',
                                    color: (isAnalyzing || !preview) ? 'var(--color-text-secondary)' : 'var(--color-bg)',
                                    border: 'none',
                                    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.9rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                    letterSpacing: '0.1em'
                                }}
                            >
                                {isAnalyzing ? <RefreshCw size={20} className="spin" /> : (
                                    <>
                                        <Eye size={18} />
                                        EXECUTE_AUDIT_SEQUENCE
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleUpload(e)} style={{ display: 'none' }} />
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ThumbnailAnalyserPage;
