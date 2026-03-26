import { fetchOpenRouter } from '../utils/ai';

const VISION_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

const ANALYSIS_PHASES = [
    "INITIALIZING_VISION_KERNEL",
    "SCANNING_RGB_DISTRIBUTION",
    "EXTRACTING_FACIAL_METRICS",
    "HEURISTIC_CTR_SIMULATION",
    "AGGREGATING_AGENCY_VERDICT",
    "FINALIZING_PERFORMANCE_AUDIT"
];

const ThumbnailAnalyserPage = () => {
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

    const handleAnalyze = async () => {
        if (!image || isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        setIsThermal(false);

        try {
            const body = {
                model: VISION_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are a YouTube thumbnail expert and visual psychologist.
Analyze this thumbnail for conversion and attention flow.

NEW VISUAL SCAN REQUIREMENTS:
1. heatmap: Array of high-interest focal points. Each point needs {"x": 0-100, "y": 0-100, "label": "FACE/TEXT/EYE_CATCH", "intensity": 0.1-1.0}
2. eyePathPoints: Array of 3 key look-points in sequence: [{"x": 0-100, "y": 0-100}, ...] where index 0 is first look.

IMPORTANT: Your response MUST be a single, valid JSON object. 
- DO NOT use any markdown formatting.
- ESCAPE all double quotes within strings.

JSON STRUCTURE:
{
  "ctrScore": 85, 
  "composition": "...", 
  "metrics": {"faceDetails": 8, "contrast": 9, "saturation": 7, "textEmphasis": 6}, 
  "audience": {"score": 92, "profile": "..."}, 
  "heuristics": {"hook": "...", "eyePath": "...", "niche": "..."},
  "heatmap": [{"x": 20, "y": 45, "label": "FACE", "intensity": 0.9}, ...],
  "eyePathPoints": [{"x": 20, "y": 45}, {"x": 70, "y": 30}, {"x": 50, "y": 80}],
  "colorPsychology": "...", 
  "textReadability": "...", 
  "improvements": ["..."], 
  "verdict": "..."
}`
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Analyze this thumbnail. Provide precise X/Y coordinates for the heatmap and eye-tracking path. Return ONLY JSON.' },
                            { type: 'image_url', image_url: { url: image } }
                        ]
                    }
                ],
                temperature: 0.3
            };

            const data = await fetchOpenRouter(body, { title: 'RE-RENDER Thumbnail Analyser' });
            let raw = data.choices?.[0]?.message?.content || '';
            
            // Cleanup: remove markdown blocks if AI ignored instructions
            raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setFakeProgress(100);
                    setTimeout(() => {
                        setAnalysis(parsed);
                        setIsAnalyzing(false);
                    }, 500);
                } catch (pErr) {
                    console.error('JSON Parse failed after cleanup:', pErr);
                    const recovered = jsonMatch[0]
                        .replace(/\\"/g, '"') 
                        .replace(/"/g, '\\"') 
                        .replace(/\\":/g, '":') 
                        .replace(/,"\\"/g, ',"') 
                        .replace(/\{\\"/g, '{"') 
                        .replace(/\\"\}/g, '"}'); 
                    
                    try {
                        setAnalysis(JSON.parse(recovered));
                    } catch (f) {
                        alert("ANALYSIS_KERNEL_ERROR: Failed to parse AI response.");
                    }
                    setIsAnalyzing(false);
                }
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            alert("VISION_ENGINE_OFFLINE: High traffic on neural nodes. Please try again in a few moments.");
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
        <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 900, textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>{value}/10</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', border: '1px solid var(--color-border)' }}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 10) * 100}%` }}
                    transition={{ duration: 1, delay, ease: "easeOut" }}
                    style={{ height: '100%', backgroundColor: 'var(--color-accent)', boxShadow: '0 0 15px rgba(232,17,26,0.3)' }}
                />
            </div>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: 'var(--nav-height)' }}>
            <div className="no-print" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                <Link to="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: '3rem' }}>
                    <ArrowLeft size={14} /> BACK_TO_TOOLS
                </Link>

                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '1rem', letterSpacing: '0.2em', fontWeight: 900 }}>
                        AI_VISION_MODULE // V2.0.4
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>
                        THUMBNAIL<br /><span style={{ color: 'var(--color-accent)' }}>ENGINE</span>
                    </h1>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                
                {!preview ? (
                    <motion.div
                        whileHover={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        onClick={() => fileRef.current?.click()}
                        style={{
                            border: '1px solid var(--color-border)', padding: '6rem 2rem',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={24} style={{ color: 'var(--color-accent)' }} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                            INSERT_MEDIA
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', opacity: 0.6 }}>
                            SUPPORTED: JPG, PNG, WEBP // MAX: 10MB
                        </div>
                    </motion.div>
                ) : (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                        <div style={{ border: '1px solid var(--color-border)', overflow: 'hidden', backgroundColor: '#000', display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <img 
                                    src={preview} 
                                    alt="Thumbnail preview" 
                                    style={{ 
                                        width: '100%', 
                                        display: 'block', 
                                        opacity: isAnalyzing ? 0.3 : 1, 
                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                        filter: isThermal ? 'contrast(1.5) saturate(1.5) hue-rotate(-10deg) brightness(0.8)' : 'none'
                                    }} 
                                />
                                
                                <ThermalOverlay heatmap={analysis?.heatmap} active={isThermal && !isAnalyzing} />

                                {isAnalyzing && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                                        <Cpu size={32} className="spin" style={{ color: 'var(--color-accent)' }} />
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-accent)', letterSpacing: '0.1em' }}>
                                            {ANALYSIS_PHASES[currentPhase]}
                                        </div>
                                        <div style={{ width: '200px', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                                            <motion.div 
                                                animate={{ width: `${fakeProgress}%` }}
                                                style={{ height: '100%', backgroundColor: 'var(--color-accent)', position: 'absolute', left: 0 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {analysis && (
                                    <button 
                                        onClick={() => setIsThermal(!isThermal)}
                                        style={{
                                            padding: '1rem',
                                            backgroundColor: isThermal ? 'var(--color-accent)' : 'transparent',
                                            color: isThermal ? '#000' : 'var(--color-text)',
                                            border: '1px solid var(--color-accent)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.7rem',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Zap size={16} fill={isThermal ? 'currentColor' : 'none'} />
                                        {isThermal ? 'DISABLE_THERMAL_SCAN' : 'ACTIVATE_THERMAL_SCAN'}
                                    </button>
                                )}

                                <button onClick={handleAnalyze} disabled={isAnalyzing} style={{
                                    padding: '1.25rem', backgroundColor: isAnalyzing ? 'var(--color-border)' : 'var(--color-accent)',
                                    color: '#000', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                                    fontWeight: 900, cursor: isAnalyzing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    transition: 'all 0.2s'
                                }}>
                                    {isAnalyzing ? <><RefreshCw size={18} className="spin" /> COMPUTING...</> : <><Eye size={18} /> RUN_DIAGNOSTICS</>}
                                </button>
                                <button onClick={() => { setPreview(null); setImage(null); setAnalysis(null); }} disabled={isAnalyzing} style={{
                                    padding: '1rem', backgroundColor: 'transparent', color: 'var(--color-text-secondary)',
                                    border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', cursor: 'pointer',
                                    opacity: isAnalyzing ? 0.5 : 1
                                }}>
                                    REPLACE_ASSET
                                </button>

                                <AnimatePresence>
                                    {analysis && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ marginTop: 'auto', border: '1px solid var(--color-accent)', padding: '2rem', backgroundColor: 'rgba(232,17,26,0.03)' }}
                                        >
                                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem', color: 'var(--color-accent)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>PERFORMANCE_INDEX (0-30%)</div>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'baseline', gap: '0.25rem', lineHeight: 1 }}>
                                                {Math.min(analysis.ctrScore, 30)}<span style={{ fontSize: '1.5rem', color: 'var(--color-accent)', opacity: 0.5 }}>%</span>
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text)', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900, textTransform: 'uppercase' }}>
                                                STATUS: {analysis.ctrScore > 20 ? 'ELITE_REACH' : analysis.ctrScore > 10 ? 'HIGH_CONVERSION' : 'NEEDS_OPTIMIZATION'}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {analysis && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                {/* Deep Metrics Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                                    <div style={{ border: '1px solid var(--color-border)', padding: '2.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <BarChart3 size={20} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>VISUAL_VECTORS</span>
                                        </div>
                                        <MetricBar label="FACIAL_DETAIL" value={analysis.metrics?.faceDetails || 0} delay={0.3} />
                                        <MetricBar label="CONTRAST_RATIO" value={analysis.metrics?.contrast || 0} delay={0.4} />
                                        <MetricBar label="COLOR_VIBRANCY" value={analysis.metrics?.saturation || 0} delay={0.5} />
                                        <MetricBar label="TEXT_HIERARCHY" value={analysis.metrics?.textEmphasis || 0} delay={0.6} />
                                    </div>

                                    <div style={{ border: '1px solid var(--color-border)', padding: '2.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <Eye size={20} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>STRATEGIC_MAPPING</span>
                                        </div>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>HOOK_DRIVER</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>{analysis.heuristics?.hook}</div>
                                        </div>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>EYE_TRACKING_PATH</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{analysis.heuristics?.eyePath}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>NICHE_CONTEXT</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{analysis.heuristics?.niche}</div>
                                        </div>
                                    </div>

                                    <div style={{ border: '1px solid var(--color-border)', padding: '2.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                            <Zap size={20} style={{ color: 'var(--color-accent)' }} />
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}>AGENCY_FIXES</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            {analysis.improvements?.map((imp, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 900 }}>{String(i + 1).padStart(2, '0')}</span>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{imp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ border: '1px solid var(--color-border)', padding: '2.5rem', marginBottom: '4rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>AUDIENCE_MATCH</div>
                                            <div style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>{analysis.audience?.score}%</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>RELEVANCE_COEFFICIENT</div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '4rem' }}>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>IDEAL_VIEWER_PROFILE</div>
                                            <div style={{ fontSize: '1.1rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{analysis.audience?.profile}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                                    <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '2rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.1em' }}>COMPOSITION_LOG</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{analysis.composition}</div>
                                    </div>
                                    <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '2rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.1em' }}>PSYCHOLOGY_MAPPING</div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{analysis.colorPsychology}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <motion.button 
                                        whileHover={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
                                        onClick={handleExport} 
                                        style={{
                                            padding: '1.5rem 4rem', backgroundColor: 'transparent', color: 'var(--color-text)',
                                            border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                                            fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <Download size={20} /> GENERATE_AUDIT_PDF
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Print Friendly Template */}
            <div id="print-area" className="print-only" style={{ padding: '4rem', backgroundColor: '#fff', color: '#000', minHeight: '100vh', fontFamily: 'system-ui' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #000', paddingBottom: '2.5rem', marginBottom: '3.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>RE-RENDER</h1>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.6, marginTop: '0.5rem', letterSpacing: '0.1em' }}>AGENCY // PERFORMANCE AUDIT</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, backgroundColor: '#000', color: '#fff', padding: '0.2rem 0.5rem', display: 'inline-block' }}>CONFIDENTIAL</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}>REPORT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>DATE: {new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                {preview && (
                    <div style={{ marginBottom: '4rem' }}>
                        <img src={preview} alt="Thumbnail" style={{ width: '100%', height: '350px', objectFit: 'cover', border: '1px solid #eee' }} />
                    </div>
                )}

                {analysis && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', marginBottom: '4rem' }}>
                            <div>
                                <div style={{ marginBottom: '3rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e8111a', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>PERFORMANCE PROJECTION</div>
                                    <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1 }}>{Math.min(analysis.ctrScore, 30)}%</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.5rem', textTransform: 'uppercase' }}>ESTIMATED CHANNEL CTR</div>
                                </div>

                                <div style={{ marginBottom: '3rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e8111a', marginBottom: '2rem' }}>TECHNICAL PARAMETERS</div>
                                    {Object.entries(analysis.metrics || {}).map(([key, val]) => (
                                        <div key={key} style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                                                <span>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                                                <span>{val}/10</span>
                                            </div>
                                            <div style={{ height: '5px', backgroundColor: '#f0f0f0' }}>
                                                <div style={{ height: '100%', width: `${val * 10}%`, backgroundColor: '#000' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div style={{ marginBottom: '3rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e8111a', marginBottom: '1rem' }}>RE-RENDER RECOMMENDATIONS</div>
                                    {analysis.improvements?.map((imp, i) => (
                                        <div key={i} style={{ marginBottom: '1rem', fontSize: '0.95rem', lineHeight: 1.5, paddingLeft: '2rem', position: 'relative', fontWeight: 500 }}>
                                            <span style={{ position: 'absolute', left: 0, fontWeight: 900, color: '#e8111a' }}>{i + 1}.</span>
                                            {imp}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ border: '2px solid #000', padding: '2rem', backgroundColor: '#fafafa' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e8111a', marginBottom: '0.75rem' }}>AGENCY VERDICT</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.5, fontStyle: 'italic' }}>"{analysis.verdict}"</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', borderTop: '1px solid #eee', paddingTop: '4rem' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e8111a', marginBottom: '1rem' }}>AUDIENCE PROFILING</div>
                                <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{analysis.audience?.profile}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#e8111a', marginBottom: '1rem' }}>STRATEGIC HEURISTICS</div>
                                <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    <strong>Hook Type:</strong> {analysis.heuristics?.hook}<br />
                                    <strong>Eye Path:</strong> {analysis.heuristics?.eyePath}<br />
                                    <strong>Niche Status:</strong> {analysis.heuristics?.niche}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '5rem', borderTop: '1px solid #eee', position: 'absolute', bottom: '2rem', left: '4rem', right: '4rem', fontSize: '0.7rem', opacity: 0.5, textAlign: 'center', letterSpacing: '0.1em' }}>
                    PROCESSED BY RE-RENDER GENERATIVE VISION ENGINE // FOR INTERNAL GROWTH STRATEGY ONLY
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; }
                    @page { margin: 1cm; }
                }
                
                @media screen {
                    .print-only { display: none !important; }
                }
            `}</style>
        </main>
    );
};

export default ThumbnailAnalyserPage;
