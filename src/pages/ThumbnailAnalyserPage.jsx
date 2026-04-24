import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Eye, Zap, Download, BarChart3, ArrowLeft, Upload,
    RefreshCw, FileText, Cpu, X
} from 'lucide-react';
import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const VISION_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';
const FALLBACK_VISION_MODEL = 'google/gemma-3-27b-it:free';

const ANALYSIS_PHASES = [
    "DRAFTING_VISUAL_REVIEW",
    "ASSET_COLOR_AUDIT",
    "NEURAL_ATTENTION_MAPPING",
    "PSYCHOLOGICAL_HOOK_SCAN",
    "DEEP_COMPOSITION_AUDIT",
    "FINALIZING_PERFORMANCE_REPORT"
];

const ThumbnailAnalyserPage = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageB, setImageB] = useState(null);
    const [previewB, setPreviewB] = useState(null);
    const [isCompareMode, setIsCompareMode] = useState(false);

    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [fakeProgress, setFakeProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isThermal, setIsThermal] = useState(false);
    const [simulatorMode, setSimulatorMode] = useState('DESKTOP'); // DESKTOP, MOBILE, SIDEBAR

    const fileRef = useRef(null);
    const progressInterval = useRef(null);

    // Neural Scanner Loading State
    const PhaseOverlay = ({ currentPhase, fakeProgress }) => (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)'
        }}>
            <div style={{ position: 'relative', zIndex: 12, textAlign: 'center' }}>
                <div style={{ 
                    width: '80px', height: '80px', 
                    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '2rem', margin: '0 auto 2rem',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                }}>
                    <Cpu size={32} className="spin" style={{ color: 'var(--color-accent)' }} />
                </div>

                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900,
                    color: '#fff', letterSpacing: '0.4em', marginBottom: '1.5rem',
                    textTransform: 'uppercase', opacity: 0.9
                }}>
                    {ANALYSIS_PHASES[currentPhase]}
                </div>

                <div style={{
                    width: '240px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '100px', overflow: 'hidden', position: 'relative', 
                    marginBottom: '1rem', margin: '0 auto 1rem'
                }}>
                    <motion.div
                        animate={{ width: `${fakeProgress}%` }}
                        style={{ 
                            height: '100%', 
                            background: 'linear-gradient(90deg, transparent, var(--color-accent))', 
                            position: 'absolute', left: 0,
                            boxShadow: '0 0 10px var(--color-accent)'
                        }}
                    />
                </div>

                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#fff',
                    opacity: 0.4, display: 'flex', gap: '1.5rem', justifyContent: 'center',
                    letterSpacing: '0.1em'
                }}>
                    <span>NEURAL_LINK // ACTIVE</span>
                    <span>FPS // 60.0</span>
                </div>
            </div>
        </div>
    );

    // Sub-component for Thermal Visuals
    const ThermalOverlay = ({ heatmap, active }) => {
        if (!active || !heatmap) return null;
        return (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
                <defs>
                    <linearGradient id="thermal-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ff0000" />
                        <stop offset="50%" stopColor="#ffae00" />
                        <stop offset="100%" stopColor="#fffb00" />
                    </linearGradient>
                    <filter id="thermal-glow">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-accent)" />
                    </marker>
                </defs>
                {heatmap.map((point, i) => {
                    const x = parseFloat(point.x) || 0;
                    const y = parseFloat(point.y) || 0;
                    const intensity = parseFloat(point.intensity) || 0.5;
                    return (
                        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: intensity, scale: 1 }} transition={{ delay: i * 0.2 }}>
                            <circle
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r={40 + (intensity * 20)}
                                fill="url(#thermal-gradient)"
                                filter="url(#thermal-glow)"
                                style={{ opacity: 0.6 }}
                            />
                            <text
                                x={`${x}%`}
                                y={`${y - 5}%`}
                                textAnchor="middle"
                                style={{ fill: '#fff', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 900, textShadow: '0 0 10px #f00' }}
                            >
                                {point.label}
                            </text>
                        </motion.g>
                    );
                })}

                {/* Draw Eye Path Arrows */}
                {analysis?.eyePathPoints?.length > 1 && (
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                        d={`M ${analysis.eyePathPoints.map(p => `${parseFloat(p.x) || 0}% ${parseFloat(p.y) || 0}%`).join(' L ')}`}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        markerEnd="url(#arrowhead)"
                    />
                )}
            </svg>
        );
    };

    // Psychological trick: Cycle through technical phases to make the wait feel productive
    useEffect(() => {
        if (isAnalyzing) {
            let phase = 0;
            const phaseInterval = setInterval(() => {
                phase = (phase + 1) % ANALYSIS_PHASES.length;
                setCurrentPhase(phase);
            }, 2000);

            let progress = 0;
            progressInterval.current = setInterval(() => {
                progress += (95 - progress) * 0.1; // Slows down as it approaches 95%
                setFakeProgress(progress);
            }, 500);

            return () => {
                clearInterval(phaseInterval);
                if (progressInterval.current) clearInterval(progressInterval.current);
            };
        } else {
            setFakeProgress(0);
            setCurrentPhase(0);
        }
    }, [isAnalyzing]);

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

    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();


    const handleAnalyze = async () => {
        if (!image || isAnalyzing) return;

        // AUTH CHECK
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        // CREDIT CHECK
        if (!profile || profile.credits < AI_COSTS.ANALYSER) {
            alert(`📉 OUT_OF_COMPUTE: Insufficient credits. Costs ${AI_COSTS.ANALYSER} credits.`);
            return;
        }

        // SPEND CREDIT
        const success = await spendCredits(AI_COSTS.ANALYSER, 'THUMBNAIL_ANALYSIS');
        if (!success) return;

        setIsAnalyzing(true);
        setAnalysis(null);
        setIsThermal(false);

        try {
            const systemPrompt = isCompareMode
                ? `You are the Chief Creative Strategist at RE-RENDER. Comparison mode active.
                Evaluate TWO thumbnails (Version A vs Version B). 
                Pick a WINNER and explain the psychological gap.
                OUTPUT JSON: {
                    "winner": "A" or "B",
                    "winningVerdict": "Short powerful sentence...",
                    "ctrScoreA": 0-10, "ctrScoreB": 0-10,
                    "predictedCTR_A": "1.2%", "predictedCTR_B": "2.4%",
                    "gapAnalysis": "Why the winner is better...",
                    "metrics": { "contrast": 0-10, "saturation": 0-10, "faceDetails": 0-10, "textEmphasis": 0-10 },
                    "heuristics": { "hook": "string", "eyePath": "string" },
                    "improvements": ["Step 1", "Step 2", ...],
                    "audience": { "score": 0-100, "profile": "string" },
                    "palette": ["#hex", ...], "verdict": "string", "composition": "string", "colorPsychology": "string"
                }`
                : `You are the Lead Visual Strategist at RE-RENDER — the most advanced thumbnail analysis engine on the internet.
                You have deep expertise in YouTube algorithm optimization, visual psychology, and Photoshop/design workflows.
                
                ANALYSIS FRAMEWORK:
                1. **CTR Prediction**: Based on contrast, face prominence, text clarity, and emotional triggers
                2. **Visual Hierarchy**: Where does the eye go first? Is the flow optimal?
                3. **Color Psychology**: What emotions do the dominant colors trigger?
                4. **Text Analysis**: Is the text readable at small sizes (mobile YouTube feed)?
                5. **Face Analysis**: Are faces present? Are expressions exaggerated enough for thumbnails?
                6. **Competitive Edge**: Would this stand out in a YouTube feed against competitors?
                7. **Niche Fit**: What content niche does this thumbnail suggest?
                
                Give technical Photoshop advice with EXACT steps. Example: "Add a Curves adjustment layer, pull shadows to 15, highlights to 240."
                
                CRITICAL: 'heatmap' and 'eyePathPoints' MUST be included with realistic coordinates.
                
                JSON_SCHEMA: {
                    "predictedCTR": "X.X%",
                    "ctrBenchmark": "Average for this niche is X-X%",
                    "detectedNiche": "gaming | vlog | tutorial | music | tech | lifestyle | other",
                    "thumbnailGrade": "A+ | A | B+ | B | C+ | C | D | F",
                    "metrics": { 
                        "contrast": 0-10, 
                        "saturation": 0-10, 
                        "faceDetails": 0-10, 
                        "textEmphasis": 0-10, 
                        "textReadability": 0-10,
                        "emotionalImpact": 0-10,
                        "colorHarmony": 0-10,
                        "visualClutter": 0-10
                    },
                    "heuristics": { 
                        "hook": "What grabs attention first", 
                        "eyePath": "Where does the eye travel",
                        "emotionalTrigger": "curiosity | shock | fomo | inspiration | humor | controversy",
                        "scrollStopPower": "Would this stop a scroll? Why or why not"
                    },
                    "textAnalysis": {
                        "detected": true/false,
                        "content": "The text found in thumbnail",
                        "fontSize": "too small | good | large",
                        "contrast_vs_bg": "low | medium | high",
                        "suggestion": "How to improve text"
                    },
                    "faceAnalysis": {
                        "detected": true/false,
                        "expression": "neutral | happy | shocked | angry | none",
                        "prominence": "small | medium | large",
                        "suggestion": "How to improve face impact"
                    },
                    "heatmap": [ { "x": 0-100, "y": 0-100, "intensity": 0.1-1.0, "label": "string" } ],
                    "eyePathPoints": [ { "x": 0-100, "y": 0-100 } ],
                    "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"], 
                    "verdict": "One-line brutal honest verdict", 
                    "composition": "Detailed composition analysis", 
                    "colorPsychology": "What the colors communicate psychologically", 
                    "improvements": [
                        "Exact Photoshop step with tool names and values",
                        "Exact Photoshop step with tool names and values",
                        "Exact Photoshop step with tool names and values",
                        "Exact Photoshop step with tool names and values",
                        "Exact Photoshop step with tool names and values"
                    ], 
                    "audience": { "score": 0-100, "profile": "Who would click this and why" },
                    "youtubeSpecific": {
                        "mobileReadability": "Will this work on a phone screen? Yes/No + why",
                        "suggestedFeedPosition": "Would perform best in: Home | Suggested | Search",
                        "competitorEdge": "How this compares to typical thumbnails in the niche"
                    }
                }`;

            const analysisBody = {
                model: VISION_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt + `
                        STRICT_JSON_PROTOCOL: No comments, etc. 
                        CRITICAL: Do not nest the 'audience' object inside 'metrics'.
                        CRITICAL: 'colorPsychology' and 'improvements' MUST be non-empty.`
                    },
                    {
                        role: 'user',
                        content: isCompareMode ? [
                            { type: 'text', text: "Battle Mode: Contrast these two assets. JSON output only." },
                            { type: 'image_url', image_url: { url: image } },
                            { type: 'image_url', image_url: { url: imageB } }
                        ] : [
                            { type: 'text', text: "Audit this thumbnail. JSON output only." },
                            { type: 'image_url', image_url: { url: image } }
                        ]
                    }
                ],
                temperature: 0.3
            };

            let response;
            try {
                response = await fetchOpenRouter(analysisBody, { title: 'RE-RENDER Single Audit' });
            } catch (primaryErr) {
                console.warn('[ANALYSER] Primary model failed, trying fallback...', primaryErr.message);
                response = await fetchOpenRouter(
                    { ...analysisBody, model: FALLBACK_VISION_MODEL },
                    { title: 'RE-RENDER Single Audit (Fallback)' }
                );
            }
            const finalContent = response.choices?.[0]?.message?.content || '';
            const finalAnalysis = safeParseJSON(finalContent);

            if (finalAnalysis) {
                setFakeProgress(100);
                setTimeout(() => {
                    // NORMALIZE_DATA: Ensure improvements is always an array
                    if (finalAnalysis && finalAnalysis.improvements && !Array.isArray(finalAnalysis.improvements)) {
                        finalAnalysis.improvements = [finalAnalysis.improvements];
                    } else if (finalAnalysis && !finalAnalysis.improvements) {
                        finalAnalysis.improvements = ["ADJUST_LEVEL_CURVES", "OPT_COLOR_SATURATION"];
                    }

                    // NORMALIZE_STRATEGIC_DATA: Add fallbacks for missing strategic fields
                    if (!finalAnalysis.heuristics) finalAnalysis.heuristics = { hook: "PATTERN_INTERRUPT_REQUIRED", eyePath: "LINEAR_TRANSITION_DETECTED" };
                    if (!finalAnalysis.audience) finalAnalysis.audience = { score: 0, profile: "DEMOGRAPHIC_PENDING" };

                    setAnalysis(finalAnalysis);
                    setIsAnalyzing(false);
                }, 500);
            } else {
                throw new Error("MALFORMED_RESPONSE: AI output did not contain valid audit data.");
            }
        } catch (err) {
            console.error('ANALYSIS_FAIL:', err);
            const isRateLimit = err.message.includes('429');

            let userMsg = `ANALYSIS_FAIL: ${err.message}`;
            if (isRateLimit) {
                userMsg = "SYSTEM_CONGESTION: Free neural nodes are at capacity. Please wait 30 seconds and retry.";
            } else if (err.message.includes('404') || err.message.includes('No endpoints')) {
                userMsg = "MODEL_OFFLINE: The free multimodal endpoint is temporarily offline. Please try again later.";
            }

            alert(userMsg);
            setIsAnalyzing(false);
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            window.print();
            setIsExporting(false);
        }, 500);
    };

    const MetricBar = ({ label, value, delay = 0 }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>{value}/10</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 10) * 100}%` }}
                    transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
                    style={{ 
                        height: '100%', 
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.1), var(--color-accent))',
                        boxShadow: '0 0 10px rgba(57,255,20,0.2)'
                    }}
                />
            </div>
        </div>
    );

    return (
        <main style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            paddingTop: 'var(--nav-height)',
            fontFamily: 'var(--font-sans)'
        }}>
            <div className="no-print" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                <Link to="/tools" className="no-print" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginBottom: '3rem',
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0.6rem 1.25rem', borderRadius: '100px', fontWeight: 900,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                >
                    <ArrowLeft size={14} /> BACK_TO_TOOLS
                </Link>

                <div className="no-print" style={{
                    marginBottom: '4rem',
                }}>
                    <div style={{
                        fontSize: '0.6rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        marginBottom: '1rem',
                        letterSpacing: '0.4em',
                        fontWeight: 900,
                        opacity: 0.8
                    }}>
                        VOL. 01 // CRITICAL_AUDIT // RE-RENDER_STUDIO
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                        fontWeight: 900,
                        fontFamily: 'var(--font-display)',
                        lineHeight: 0.85,
                        margin: 0,
                        letterSpacing: '-0.04em',
                        textTransform: 'uppercase'
                    }}>
                        NEURAL<br />
                        <span style={{
                            fontFamily: 'Playfair Display',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: '#fff',
                            opacity: 0.9,
                            textTransform: 'none'
                        }}>{isCompareMode ? 'Battle Engine' : 'Audit Unit'}</span>
                    </h1>
                </div>

                <div className="no-print" style={{
                    display: 'flex',
                    gap: '0.4rem',
                    marginBottom: '3rem',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '0.4rem',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    width: 'fit-content'
                }}>
                    <button
                        onClick={() => { setIsCompareMode(false); setAnalysis(null); }}
                        style={{
                            padding: '0.6rem 1.5rem', border: 'none',
                            borderRadius: '100px',
                            backgroundColor: !isCompareMode ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: !isCompareMode ? '#fff' : 'rgba(255,255,255,0.4)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        SINGLE_AUDIT 🎯
                    </button>
                    <button
                        onClick={() => { setIsCompareMode(true); setAnalysis(null); }}
                        style={{
                            padding: '0.6rem 1.5rem', border: 'none',
                            borderRadius: '100px',
                            backgroundColor: isCompareMode ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: isCompareMode ? '#fff' : 'rgba(255,255,255,0.4)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        BATTLE_MODE ⚔️
                    </button>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleUpload(e, 'A')} style={{ display: 'none' }} />
                <input id="fileB" type="file" accept="image/*" onChange={(e) => handleUpload(e, 'B')} style={{ display: 'none' }} />

                {!preview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2.5rem' }}>
                            <motion.div
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)', scale: 1.01 }}
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.1)', padding: '6rem 2rem',
                                    borderRadius: '32px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{ 
                                    width: '64px', height: '64px', borderRadius: '50%', 
                                    backgroundColor: 'rgba(255,255,255,0.05)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <Upload size={24} style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.7 }}>[ UPLOAD_ASSET_A ]</div>
                            </motion.div>

                            {isCompareMode && (
                                <motion.div
                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)', scale: 1.01 }}
                                    onClick={() => document.getElementById('fileB')?.click()}
                                    style={{
                                        border: '1px solid rgba(255,255,255,0.1)', padding: '6rem 2rem',
                                        borderRadius: '32px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div style={{ 
                                        width: '64px', height: '64px', borderRadius: '50%', 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <Upload size={24} style={{ color: 'var(--color-accent)' }} />
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.7 }}>[ UPLOAD_ASSET_B ]</div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isCompareMode && preview && previewB ? '1fr auto 1fr' : (isCompareMode ? '1fr 1fr' : '1fr'),
                            gap: '2.5rem',
                            alignItems: 'center',
                            marginBottom: '4rem'
                        }}>
                            <div style={{
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                backgroundColor: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
                            }}>
                                <img
                                    src={preview}
                                    alt="Preview A"
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        opacity: isAnalyzing ? 0.3 : 1,
                                        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                                <ThermalOverlay heatmap={analysis?.heatmap} active={isThermal && !isAnalyzing} />
                                {isAnalyzing && <PhaseOverlay currentPhase={currentPhase} fakeProgress={fakeProgress} />}
                            </div>

                            {isCompareMode && preview && previewB && (
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '2.5rem',
                                    fontWeight: 900,
                                    color: 'var(--color-accent)',
                                    fontStyle: 'italic',
                                    opacity: 0.8
                                }}>VS</div>
                            )}

                            {isCompareMode && (
                                <div style={{
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '32px',
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    position: 'relative',
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
                                }}>
                                    {previewB ? (
                                        <img
                                            src={previewB}
                                            alt="Preview B"
                                            style={{
                                                width: '100%',
                                                display: 'block',
                                                opacity: isAnalyzing ? 0.3 : 1,
                                                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => document.getElementById('fileB')?.click()}
                                            style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
                                            [ INSERT_B ]
                                        </div>
                                    )}
                                    {isAnalyzing && <PhaseOverlay currentPhase={currentPhase} fakeProgress={fakeProgress} />}
                                </div>
                            )}
                        </div>

                        {!isAnalyzing && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {analysis && (
                                    <button
                                        onClick={() => setIsThermal(!isThermal)}
                                        style={{
                                            padding: '1rem',
                                            backgroundColor: isThermal ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                                            color: isThermal ? 'black' : '#fff',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '100px',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <Zap size={14} fill={isThermal ? 'currentColor' : 'none'} />
                                        {isThermal ? 'DISABLE_HEAT_GRID' : 'ACTIVATE_HEAT_GRID'}
                                    </button>
                                )}

                                <button onClick={handleAnalyze} disabled={isAnalyzing} style={{
                                    padding: '1.25rem', backgroundColor: 'var(--color-accent)',
                                    color: 'black', border: 'none', borderRadius: '100px',
                                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                                    fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                    boxShadow: '0 10px 30px rgba(57,255,20,0.2)',
                                    transition: 'all 0.3s'
                                }}>
                                    <Eye size={18} /> RUN_EDITORIAL_AUDIT
                                </button>

                                <button onClick={() => { setPreview(null); setImage(null); setAnalysis(null); }} style={{
                                    padding: '0.75rem', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)',
                                    border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', cursor: 'pointer',
                                    fontWeight: 900, letterSpacing: '0.1em'
                                }}>
                                    [ RESET_STUDIO_SESSION ]
                                </button>
                            </div>
                        )}

                        {/* Audit Dashboard Section - Unified for stability */}
                        {!isAnalyzing && analysis && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '4rem' }}>
                                {/* Top Level Metrics & Verdict */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        borderRadius: '32px',
                                        padding: '3rem',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        backdropFilter: 'blur(30px)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {isCompareMode && (
                                        <div style={{
                                            position: 'absolute', top: 0, right: 0,
                                            backgroundColor: 'var(--color-accent)', color: 'black',
                                            padding: '0.5rem 1.5rem', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                                            borderRadius: '0 0 0 20px'
                                        }}> BATTLE_RESULT_CONFIRMED </div>
                                    )}
                                    {/* Grade Badge */}
                                    {analysis.thumbnailGrade && (
                                        <div style={{
                                            position: 'absolute', top: '2.5rem', right: '3rem',
                                            backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-accent)',
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)',
                                            lineHeight: 1, border: '1px solid rgba(57,255,20,0.2)',
                                            boxShadow: '0 0 20px rgba(57,255,20,0.1)'
                                        }}>{analysis.thumbnailGrade}</div>
                                    )}
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem', letterSpacing: '0.2em' }}>
                                        {isCompareMode ? 'WINNER_VERSION' : 'PREDICTED_CTR'}
                                    </div>
                                    <div style={{ fontSize: '6rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'baseline', gap: '0.25rem', lineHeight: 0.8, color: '#fff', letterSpacing: '-0.05em' }}>
                                        {isCompareMode ? analysis.winner : (analysis.predictedCTR || '0.0%')}
                                    </div>
                                    {analysis.ctrBenchmark && (
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                            {analysis.ctrBenchmark}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                                        {analysis.detectedNiche && (
                                            <div style={{ padding: '0.5rem 1.25rem', borderRadius: '100px', backgroundColor: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                                                NICHE // {analysis.detectedNiche}
                                            </div>
                                        )}
                                        {analysis.heuristics?.emotionalTrigger && (
                                            <div style={{ padding: '0.5rem 1.25rem', borderRadius: '100px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                                                TRIGGER // {analysis.heuristics.emotionalTrigger}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '1rem', color: '#fff', marginTop: '2.5rem', fontFamily: 'Playfair Display', fontStyle: 'italic', opacity: 0.8, lineHeight: 1.5 }}>
                                        "{isCompareMode ? analysis.winningVerdict : (analysis.verdict || 'ANALYSIS_COMPLETE')}"
                                    </div>
                                </motion.div>

                                {/* Simulation Studio */}
                                {(preview || previewB) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        style={{
                                            padding: '2.5rem',
                                            borderRadius: '32px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            backdropFilter: 'blur(20px)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>
                                                [ SIMULATION_STUDIO_V1.0 ]
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '100px' }}>
                                                {['DESKTOP', 'MOBILE', 'SIDEBAR'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setSimulatorMode(mode)}
                                                        style={{
                                                            padding: '0.4rem 1rem',
                                                            borderRadius: '100px',
                                                            backgroundColor: simulatorMode === mode ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                            color: simulatorMode === mode ? '#fff' : 'rgba(255,255,255,0.4)',
                                                            border: 'none',
                                                            fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 900,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex', justifyContent: 'center', backgroundColor: '#080808',
                                            padding: '4rem 2rem', borderRadius: '24px',
                                            minHeight: '400px', position: 'relative', overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{
                                                width: simulatorMode === 'DESKTOP' ? '360px' : simulatorMode === 'MOBILE' ? '280px' : '420px',
                                                display: simulatorMode === 'SIDEBAR' ? 'flex' : 'block',
                                                gap: '1.5rem',
                                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}>
                                                <div style={{ 
                                                    width: simulatorMode === 'SIDEBAR' ? '180px' : '100%', 
                                                    aspectRatio: '16/9', 
                                                    backgroundColor: '#111', 
                                                    backgroundImage: `url(${preview})`, 
                                                    backgroundSize: 'cover', 
                                                    backgroundPosition: 'center',
                                                    borderRadius: simulatorMode === 'MOBILE' ? '24px' : '12px',
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}></div>
                                                <div style={{ marginTop: simulatorMode === 'SIDEBAR' ? '0' : '1.5rem', flex: 1 }}>
                                                    <div style={{ height: '1rem', backgroundColor: '#222', width: '90%', marginBottom: '0.75rem', borderRadius: '100px' }}></div>
                                                    <div style={{ height: '0.6rem', backgroundColor: '#181818', width: '60%', borderRadius: '100px' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Deep Metrics Grid */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
                                >
                                    <div style={{ borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem', backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                                            <BarChart3 size={18} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>VISUAL_VECTORS</span>
                                        </div>
                                        <MetricBar label="HUMAN_INTEREST" value={(typeof analysis.metrics?.faceDetails === 'number' ? analysis.metrics.faceDetails : 0)} delay={0.3} />
                                        <MetricBar label="CONTRAST_VALUE" value={(typeof analysis.metrics?.contrast === 'number' ? analysis.metrics.contrast : 0)} delay={0.4} />
                                        <MetricBar label="VIBRANCY_INDEX" value={(typeof analysis.metrics?.saturation === 'number' ? analysis.metrics.saturation : 0)} delay={0.5} />
                                        <MetricBar label="TYPO_HIERARCHY" value={(typeof analysis.metrics?.textEmphasis === 'number' ? analysis.metrics.textEmphasis : 0)} delay={0.6} />
                                        <MetricBar label="TEXT_READABILITY" value={(typeof analysis.metrics?.textReadability === 'number' ? analysis.metrics.textReadability : 0)} delay={0.7} />
                                        <MetricBar label="EMOTIONAL_IMPACT" value={(typeof analysis.metrics?.emotionalImpact === 'number' ? analysis.metrics.emotionalImpact : 0)} delay={0.8} />
                                        <MetricBar label="COLOR_HARMONY" value={(typeof analysis.metrics?.colorHarmony === 'number' ? analysis.metrics.colorHarmony : 0)} delay={0.9} />
                                        <MetricBar label="VISUAL_CLUTTER" value={(typeof analysis.metrics?.visualClutter === 'number' ? analysis.metrics.visualClutter : 0)} delay={1.0} />
                                    </div>

                                    <div style={{ borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem', backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                                            <Eye size={18} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>EDITORIAL_MAP</span>
                                        </div>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>HOOK_STRATEGY</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'Playfair Display', fontStyle: 'italic' }}>{analysis.heuristics?.hook}</div>
                                        </div>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>EYE_TRACKING</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.heuristics?.eyePath}</div>
                                        </div>
                                        {analysis.heuristics?.scrollStopPower && (
                                            <div>
                                                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>SCROLL_STOP_POWER</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-accent)', lineHeight: 1.6, fontWeight: 700 }}>{analysis.heuristics.scrollStopPower}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem', backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                                            <Zap size={18} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>DIRECTOR_FIXES</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            {(Array.isArray(analysis.improvements) ? analysis.improvements : []).map((imp, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '0.7rem', fontWeight: 900 }}>{String(i + 1).padStart(2, '0')}</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.4, fontWeight: 500 }}>{imp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Text & Face Analysis Cards */}
                                {(analysis.textAnalysis || analysis.faceAnalysis) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}
                                    >
                                        {analysis.textAnalysis && (
                                            <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', backgroundColor: 'var(--color-surface)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-text)', paddingBottom: '1rem' }}>
                                                    <FileText size={20} />
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>TEXT_SCAN</span>
                                                </div>
                                                {analysis.textAnalysis.detected ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 900, marginBottom: '0.4rem' }}>DETECTED_TEXT</div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>"{analysis.textAnalysis.content}"</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                            <div style={{ padding: '0.3rem 0.8rem', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900 }}>SIZE: {analysis.textAnalysis.fontSize?.toUpperCase()}</div>
                                                            <div style={{ padding: '0.3rem 0.8rem', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900 }}>CONTRAST: {analysis.textAnalysis.contrast_vs_bg?.toUpperCase()}</div>
                                                        </div>
                                                        {analysis.textAnalysis.suggestion && (
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', lineHeight: 1.5, fontStyle: 'italic' }}>{analysis.textAnalysis.suggestion}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.85rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>NO_TEXT_DETECTED</div>
                                                )}
                                            </div>
                                        )}
                                        {analysis.faceAnalysis && (
                                            <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', backgroundColor: 'var(--color-surface)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-text)', paddingBottom: '1rem' }}>
                                                    <Eye size={20} />
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>FACE_SCAN</span>
                                                </div>
                                                {analysis.faceAnalysis.detected ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                            <div style={{ padding: '0.3rem 0.8rem', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900 }}>EXPRESSION: {analysis.faceAnalysis.expression?.toUpperCase()}</div>
                                                            <div style={{ padding: '0.3rem 0.8rem', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900 }}>SIZE: {analysis.faceAnalysis.prominence?.toUpperCase()}</div>
                                                        </div>
                                                        {analysis.faceAnalysis.suggestion && (
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', lineHeight: 1.5, fontStyle: 'italic' }}>{analysis.faceAnalysis.suggestion}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.85rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>NO_FACE_DETECTED</div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* YouTube Specific Insights */}
                                {analysis.youtubeSpecific && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        style={{ border: '2px solid var(--color-accent)', padding: '2.5rem', backgroundColor: 'var(--color-surface)' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-accent)', paddingBottom: '1rem' }}>
                                            <Cpu size={20} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--color-accent)' }}>YOUTUBE_INTELLIGENCE</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                                            {analysis.youtubeSpecific.mobileReadability && (
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 900, marginBottom: '0.5rem' }}>MOBILE_READABILITY</div>
                                                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{analysis.youtubeSpecific.mobileReadability}</div>
                                                </div>
                                            )}
                                            {analysis.youtubeSpecific.suggestedFeedPosition && (
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 900, marginBottom: '0.5rem' }}>BEST_FEED_POSITION</div>
                                                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{analysis.youtubeSpecific.suggestedFeedPosition}</div>
                                                </div>
                                            )}
                                            {analysis.youtubeSpecific.competitorEdge && (
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 900, marginBottom: '0.5rem' }}>COMPETITOR_EDGE</div>
                                                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{analysis.youtubeSpecific.competitorEdge}</div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Audience / Reader Fit */}
                                <div style={{ 
                                    borderRadius: '32px', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    padding: '4rem 3rem', 
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    backdropFilter: 'blur(30px)',
                                    boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.2em' }}>READER_FIT</div>
                                            <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 0.8, fontFamily: 'var(--font-display)', color: 'var(--color-accent)', letterSpacing: '-0.05em' }}>{analysis.audience?.score}%</div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '3rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.2em' }}>TARGET_DEMOGRAPHIC_PROFILE</div>
                                            <div style={{ fontSize: '1.25rem', color: '#fff', lineHeight: 1.5, fontFamily: 'Playfair Display', fontStyle: 'italic', opacity: 0.9 }}>{analysis.audience?.profile}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                    <motion.button
                                        whileHover={{ backgroundColor: '#fff', color: '#000', scale: 1.02 }}
                                        onClick={handleExport}
                                        style={{
                                            padding: '1.25rem 3rem', backgroundColor: 'transparent', color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px',
                                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                                            fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            letterSpacing: '0.1em'
                                        }}
                                    >
                                        <Download size={18} /> [ GENERATE_AUDIT_REPORT ]
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Visual Intelligence Feed - Always at bottom to fill layout */}
            <div style={{ maxWidth: '1000px', margin: '8rem auto 0', padding: '0 2rem 4rem' }}>
                <div style={{ borderTop: '4px solid var(--color-text)', paddingTop: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>STUDIO_INTELLIGENCE</h2>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>// NEURAL_HINTS</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: "RULE_OF_THIRDS", desc: "Positioning faces on grid intersections increases retention by 14%." },
                            { title: "CONTRAST_META", desc: "A 50% contrast gap between subject and background creates instant depth." },
                            { title: "GAZE_DIRECTION", desc: "Eye-tracking confirms viewers follow the subject's gaze into the content." },
                            { title: "SALIENCY_MAPS", desc: "Neural saliency indicates exactly where user attention locks within the first 50ms." }
                        ].map((tip, i) => (
                            <div key={i} style={{ border: '1.5px solid var(--color-border)', padding: '2rem', backgroundColor: 'var(--color-surface)', boxShadow: '5px 5px 0px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '1rem' }}>HINT_0{i + 1}</div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.75rem', fontFamily: 'var(--font-display)', margin: 0 }}>{tip.title}</h4>
                                <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, marginBottom: 0 }}>{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print Friendly Template - Re-Packaged to avoid half-cut content */}
            <div id="print-area" className="print-only" style={{ padding: '4rem', backgroundColor: '#F8F6F1', color: '#000', minHeight: '100vh', fontFamily: 'var(--font-sans)', position: 'relative' }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '8px solid #000', paddingBottom: '2.5rem', marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', color: '#E8111A' }}>VOL. 02 // CREATIVE_STRATEGY_AUDIT</div>
                                <h1 style={{ fontSize: '4.5rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-display)', lineHeight: 0.8, letterSpacing: '-0.05em' }}>
                                    THUMBNAIL<br />
                                    <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>STRATEGIST</span>
                                </h1>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>ISSUED: {new Date().toLocaleDateString()}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>AUDIT_CODE: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ pageBreakInside: 'avoid', marginBottom: '4rem' }}>
                        <div style={{ border: '4px solid #000', padding: '0.5rem', backgroundColor: '#fff', marginBottom: '2rem' }}>
                            <img src={preview} alt="Thumbnail" style={{ width: '100%', height: 'auto', maxHeight: '450px', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>PERFORMANCE_SCORE: {analysis?.predictedCTR || 'N/A'}</div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {analysis?.palette?.map((color, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', backgroundColor: color, border: '1px solid #000' }} />
                                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>{color}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', pageBreakInside: 'avoid', marginBottom: '4rem' }}>
                        <div style={{ border: '2px solid #000', padding: '2rem', backgroundColor: '#fff' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1.5px solid #000', paddingBottom: '0.5rem' }}>NEURAL_HOOK</div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'Playfair Display', fontStyle: 'italic', margin: 0, lineHeight: 1.1 }}>
                                "{analysis?.heuristics?.hook || 'N/A'}"
                            </h3>
                        </div>
                        <div style={{ border: '2px solid #000', padding: '2rem', backgroundColor: '#fff' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1.5px solid #000', paddingBottom: '0.5rem' }}>READER_DATA</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{analysis?.audience?.score || 0}%</div>
                            <p style={{ fontSize: '0.8rem', color: '#444', marginTop: '0.5rem', lineHeight: 1.4, margin: 0 }}>
                                {analysis?.audience?.profile}
                            </p>
                        </div>
                    </div>

                    <div style={{ pageBreakInside: 'avoid', marginBottom: '4rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', borderBottom: '4px solid #000', paddingBottom: '0.5rem' }}>STRATEGIC_FIXES</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {analysis?.improvements?.map((imp, i) => (
                                <div key={i} style={{ borderLeft: '4px solid #000', paddingLeft: '1.5rem', fontSize: '0.95rem', lineHeight: 1.4, fontWeight: 500 }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '0.3rem', opacity: 0.5 }}>STRATEGY_{i + 1}</div>
                                    {imp}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ pageBreakInside: 'avoid', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: '#666' }}>COMPOSITION_ANALYSIS</div>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{analysis?.composition || 'BALANCED'}</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: '#666' }}>COLOR_PSYCHOLOGY</div>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{analysis?.colorPsychology || 'STRATEGIC'}</p>
                        </div>
                    </div>

                    <div style={{ pageBreakInside: 'avoid', border: '4px solid #000', padding: '2.5rem', backgroundColor: '#fff', marginBottom: '4rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: '#666' }}>DIRECTOR_VERDICT</div>
                        <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0, fontWeight: 700, fontFamily: 'Playfair Display', fontStyle: 'italic' }}>"{analysis?.verdict || 'CONFIRMED'}"</p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '4rem', borderTop: '2px solid rgba(0,0,0,0.1)', fontSize: '0.7rem', fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.3rem', opacity: 0.3 }}>
                        RE-RENDER_STRATEGY // ASSISTED_BY_NEURAL_NODES // CONFIDENTIAL
                    </div>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                @media print {
                    /* Hide site-wide globals */
                    nav, footer, .cursor, .scroll-progress, .global-oracle-container, .sticky-sidebar, #scroll-to-top { 
                        display: none !important; 
                    }
                    
                    .no-print { display: none !important; }
                    .print-only { 
                        display: block !important; 
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    
                    body { 
                        background: white !important; 
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    @page { 
                        margin: 1.25cm; 
                        size: portrait;
                    }

                    main { padding-top: 0 !important; }

                    /* Fix for cut content */
                    #print-area * {
                        page-break-inside: auto;
                    }
                    #print-area > div > div {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
                
                @media screen {
                    .print-only { display: none !important; }
                }
            `}</style>
        </main>
    );
};

export default ThumbnailAnalyserPage;
