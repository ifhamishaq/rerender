import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, RefreshCw, Eye, BarChart3, Zap, Download, FileText, Check, Cpu } from 'lucide-react';
import { fetchOpenRouter, AI_COSTS } from '../utils/ai';
import { useAuth } from '../context/AuthContext';

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
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [fakeProgress, setFakeProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isThermal, setIsThermal] = useState(false);
    
    const fileRef = useRef(null);
    const progressInterval = useRef(null);

    // Sub-component for Thermal Visuals
    const ThermalOverlay = ({ heatmap, active }) => {
        if (!active || !heatmap) return null;
        return (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
                <defs>
                    <filter id="thermal-glow">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {heatmap.map((point, i) => (
                    <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: point.intensity || 0.8, scale: 1 }} transition={{ delay: i * 0.2 }}>
                        <circle 
                            cx={`${point.x}%`} 
                            cy={`${point.y}%`} 
                            r={40 + (point.intensity * 20)} 
                            fill="url(#thermal-gradient)"
                            filter="url(#thermal-glow)"
                            style={{ opacity: 0.6 }}
                        />
                        <text 
                            x={`${point.x}%`} 
                            y={`${point.y - 5}%`} 
                            textAnchor="middle" 
                            style={{ fill: '#fff', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 900, textShadow: '0 0 10px #f00' }}
                        >
                            {point.label}
                        </text>
                    </motion.g>
                ))}
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
                        d={`M ${analysis.eyePathPoints.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
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

    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
            setPreview(reader.result);
            setAnalysis(null);
            setIsThermal(false);
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

        // NO COST FOR ANALYSER AS IT USES FREE MODELS
        setIsAnalyzing(true);
        setAnalysis(null);
        setIsThermal(false);

        try {
            // STEP 1: VISION SCAN (NEMOTRON)
            const visionBody = {
                model: 'nvidia/nemotron-nano-12b-v2-vl:free',
                messages: [
                    {
                        role: 'system',
                        content: `Extract raw visual data from this thumbnail. Focus on:
                        1. heatmap: Array of high-interest focal points {"x": 0-100, "y": 0-100, "label": "FACE/TEXT/ETC", "intensity": 0.1-1.0}
                        2. eyePathPoints: Sequence of 3-4 look-points.
                        3. palette: 3-5 primary HEX colors.
                        4. raw_observations: Contrast, saturation, face detection details.
                        Return ONLY valid JSON.`
                    },
                    {
                        role: 'user',
                        content: [{ type: 'image_url', image_url: { url: image } }]
                    }
                ]
            };

            let visionRes;
            try {
                visionRes = await fetchOpenRouter(visionBody, { title: 'RE-RENDER Vision Scan' });
            } catch (err) {
                // FALLBACK: Try Gemini Flash 2.0 Free if Nemotron fails
                console.warn('Vision primary failed, trying Gemini fallback...');
                visionBody.model = 'google/gemini-2.0-flash-exp:free';
                visionRes = await fetchOpenRouter(visionBody, { title: 'RE-RENDER Vision Fallback' });
            }

            const visionContent = (visionRes.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
            const visionData = JSON.parse(visionContent);

            // COOL DOWN: Small delay between vision and editorial to prevent 429 on single key
            await new Promise(res => setTimeout(res, 1500));

            // STEP 2: EDITORIAL REFINEMENT (LLAMA 3.3 70B)
            const editorialBody = {
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are an elite YouTube Growth Consultant and Editorial Auditor.
                        Analyze the following raw visual data from a thumbnail and generate a high-fidelity "Editorial Audit Report".
                        
                        CRITICAL INSTRUCTIONS FOR CTR ESTIMATION:
                        - Be VERY STRICT and PESSIMISTIC.
                        - Most average thumbnails get 1-3%. Good ones 4-5%. Only ELITE/VIRAL ones exceed 7%.
                        - Never suggest 20% or 30%. That is impossible in modern YouTube.
                        - Your "ctrScore" (0-10) should be a professional quality rating.
                        - Your "predictedCTR" should be a realistic percentage (e.g., "3.2%").
                        
                        RAW_DATA: ${JSON.stringify(visionData)}
 
                        YOUR OUTPUT MUST BE A SINGLE JSON OBJECT WITH THESE FIELDS:
                        {
                          "ctrScore": 0-10,
                          "predictedCTR": "string (e.g. 2.4%)",
                          "composition": "Professional analysis of balance and weights...",
                          "metrics": {"faceDetails": 1-10, "contrast": 1-10, "saturation": 1-10, "textEmphasis": 1-10},
                          "palette": ["#HEX1", "#HEX2", "#HEX3"],
                          "accessibility": {"score": 0-100, "notes": "..."},
                          "psychology": {"trigger": "CURIOSITY/FOMO/AUTHORITY", "notes": "..."},
                          "audience": {"score": 0-100, "profile": "..."},
                          "heuristics": {"hook": "...", "eyePath": "...", "niche": "..."},
                          "heatmap": (passthrough from visionData),
                          "eyePathPoints": (passthrough from visionData),
                          "colorPsychology": "...",
                          "textReadability": "...",
                          "improvements": ["Specific technical fix 1", "Specific technical fix 2", "..."],
                          "verdict": "Final editorial judgment (high impact)..."
                        }
                        Return ONLY valid JSON.`
                    }
                ],
                temperature: 0.5
            };

            let editorialRes;
            try {
                editorialRes = await fetchOpenRouter(editorialBody, { title: 'RE-RENDER Editorial Audit' });
            } catch (err) {
                // FALLBACK: Try DeepSeek R1 Free if Llama 3.3 fails
                console.warn('Editorial primary failed, trying DeepSeek fallback...');
                editorialBody.model = 'deepseek/deepseek-r1:free';
                editorialRes = await fetchOpenRouter(editorialBody, { title: 'RE-RENDER Editorial Fallback' });
            }

            let finalContent = (editorialRes.choices?.[0]?.message?.content || '');
            finalContent = finalContent.replace(/```json|```/g, '').trim();
            
            const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const finalAnalysis = JSON.parse(jsonMatch[0]);
                setFakeProgress(100);
                setTimeout(() => {
                    setAnalysis(finalAnalysis);
                    setIsAnalyzing(false);
                }, 500);
            }
        } catch (err) {
            console.error('ANALYSIS_FAIL:', err);
            const isRateLimit = err.message.includes('429') || err.message.toLowerCase().includes('rate limit');
            const isCongested = err.message.toLowerCase().includes('congested') || err.message.toLowerCase().includes('overloaded');
            
            let userMsg = `ANALYSIS_FAIL: ${err.message}`;
            if (isRateLimit || isCongested) {
                userMsg = "SYSTEM_CONGESTION: All free neural nodes are currently at capacity. Please wait 30 seconds and try again (No credits used).";
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
                        THUMBNAIL<br />
                        <span style={{ 
                            fontFamily: 'Playfair Display', 
                            fontStyle: 'italic', 
                            fontWeight: 400,
                            color: 'var(--color-accent)'
                        }}>AUDIT_UNIT</span>
                    </h1>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                
                {!preview ? (
                    <motion.div
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        onClick={() => fileRef.current?.click()}
                        style={{
                            border: '2px solid var(--color-text)', padding: '6rem 2rem',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Upload size={32} style={{ color: 'var(--color-text)' }} />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                            [ INSERT_ASSET_FOR_REVIEW ]
                        </div>
                    </motion.div>
                ) : (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: isAnalyzing ? '1fr' : '1.5fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
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
                                    alt="Thumbnail preview" 
                                    style={{ 
                                        width: '100%', 
                                        display: 'block', 
                                        opacity: isAnalyzing ? 0.2 : 1, 
                                        transition: 'all 0.8s ease'
                                    }} 
                                />
                                
                                <ThermalOverlay heatmap={analysis?.heatmap} active={isThermal && !isAnalyzing} />

                                {isAnalyzing && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', zIndex: 10 }}>
                                        <Cpu size={48} className="spin" style={{ color: 'var(--color-bg)' }} />
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-bg)', letterSpacing: '0.2em' }}>
                                            {ANALYSIS_PHASES[currentPhase]}
                                        </div>
                                        <div style={{ width: '250px', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                                            <motion.div 
                                                animate={{ width: `${fakeProgress}%` }}
                                                style={{ height: '100%', backgroundColor: 'var(--color-bg)', position: 'absolute', left: 0 }}
                                            />
                                        </div>
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
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ marginTop: 'auto', border: '2.5px solid var(--color-text)', padding: '2rem', backgroundColor: 'var(--color-surface)' }}
                                        >
                                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>PREDICTED_CTR_ESTIMATE</div>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'baseline', gap: '0.25rem', lineHeight: 1 }}>
                                                {analysis.predictedCTR || '0.0%'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                                                VERDICT: {analysis.ctrScore > 7 ? 'ELITE_DIRECTOR_CUT' : 'CONVERSION_LOCKED'}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {analysis && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {/* Deep Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                            <div style={{ border: '2px solid var(--color-text)', padding: '2.5rem', boxShadow: '10px 10px 0px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--color-text)', paddingBottom: '1rem' }}>
                                    <BarChart3 size={20} style={{ color: 'var(--color-text)' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>VISUAL_VECTORS</span>
                                </div>
                                <MetricBar label="HUMAN_INTEREST" value={analysis.metrics?.faceDetails || 0} delay={0.3} />
                                <MetricBar label="CONTRAST_VALUE" value={analysis.metrics?.contrast || 0} delay={0.4} />
                                <MetricBar label="VIBRANCY_INDEX" value={analysis.metrics?.saturation || 0} delay={0.5} />
                                <MetricBar label="TYPO_HIERARCHY" value={analysis.metrics?.textEmphasis || 0} delay={0.6} />
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
                                    {analysis.improvements?.map((imp, i) => (
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
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.composition}</div>
                            </div>
                            <div style={{ borderLeft: '4px solid var(--color-text)', paddingLeft: '2rem' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.1em' }}>COLOR_PSYCHOLOGY</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.colorPsychology}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <motion.button 
                                whileHover={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
                                onClick={handleExport} 
                                style={{
                                    padding: '1.5rem 4rem', backgroundColor: 'transparent', color: 'var(--color-text)',
                                    border: '2px solid var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                                    fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Download size={22} /> [ GENERATE_AUDIT_REPORT ]
                            </motion.button>
                        </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Print Friendly Template */}
            <div id="print-area" className="print-only" style={{ padding: '4rem', backgroundColor: '#F8F6F1', color: '#000', minHeight: '100vh', fontFamily: 'var(--font-sans)', position: 'relative' }}>
                {/* Background Watermark */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '15rem', fontWeight: 900, color: 'rgba(0,0,0,0.03)', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 0, fontFamily: 'var(--font-display)' }}>
                    RE-RENDER
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '8px solid #000', paddingBottom: '2.5rem', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '0.5rem', color: '#E8111A' }}>VOL. 01 // CRITICAL_SYSTEMS_AUDIT</div>
                            <h1 style={{ fontSize: '5rem', fontWeight: 900, margin: 0, fontFamily: 'var(--font-display)', lineHeight: 0.8, letterSpacing: '-0.05em' }}>
                                THUMBNAIL<br/>
                                <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400 }}>AUDIT_REPORT</span>
                            </h1>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 900, border: '4px solid #000', padding: '0.5rem 1rem', display: 'inline-block', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
                                {analysis?.ctrScore > 20 ? 'CERTIFIED_HIGH_REACH' : 'REVISION_STRATEGY'}
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>ISSUED: {new Date().toLocaleDateString()}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.6 }}>SCAN_ID: RR-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                        </div>
                    </div>

                    {preview && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', marginBottom: '5rem' }}>
                            <div style={{ border: '4px solid #000', padding: '0.5rem', backgroundColor: '#fff' }}>
                                <img src={preview} alt="Thumbnail" style={{ width: '100%', height: '420px', objectFit: 'cover' }} />
                                <div style={{ padding: '1.5rem', borderTop: '2px solid #000', backgroundColor: '#F8F6F1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900 }}>ASSET_PREVIEW_V2.0</div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ border: '2px solid #000', padding: '2.5rem', backgroundColor: '#fff' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>PSYCHOLOGICAL_HOOK</div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Playfair Display', fontStyle: 'italic', margin: 0, lineHeight: 1.1 }}>
                                        "{analysis?.psychology?.trigger || 'NEURAL_PATTERN'}"
                                    </h3>
                                    <p style={{ fontSize: '0.95rem', color: '#444', marginTop: '1rem', lineHeight: 1.5 }}>
                                        {analysis?.psychology?.notes}
                                    </p>
                                </div>
                                <div style={{ border: '2px solid #000', padding: '2.5rem', backgroundColor: '#fff' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>ACCESSIBILITY_AUDIT</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{analysis?.accessibility?.score}%</div>
                                    <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.5rem', lineHeight: 1.4 }}>
                                        {analysis?.accessibility?.notes}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '5rem', marginBottom: '5rem' }}>
                                <div>
                                    <div style={{ marginBottom: '4rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', borderBottom: '4px solid #000', paddingBottom: '0.5rem' }}>RETENTION_ESTIMATE</div>
                                        <div style={{ fontSize: '8rem', fontWeight: 900, lineHeight: 0.8, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>{analysis.predictedCTR || '0.0%'}</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#E8111A' }}>PROJECTED_CONVERSION_RATE</div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '2rem', fontFamily: 'var(--font-mono)', borderBottom: '4px solid #000', paddingBottom: '0.5rem' }}>EDITORIAL_METRICS</div>
                                        {Object.entries(analysis.metrics || {}).map(([key, val]) => (
                                            <div key={key} style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 900, marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>
                                                    <span>{key.toUpperCase().replace(/([A-Z])/g, '_$1')}</span>
                                                    <span>{val}/10</span>
                                                </div>
                                                <div style={{ height: '8px', backgroundColor: '#eee', border: '1.5px solid #000', padding: '1px' }}>
                                                    <div style={{ height: '100%', width: `${val * 10}%`, backgroundColor: '#000' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ marginBottom: '4rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', borderBottom: '4px solid #000', paddingBottom: '0.5rem' }}>TECHNICAL_CORRECTIONS</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {analysis.improvements?.map((imp, i) => (
                                                <div key={i} style={{ borderLeft: '6px solid #000', paddingLeft: '2rem', fontSize: '1.2rem', lineHeight: 1.4, fontWeight: 500 }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '0.4rem', opacity: 0.5 }}>ISSUE_{i+1}</div>
                                                    {imp}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ border: '4px solid #000', padding: '3.5rem', backgroundColor: '#fff', position: 'relative', boxShadow: '15px 15px 0px rgba(0,0,0,0.05)' }}>
                                        <div style={{ position: 'absolute', top: '-1rem', left: '2rem', backgroundColor: '#000', color: '#fff', padding: '0.3rem 1.25rem', fontSize: '0.75rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>DIRECTOR_VERDICT</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.4, fontFamily: 'Playfair Display', fontStyle: 'italic' }}>"{analysis.verdict}"</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ borderTop: '4px solid #000', paddingTop: '4rem', marginTop: '4rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: '#666' }}>COMPOSITION_BALANCE_REPORT</div>
                                <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{analysis?.composition}</p>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', color: '#666' }}>COLOR_PSYCHOLOGY_STRATEGY</div>
                                <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{analysis?.colorPsychology}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '4rem', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '0.8rem', fontWeight: 900, textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.3rem', opacity: 0.3 }}>
                    RE-RENDER_LAB // NEURAL_ASSET_AUDIT // V2.0 // CONFIDENTIAL
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
                        margin: 1.5cm; 
                        size: portrait;
                    }

                    main { padding-top: 0 !important; }
                }
                
                @media screen {
                    .print-only { display: none !important; }
                }
            `}</style>
        </main>
    );
};

export default ThumbnailAnalyserPage;
