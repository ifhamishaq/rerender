import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Zap, Download, BarChart3, ArrowLeft, Upload, RefreshCw, FileText, Cpu, X, Sparkles, Image as ImageIcon, CheckCircle2, AlertTriangle, Palette, Layout } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';
import LabPill from '../components/LabPill';
import { useWindowSize } from '../hooks/useWindowSize';

const VISION_MODEL = 'openrouter/free';
const VISION_FAST_MODEL = 'openrouter/free';
const FALLBACK_MODEL = 'openrouter/free';

const ACCENT = 'var(--color-vision)';

const ThumbnailAnalyserPage = () => {
    const { width } = useWindowSize();
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
            setError(null);
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
            setError("Insufficient credits. Thumbnail audit costs 2 credits.");
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
    "colorTheory": "Simple explanation of color choices and contrast",
    "improvements": ["Actionable improvement 1", "Actionable improvement 2", "Actionable improvement 3"]
}`;

            const userPrompt = "Analyze this thumbnail and tell me if it will get clicks.";

            const body = {
                model: VISION_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: userPrompt },
                            { type: 'image_url', image_url: { url: image } }
                        ]
                    }
                ],
                temperature: 0.3
            };

            let data;
            try {
                data = await fetchOpenRouter(body, { title: 'RE-RENDER Thumbnail Analyser' });
            } catch (err) {
                console.warn('[VISION] Primary vision model failed, attempting fallback...');
                data = await fetchOpenRouter({ ...body, model: FALLBACK_MODEL }, { title: 'RE-RENDER Thumbnail Analyser' });
            }

            const raw = data.choices?.[0]?.message?.content || '';
            const parsed = safeParseJSON(raw);

            if (parsed) {
                setAnalysis(parsed);
            } else {
                throw new Error("Unable to parse AI response. Please try again.");
            }
        } catch (err) {
            setError(err.message || "Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDownloadReport = () => {
        if (!analysis) return;
        const report = `
RE-RENDER CREATOR OS — THUMBNAIL AUDIT REPORT
=============================================
DATE: ${new Date().toLocaleString()}
GRADE: ${analysis.thumbnailGrade}
PREDICTED CTR: ${analysis.predictedCTR}

VERDICT:
${analysis.verdict}

KEY IMPROVEMENTS:
${analysis.improvements?.map((i, idx) => `[${idx+1}] ${i}`).join('\n')}

STRENGTHS:
${analysis.strengths?.map(s => `+ ${s}`).join('\n')}

WEAKNESSES:
${analysis.weaknesses?.map(w => `- ${w}`).join('\n')}

VISUAL COMPOSITION:
${analysis.composition}

COLOR PSYCHOLOGY & CONTRAST:
${analysis.colorTheory}

METRICS:
- Contrast: ${analysis.metrics?.contrast}/10
- Subject / Face Details: ${analysis.metrics?.faceDetails}/10
- Text Emphasis: ${analysis.metrics?.textEmphasis}/10
- Hook Power: ${analysis.metrics?.hook}/10
=============================================
`;
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rerender_thumbnail_audit_${Date.now()}.txt`;
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
                title="Thumbnail" 
                subtitle="Analyser." 
                vol="01" 
                credits={profile?.credits ?? 0} 
                accentColor={ACCENT}
                tag="CREATOR OS"
            />

            <main style={{
                maxWidth: '1200px',
                margin: '3rem auto',
                padding: '0 2rem',
                display: 'grid',
                gridTemplateColumns: width < 1000 ? '1fr' : '480px 1fr',
                gap: '2.5rem'
            }}>
                {/* Column 01: Upload & Thumbnail Preview (Jakob's Law: Left Panel) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '24px',
                        padding: '1.75rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase'
                            }}>
                                Thumbnail Canvas
                            </span>
                            {preview && (
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: ACCENT,
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Replace Image
                                </button>
                            )}
                        </div>

                        {/* Dropzone / Preview */}
                        <div 
                            onClick={() => !preview && fileRef.current?.click()}
                            style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                backgroundColor: 'var(--color-bg)',
                                border: `2px dashed ${preview ? 'transparent' : 'var(--color-border)'}`,
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: preview ? 'default' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { if (!preview) e.currentTarget.style.borderColor = ACCENT; }}
                            onMouseLeave={(e) => { if (!preview) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                            {isAnalyzing ? (
                                <LabLoader label="Scanning visual composition & CTR triggers..." accentColor={ACCENT} />
                            ) : preview ? (
                                <img 
                                    src={preview} 
                                    alt="Thumbnail preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                <div style={{ 
                                    color: 'var(--color-text-secondary)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    gap: '1rem',
                                    padding: '2rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        width: '56px', height: '56px',
                                        borderRadius: '16px',
                                        backgroundColor: 'var(--color-surface)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--color-border)',
                                        color: ACCENT
                                    }}>
                                        <Upload size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>
                                            Upload Thumbnail to Audit
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                                            PNG, JPG, or WebP (16:9 recommended)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Button (Von Restorff Effect) */}
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !preview}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                backgroundColor: (isAnalyzing || !preview) ? 'var(--color-border)' : ACCENT,
                                color: (isAnalyzing || !preview) ? 'var(--color-text-muted)' : '#ffffff',
                                border: 'none',
                                borderRadius: '16px',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: (isAnalyzing || !preview) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                boxShadow: (isAnalyzing || !preview) ? 'none' : `0 4px 20px color-mix(in srgb, ${ACCENT} 40%, transparent)`
                            }}
                        >
                            {isAnalyzing ? (
                                <>
                                    <RefreshCw size={18} className="spin" />
                                    <span>Auditing Thumbnail...</span>
                                </>
                            ) : (
                                <>
                                    <Eye size={18} />
                                    <span>Analyze Thumbnail</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={{ 
                            color: 'var(--color-viral)', 
                            fontSize: '0.85rem', 
                            backgroundColor: 'color-mix(in srgb, var(--color-viral) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--color-viral) 30%, transparent)', 
                            borderRadius: '16px',
                            padding: '1rem 1.25rem',
                            fontWeight: 600
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Column 02: Analysis Results & Metrics (Peak-End Rule: Right Panel) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {analysis && !isAnalyzing ? (
                        <>
                            {/* Score Card */}
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '24px',
                                padding: '2rem',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        Predicted Click-Through Potential
                                    </div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: '0.5rem', color: 'var(--color-text)' }}>
                                        {analysis.predictedCTR}
                                    </div>
                                    <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '420px', margin: '1rem 0 0' }}>
                                        "{analysis.verdict?.replace(/—/g, '-')}"
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, transparent)`,
                                    color: ACCENT,
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '16px',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '2.25rem',
                                    fontWeight: 900,
                                    border: `1px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`,
                                    lineHeight: 1
                                }}>
                                    {analysis.thumbnailGrade}
                                </div>
                            </div>

                            {/* Improvements (Actionable Fixes) */}
                            {analysis.improvements && (
                                <div style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.08em',
                                        color: ACCENT,
                                        textTransform: 'uppercase',
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Sparkles size={14} />
                                        <span>Actionable CTR Fixes</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {analysis.improvements.map((imp, i) => (
                                            <div key={i} style={{
                                                padding: '1rem 1.25rem',
                                                backgroundColor: 'var(--color-bg)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                lineHeight: 1.5,
                                                display: 'flex',
                                                gap: '0.75rem',
                                                alignItems: 'flex-start'
                                            }}>
                                                <span style={{ 
                                                    color: ACCENT, 
                                                    fontWeight: 800, 
                                                    fontFamily: 'var(--font-mono)',
                                                    backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, transparent)`,
                                                    padding: '0.1rem 0.45rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    #{i+1}
                                                </span>
                                                <span style={{ color: 'var(--color-text)' }}>{imp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Breakdown Grid: Strengths & Weaknesses */}
                            <div style={{ display: 'grid', gridTemplateColumns: width < 768 ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '20px',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#16a34a' }}>
                                        <CheckCircle2 size={16} />
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800 }}>WHAT WORKS</span>
                                    </div>
                                    <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                                        {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>

                                <div style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '20px',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ea580c' }}>
                                        <AlertTriangle size={16} />
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800 }}>CTR FRICTION</span>
                                    </div>
                                    <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                                        {analysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {/* Visual Metrics Progress Bars */}
                            {analysis.metrics && (
                                <div style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '20px',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
                                        Core Visual Metrics
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: width < 768 ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
                                        {Object.entries(analysis.metrics).map(([key, val]) => (
                                            <div key={key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '0.4rem' }}>
                                                    <span style={{ color: 'var(--color-text)' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                                                    <span style={{ color: ACCENT }}>{val}/10</span>
                                                </div>
                                                <div style={{ height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${val * 10}%`, backgroundColor: ACCENT, borderRadius: '10px' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Bar */}
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleDownloadReport}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '14px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <Download size={16} />
                                    <span>Download Report (.txt)</span>
                                </button>
                                <button 
                                    onClick={() => { setPreview(null); setImage(null); setAnalysis(null); }} 
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: 'none',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text-secondary)',
                                        borderRadius: '14px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Empty State Guidance */
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '3rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: '400px',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: '64px', height: '64px',
                                borderRadius: '20px',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: ACCENT
                            }}>
                                <Eye size={30} />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
                                How AI Vision Audits Your Thumbnail
                            </h3>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', color: 'var(--color-text-secondary)', maxWidth: '440px', lineHeight: 1.6, margin: '0 0 2rem' }}>
                                Upload any draft or competitor thumbnail on the left. The engine evaluates clickability, visual hierarchy, mobile readability, and provides 3 concrete CTR fixes.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', maxWidth: '420px' }}>
                                <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: ACCENT, fontWeight: 700 }}>01</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem' }}>Contrast</div>
                                </div>
                                <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: ACCENT, fontWeight: 700 }}>02</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem' }}>Focal Point</div>
                                </div>
                                <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: ACCENT, fontWeight: 700 }}>03</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem' }}>CTR Potential</div>
                                </div>
                            </div>
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
