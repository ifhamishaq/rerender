import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Zap, Download, BarChart3, ArrowLeft, Upload, RefreshCw, FileText, Cpu, X, Sparkles, Image as ImageIcon, CheckCircle2, AlertTriangle, Palette, Layout } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';
import LabPill from '../components/LabPill';

const VISION_MODEL = 'baidu/qianfan-ocr-fast:free';
const VISION_FAST_MODEL = 'baidu/qianfan-ocr-fast:free';
const FALLBACK_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

const ACCENT = 'var(--color-accent)';

const ThumbnailAnalyserPage = () => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const fileRef = useRef(null);

    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
            setPreview(reader.result);
            setAnalysis(null);
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
            const systemPrompt = `You are NEURAL, a high-performance thumbnail analysis system built by Ifham at RE-RENDER.

Your job is to judge thumbnails based on ONE thing: Will people click this?
Do NOT think like a designer. Think like a YouTube viewer scrolling fast.

---
CORE RULES:
1. CLARITY FIRST: Can someone understand the thumbnail in less than 1 second?
2. CLICKABILITY: Does it create curiosity, emotion, or tension?
3. FOCUS: Is there one clear subject?
4. SMALL SIZE TEST: Would this still work when very small on mobile?
5. CONTRAST: Does the subject stand out clearly from the background?

---
HOW TO JUDGE:
Be honest and direct. Do not be polite if it's bad. Do not hype if it's average.
Explain WHY something works or fails.
Use simple English. Keep sentences short.
Highlight important points using **bold text**.
NEVER use em-dashes (—).

---
WHEN GIVING IMPROVEMENTS:
Do NOT give generic advice. Give specific, actionable fixes like:
- "Make the face bigger"
- "Reduce text to 2-3 words"
- "Add stronger contrast"

---
OUTPUT FORMAT: Return ONLY valid JSON.
JSON_SCHEMA: {
    "predictedCTR": "X.X%",
    "thumbnailGrade": "A+ | A | B | C | D",
    "verdict": "Clear, honest performance summary (1-2 lines)",
    "metrics": { "contrast": 0-10, "faceDetails": 0-10, "textEmphasis": 0-10, "hook": 0-10 },
    "strengths": ["What actually helps clicks"],
    "weaknesses": ["What reduces clicks"],
    "composition": "Simple explanation of layout and focus",
    "colorTheory": "Simple explanation of colors and impact",
    "improvements": ["Actionable fix 1", "Actionable fix 2", "Actionable fix 3"]
}

Always prioritize performance over design.`;

            const body = {
                model: VISION_FAST_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: [
                        { type: 'text', text: "Audit this thumbnail for a high-performance YouTube channel. Give me a fair, detailed breakdown." },
                        { type: 'image_url', image_url: { url: image } }
                    ]}
                ],
                temperature: 0.4
            };

            let data;
            try {
                data = await fetchOpenRouter(body, { title: 'RE-RENDER Thumbnail Audit (Fast)' });
            } catch (err) {
                console.warn('[ANALYSER] Fast model failed, trying fallback...', err);
                data = await fetchOpenRouter({ ...body, model: FALLBACK_MODEL }, { title: 'RE-RENDER Thumbnail Audit' });
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

    const handleDownloadReport = () => {
        if (!analysis) return;
        const report = `
RE-RENDER NEURAL AUDIT REPORT
-----------------------------
TIMESTAMP: ${new Date().toLocaleString()}
GRADE: ${analysis.thumbnailGrade}
PREDICTED CTR: ${analysis.predictedCTR}

VERDICT:
${analysis.verdict}

STRENGTHS:
${analysis.strengths?.map(s => `- ${s}`).join('\n')}

WEAKNESSES:
${analysis.weaknesses?.map(w => `- ${w}`).join('\n')}

VISUAL COMPOSITION:
${analysis.composition}

COLOR THEORY:
${analysis.colorTheory}

KEY IMPROVEMENTS:
${analysis.improvements?.map(i => `- ${i}`).join('\n')}

METRICS:
- Contrast: ${analysis.metrics?.contrast}/10
- Face Details: ${analysis.metrics?.faceDetails}/10
- Text Emphasis: ${analysis.metrics?.textEmphasis}/10
- Hook Power: ${analysis.metrics?.hook}/10
-----------------------------
END OF REPORT
        `;
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rerender_audit_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                {/* Column 01: Visual Canvas & Detailed Analysis */}
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
                            <LabLoader label="PERFORMING_DEEP_STRATEGIC_SCAN..." />
                        ) : preview ? (
                            <img src={preview} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div onClick={() => fileRef.current?.click()} style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                                <ImageIcon size={48} opacity={0.2} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>UPLOAD_ASSET_FOR_AUDIT</span>
                            </div>
                        )}
                    </div>

                    {analysis && !isAnalyzing && (
                        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                            <div style={{ border: '1.5px solid var(--color-text)', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#10B981' }}>
                                    <CheckCircle2 size={18} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>STRENGTHS</span>
                                </div>
                                <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div style={{ border: '1.5px solid var(--color-text)', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#EF4444' }}>
                                    <AlertTriangle size={18} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>WEAKNESSES</span>
                                </div>
                                <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {analysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                            <div style={{ border: '1.5px solid var(--color-text)', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <Layout size={18} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>COMPOSITION</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>{analysis.composition}</p>
                            </div>
                            <div style={{ border: '1.5px solid var(--color-text)', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <Palette size={18} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>COLOR THEORY</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>{analysis.colorTheory}</p>
                            </div>
                        </div>
                    )}

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
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>ENGINE:</span> {VISION_FAST_MODEL.split('/')[1].toUpperCase()}<br />
                            <span style={{ color: 'var(--color-text)', fontWeight: 900 }}>SCAN_DEPTH:</span> DEEP_STRATEGIC
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
                                    <p style={{ marginTop: '2rem', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>"{analysis.verdict?.replace(/—/g, '-')}"</p>
                                </div>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownloadReport}
                                style={{
                                    width: '100%', padding: '1.25rem',
                                    backgroundColor: 'var(--color-text)',
                                    color: 'var(--color-bg)',
                                    border: 'none',
                                    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.8rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                    boxShadow: '6px 6px 0px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Download size={18} />
                                DOWNLOAD_REPORT.TXT
                            </button>

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
                                <button 
                                    onClick={() => { setPreview(null); setAnalysis(null); }} 
                                    style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: 'none', border: '1.5px solid var(--color-text)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                >
                                    START_NEW_AUDIT
                                </button>
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
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ThumbnailAnalyserPage;
