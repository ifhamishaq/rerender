import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Eye, Zap, Download, BarChart3, ArrowLeft, Upload, 
    RefreshCw, FileText, Cpu, X, MessageSquare 
} from 'lucide-react';
import OracleCore from '../components/OracleCore';
import { fetchOpenRouter, AI_COSTS, safeParseJSON } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const VISION_MODEL = 'google/gemini-2.0-flash-exp:free';

const ANALYSIS_PHASES = [
    "DRAFTING_VISUAL_REVIEW",
    "ASSET_COLOR_AUDIT",
    "NEURAL_ATTENTION_MAPPING",
    "PSYCHOLOGICAL_HOOK_SCAN",
    "DEEP_COMPOSITION_AUDIT",
    "FINALIZING_PERFORMANCE_DOSSIER"
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
    const [isOracleOpen, setIsOracleOpen] = useState(false);
    const [fakeProgress, setFakeProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isThermal, setIsThermal] = useState(false);

    const fileRef = useRef(null);
    const progressInterval = useRef(null);

    // Neural Scanner Loading State
    const PhaseOverlay = ({ currentPhase, fakeProgress }) => (
        <div style={{ 
            position: 'absolute', inset: 0, zIndex: 10, 
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            backdropFilter: 'blur(5px)'
        }}>
            {/* Background Scanner Grid */}
            <div style={{ 
                position: 'absolute', inset: 0, opacity: 0.1,
                backgroundImage: 'radial-gradient(var(--color-text) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }} />

            {/* Moving Scanner Line */}
            <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ 
                    position: 'absolute', left: 0, right: 0, height: '2px', 
                    backgroundColor: 'var(--color-accent)', boxShadow: '0 0 15px var(--color-accent)', 
                    zIndex: 11 
                }} 
            />

            <div style={{ position: 'relative', zIndex: 12, textAlign: 'center' }}>
                <Cpu size={48} className="spin" style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
                
                <div style={{ 
                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 900, 
                    color: 'var(--color-accent)', letterSpacing: '0.3em', marginBottom: '1rem',
                    textShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}>
                    {ANALYSIS_PHASES[currentPhase]}
                </div>

                <div style={{ 
                    width: '300px', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', 
                    overflow: 'hidden', position: 'relative', marginBottom: '1.5rem' 
                }}>
                    <motion.div 
                        animate={{ width: `${fakeProgress}%` }}
                        style={{ height: '100%', backgroundColor: 'var(--color-accent)', position: 'absolute', left: 0 }}
                    />
                </div>

                <div style={{ 
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-bg)',
                    opacity: 0.6, display: 'flex', gap: '1rem', justifyContent: 'center'
                }}>
                    <span>NEURAL_LINK: ACTIVE</span>
                    <span>PACKET_LOSS: 0.0%</span>
                    <span>FPS: 60.0</span>
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
                    <filter id="thermal-glow">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
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
                <linearGradient id="thermal-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff0000" />
                    <stop offset="50%" stopColor="#ffae00" />
                    <stop offset="100%" stopColor="#fffb00" />
                </linearGradient>

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
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-accent)" />
                    </marker>
                </defs>
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
                    "improvements": ["Step 1", "Step 2", ...]
                }`
                : `You are the Lead Photoshop Strategist at RE-RENDER.
                Perform a high-level creative audit. Give technical advice in simple English.
                Use terms like "Layers, Masks, Curves, Opacity, and Selection Tools."
                Example: "Create a Levels layer to adjust shadow contrast."
                CRITICAL: 'heatmap' and 'eyePathPoints' MUST be included.
                JSON_SCHEMA: {
                    "predictedCTR": "string",
                    "metrics": { "contrast": 0-10, "saturation": 0-10, "faceDetails": 0-10, "textEmphasis": 0-10 },
                    "heatmap": [ { "x": 0-100, "y": 0-100, "intensity": 0.1-1.0, "label": "string" } ],
                    "eyePathPoints": [ { "x": 0-100, "y": 0-100 } ],
                    "palette": ["#hex", ...], "verdict": "string", "composition": "string", "colorPsychology": "string", 
                    "improvements": ["Photoshop Step 1", "Photoshop Step 2", ...], "audience": { "score": 0-100, "profile": "string" }
                }`;

            const analysisBody = {
                model: 'nvidia/nemotron-nano-12b-v2-vl:free',
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

            const response = await fetchOpenRouter(analysisBody, { title: 'RE-RENDER Single Audit' });
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{value}/10</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--color-surface)', position: 'relative', border: '1.5px solid var(--color-text)', padding: '1px' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 10) * 100}%` }}
                    transition={{ duration: 1.2, delay, ease: [0.33, 1, 0.68, 1] }}
                    style={{ height: '100%', backgroundColor: 'var(--color-text)' }}
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
                    color: 'var(--color-text)', textDecoration: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', marginBottom: '3rem',
                    border: '1px solid var(--color-border)', padding: '0.4rem 0.8rem'
                }}>
                    <ArrowLeft size={14} /> BACK_TO_TOOLS
                </Link>

                <div className="no-print" style={{
                    marginBottom: '4rem',
                    borderBottom: '4px solid var(--color-text)',
                    paddingBottom: '2rem'
                }}>
                    <div style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '1rem',
                        letterSpacing: '0.2em',
                        fontWeight: 900
                    }}>
                        VOL. 01 // CRITICAL_AUDIT // RE-RENDER_STUDIO
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: 900,
                        fontFamily: 'var(--font-display)',
                        lineHeight: 0.9,
                        margin: 0
                    }}>
                        NEURAL<br />
                        <span style={{
                            fontFamily: 'Playfair Display',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: 'var(--color-accent)'
                        }}>{isCompareMode ? 'BATTLE_ENGINE' : 'AUDIT_UNIT'}</span>
                    </h1>
                </div>

                <div className="no-print" style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '3rem',
                    border: '1.5px solid var(--color-text)',
                    padding: '0.5rem',
                    width: 'fit-content',
                    backgroundColor: 'var(--color-surface)'
                }}>
                    <button
                        onClick={() => { setIsCompareMode(false); setAnalysis(null); }}
                        style={{
                            padding: '0.6rem 1.25rem', border: 'none',
                            backgroundColor: !isCompareMode ? 'var(--color-text)' : 'transparent',
                            color: !isCompareMode ? 'var(--color-bg)' : 'var(--color-text)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer'
                        }}
                    >
                        SINGLE_AUDIT
                    </button>
                    <button
                        onClick={() => { setIsCompareMode(true); setAnalysis(null); }}
                        style={{
                            padding: '0.6rem 1.25rem', border: 'none',
                            backgroundColor: isCompareMode ? 'var(--color-text)' : 'transparent',
                            color: isCompareMode ? 'var(--color-bg)' : 'var(--color-text)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer'
                        }}
                    >
                        BATTLE_MODE ⚔️
                    </button>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleUpload(e, 'A')} style={{ display: 'none' }} />
                <input id="fileB" type="file" accept="image/*" onChange={(e) => handleUpload(e, 'B')} style={{ display: 'none' }} />

                {!preview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                            <motion.div
                                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    border: '2px solid var(--color-text)', padding: '6rem 2rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    backgroundColor: 'var(--color-surface)',
                                    boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                                }}
                            >
                                <Upload size={32} />
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>[ UPLOAD_ASSET_A ]</div>
                            </motion.div>

                            {isCompareMode && (
                                <motion.div
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                    onClick={() => document.getElementById('fileB')?.click()}
                                    style={{
                                        border: '2px solid var(--color-text)', padding: '6rem 2rem',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                        backgroundColor: 'var(--color-surface)',
                                        boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Upload size={32} />
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900 }}>[ UPLOAD_ASSET_B ]</div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isCompareMode && preview && previewB ? '1fr auto 1fr' : (isCompareMode ? '1fr 1fr' : '1fr'),
                            gap: '2rem',
                            alignItems: 'center',
                            marginBottom: '4rem'
                        }}>
                            <div style={{
                                border: '2px solid var(--color-text)',
                                overflow: 'hidden',
                                backgroundColor: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                            }}>
                                <img
                                    src={preview}
                                    alt="Preview A"
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        opacity: isAnalyzing ? 0.2 : 1,
                                        transition: 'all 0.8s ease'
                                    }}
                                />
                                <ThermalOverlay heatmap={analysis?.heatmap} active={isThermal && !isAnalyzing} />
                                {isAnalyzing && <PhaseOverlay currentPhase={currentPhase} fakeProgress={fakeProgress} />}
                            </div>

                            {isCompareMode && preview && previewB && (
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '2rem',
                                    fontWeight: 900,
                                    color: 'var(--color-accent)',
                                    fontStyle: 'italic'
                                }}>VS</div>
                            )}

                            {isCompareMode && (
                                <div style={{
                                    border: '2px solid var(--color-text)',
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    position: 'relative',
                                    boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                                }}>
                                    {previewB ? (
                                        <img
                                            src={previewB}
                                            alt="Preview B"
                                            style={{
                                                width: '100%',
                                                display: 'block',
                                                opacity: isAnalyzing ? 0.2 : 1,
                                                transition: 'all 0.8s ease'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => document.getElementById('fileB')?.click()}
                                            style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                            [ INSERT_B ]
                                        </div>
                                    )}
                                    {isAnalyzing && <PhaseOverlay currentPhase={currentPhase} fakeProgress={fakeProgress} />}
                                </div>
                            )}
                        </div>

                        {!isAnalyzing && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {analysis && (
                                    <button
                                        onClick={() => setIsThermal(!isThermal)}
                                        style={{
                                            padding: '1rem',
                                            backgroundColor: isThermal ? 'var(--color-text)' : 'transparent',
                                            color: isThermal ? 'var(--color-bg)' : 'var(--color-text)',
                                            border: '2px solid var(--color-text)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <Zap size={16} fill={isThermal ? 'currentColor' : 'none'} />
                                        {isThermal ? 'DISABLE_HEAT_GRID' : 'ACTIVATE_HEAT_GRID'}
                                    </button>
                                )}

                                <button onClick={handleAnalyze} disabled={isAnalyzing} style={{
                                    padding: '1.5rem', backgroundColor: 'var(--color-text)',
                                    color: 'var(--color-bg)', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                                    fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                                }}>
                                    <Eye size={20} /> RUN_EDITORIAL_AUDIT
                                </button>

                                <button onClick={() => { setPreview(null); setImage(null); setAnalysis(null); }} style={{
                                    padding: '1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)',
                                    border: '1px solid var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', cursor: 'pointer',
                                    opacity: 0.6
                                }}>
                                    REPLACE_ASSET
                                </button>

                                {analysis && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            marginTop: 'auto',
                                            border: '2.5px solid var(--color-text)',
                                            padding: '2rem',
                                            backgroundColor: 'var(--color-surface)',
                                            boxShadow: '10px 10px 0px var(--color-accent)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {isCompareMode && (
                                            <div style={{
                                                position: 'absolute', top: 0, right: 0,
                                                backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)',
                                                padding: '0.4rem 1rem', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)'
                                            }}> BATTLE_RESULT </div>
                                        )}
                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                            {isCompareMode ? 'WINNER_VERSION' : 'STRATEGIC_PERFORMANCE_VALUE'}
                                        </div>
                                        <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'baseline', gap: '0.25rem', lineHeight: 1, color: 'var(--color-text)' }}>
                                            {isCompareMode ? analysis.winner : (analysis.predictedCTR || '0.0%')}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                                            VERDICT: {isCompareMode ? analysis.winningVerdict : (analysis.ctrScore > 7 ? 'DESIGN_VIABILITY_CONFIRMED' : 'ITERATION_REQUIRED')}
                                        </div>

                                        <button 
                                            onClick={() => setIsOracleOpen(true)}
                                            style={{
                                                marginTop: '2rem',
                                                padding: '0.75rem',
                                                width: '100%',
                                                backgroundColor: 'transparent',
                                                color: 'var(--color-text)',
                                                border: '1px solid var(--color-text)',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = '#000'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                        >
                                            <MessageSquare size={14} /> [ CONSULT_THE_ORACLE ]
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {analysis && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                {/* Deep Metrics Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                                    <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', boxShadow: '10px 10px 0px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-text)', paddingBottom: '1rem' }}>
                                            <BarChart3 size={20} style={{ color: 'var(--color-text)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>VISUAL_VECTORS</span>
                                        </div>
                                        <MetricBar label="HUMAN_INTEREST" value={(typeof analysis.metrics?.faceDetails === 'number' ? analysis.metrics.faceDetails : 0)} delay={0.3} />
                                        <MetricBar label="CONTRAST_VALUE" value={(typeof analysis.metrics?.contrast === 'number' ? analysis.metrics.contrast : 0)} delay={0.4} />
                                        <MetricBar label="VIBRANCY_INDEX" value={(typeof analysis.metrics?.saturation === 'number' ? analysis.metrics.saturation : 0)} delay={0.5} />
                                        <MetricBar label="TYPO_HIERARCHY" value={(typeof analysis.metrics?.textEmphasis === 'number' ? analysis.metrics.textEmphasis : 0)} delay={0.6} />
                                    </div>

                                    <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', boxShadow: '10px 10px 0px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-text)', paddingBottom: '1rem' }}>
                                            <Eye size={20} style={{ color: 'var(--color-text)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>EDITORIAL_MAP</span>
                                        </div>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>HOOK_STRATEGY</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'Playfair Display', fontStyle: 'italic' }}>{analysis.heuristics?.hook}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>EYE_TRACKING</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.heuristics?.eyePath}</div>
                                        </div>
                                    </div>

                                    <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', boxShadow: '10px 10px 0px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-text)', paddingBottom: '1rem' }}>
                                            <Zap size={20} style={{ color: 'var(--color-text)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>DIRECTOR_FIXES</span>
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
                                </div>

                                <div style={{ border: '2px solid var(--color-text)', padding: '3rem', marginBottom: '4rem', boxShadow: '10px 10px 0px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>READER_FIT</div>
                                            <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{analysis.audience?.score}%</div>
                                        </div>
                                        <div style={{ borderLeft: '2px solid var(--color-text)', paddingLeft: '4rem' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>TARGET_DEMOGRAPHIC_PROFILE</div>
                                            <div style={{ fontSize: '1.25rem', color: 'var(--color-text)', lineHeight: 1.5, fontFamily: 'Playfair Display', fontStyle: 'italic' }}>{analysis.audience?.profile}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
                                    <div style={{ borderLeft: '4px solid var(--color-text)', paddingLeft: '2rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.1em' }}>COMPOSITION_NOTES</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.composition || 'STABLE_STRUCTURE'}</div>
                                    </div>
                                    <div style={{ borderLeft: '4px solid var(--color-text)', paddingLeft: '2rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.1em' }}>COLOR_PSYCHOLOGY</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.colorPsychology || 'NEUTRAL_PALETTE_INFLUENCE'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                    <motion.button
                                        whileHover={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
                                        onClick={handleExport}
                                        style={{
                                            padding: '1.5rem 2.5rem', backgroundColor: 'transparent', color: 'var(--color-text)',
                                            border: '2px solid var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                                            fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Download size={22} /> [ GENERATE_AUDIT_REPORT ]
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

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

            {/* Oracle Modal Overlay */}
            {isOracleOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 2000,
                        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        style={{
                            width: '100%', maxWidth: '900px', height: '80vh',
                            backgroundColor: 'black', border: '1px solid var(--color-accent)',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 0 50px rgba(57,255,20,0.1)'
                        }}
                    >
                        <OracleCore 
                            mode="standard" 
                            context={`Thumbnail Analysis Results: ${JSON.stringify(analysis)}`}
                            initialMessage="STRATEG_ORACLE_ACTIVE. Ask me anything about your thumbnail fixes."
                            onClose={() => setIsOracleOpen(false)}
                        />
                    </motion.div>
                </motion.div>
            )}
        </main>
    );
};

export default ThumbnailAnalyserPage;
