import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Sparkles, ArrowRight, Video, Image as ImageIcon, Eye, FileText, 
    Zap, Layers, Play, CheckCircle2, Cpu, BarChart3, Terminal, Check
} from 'lucide-react';
import Hero from '../components/Hero';
import StickySidebar from '../components/StickySidebar';
import PricingFAQ from '../components/PricingFAQ';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [fakeViewers] = useState(() => Math.floor(Math.random() * 18) + 14);

    return (
        <main style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', position: 'relative' }}>
            {/* ── Sticky Quick-Nav ── */}
            <StickySidebar items={[
                { label: 'START', targetId: 'top' },
                { label: 'SUITE', targetId: 'suite' },
                { label: 'PIPELINE', targetId: 'pipeline' },
                { label: 'ORACLE', targetId: 'oracle' },
                { label: 'CREDITS', targetId: 'credits' },
                { label: 'FAQ', targetId: 'faq' }
            ]} />

            <div id="top" />

            {/* ── HERO SECTION (Featuring /hero.gif) ── */}
            <Hero />

            {/* ── 01. THE CREATOR OS SUITE (BENTO GRID WITH GIFS) ── */}
            <section id="suite" style={{ padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)', maxWidth: '1360px', margin: '0 auto' }}>
                <div style={{ marginBottom: '4rem' }}>
                    <div className="section-label">01 — THE CREATOR OS SUITE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '880px' }}>
                        <h2 style={{ 
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
                            fontWeight: 900, 
                            lineHeight: 1, 
                            letterSpacing: '-0.03em', 
                            textTransform: 'uppercase',
                            margin: 0 
                        }}>
                            AN ENTIRE PRODUCTION HOUSE <br />
                            <span style={{ color: 'var(--color-accent)' }}>IN YOUR BROWSER.</span>
                        </h2>
                        <p style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', 
                            color: 'var(--color-text-secondary)', 
                            lineHeight: 1.7,
                            margin: 0
                        }}>
                            Stop bouncing between 10 different subscription apps. RE-RENDER unites the complete content lifecycle—from raw concept and cinematic storyboards to CTR auditing and multi-platform distribution.
                        </p>
                    </div>
                </div>

                {/* Bento Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                    gap: '2rem' 
                }}>
                    
                    {/* Card 1: Oracle AI Director */}
                    <motion.div 
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-raised)'
                        }}
                    >
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '190px', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img 
                                src="/service-video.gif" 
                                alt="Oracle Director" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', border: '1px solid rgba(57,255,20,0.3)' }}>
                                ORACLE_CORE
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Sparkles size={16} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                    DIRECTOR & SCRIPTING
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Aesthetic Oracle</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Your 24/7 creative director. Formulates irresistible 10-second opening hooks, outlines camera direction, and writes scripts engineered for maximum audience retention.
                            </p>
                        </div>

                        <Link 
                            to="/lab/oracle-workspace" 
                            style={{ 
                                marginTop: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                color: 'var(--color-text)', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Launch Oracle Workspace <ArrowRight size={15} color="var(--color-accent)" />
                        </Link>
                    </motion.div>

                    {/* Card 2: Thumbnail Analyser */}
                    <motion.div 
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-raised)'
                        }}
                    >
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '190px', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img 
                                src="/service-design.gif" 
                                alt="Thumbnail Analyser" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                                VISION_CTR
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Eye size={16} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                    PACKAGING & AUDITING
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Thumbnail Analyser</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Never post a weak thumbnail again. Multimodal AI scores your packaging S/A/B/C/D, evaluates eye-tracking focal points, and provides a neural prompt to fix flaws instantly.
                            </p>
                        </div>

                        <Link 
                            to="/lab/thumbnail-analyser" 
                            style={{ 
                                marginTop: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                color: 'var(--color-text)', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Audit Your Thumbnail <ArrowRight size={15} color="var(--color-accent)" />
                        </Link>
                    </motion.div>

                    {/* Card 3: Storyboard Pre-Vis Engine */}
                    <motion.div 
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-raised)'
                        }}
                    >
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '190px', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img 
                                src="/service-3d.gif" 
                                alt="Storyboard Engine" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.3)' }}>
                                PRE_VIS
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Layers size={16} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                    DIRECTOR'S PITCH DECK
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Storyboard Lab</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Turn any script into a full production storyboard. Generates camera movements, lighting moods, character emotions, and AI visual sketches exportable as a clean PDF.
                            </p>
                        </div>

                        <Link 
                            to="/lab/oracle-workspace" 
                            style={{ 
                                marginTop: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                color: 'var(--color-text)', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Open Storyboard Studio <ArrowRight size={15} color="var(--color-accent)" />
                        </Link>
                    </motion.div>

                    {/* Card 4: Viral News & Short-Form Generator */}
                    <motion.div 
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-raised)'
                        }}
                    >
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '190px', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img 
                                src="/service-web.gif" 
                                alt="Auto News Generator" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                                VIRAL_FEED
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Zap size={16} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                    REAL-TIME VIRAL HOOKS
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Auto News Generator</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Pulls live trending headlines and transforms them into viral social media cards with punchy text hooks, bold highlight typography, and auto-generated image backgrounds.
                            </p>
                        </div>

                        <Link 
                            to="/lab/news-generator" 
                            style={{ 
                                marginTop: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                color: 'var(--color-text)', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Generate Viral News Card <ArrowRight size={15} color="var(--color-accent)" />
                        </Link>
                    </motion.div>

                    {/* Card 5: Multi-Platform Caption Lab */}
                    <motion.div 
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-raised)'
                        }}
                    >
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '190px', border: '1px solid var(--color-border)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(57,255,20,0.1) 0%, rgba(0,0,0,0.4) 100%)' }}>
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✍️</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-accent)' }}>YOUTUBE · TIKTOK · IG · X · LINKEDIN</div>
                            </div>
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', border: '1px solid rgba(57,255,20,0.3)' }}>
                                COPY_ENGINE
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <FileText size={16} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                    ENGAGEMENT & DISTRIBUTION
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Caption Writer</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Craft tone-tailored captions that convert passive scrollers into followers. Formatted with curated hashtags and tailored for high algorithmic engagement across every major platform.
                            </p>
                        </div>

                        <Link 
                            to="/lab/caption-writer" 
                            style={{ 
                                marginTop: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                color: 'var(--color-text)', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Write Post Captions <ArrowRight size={15} color="var(--color-accent)" />
                        </Link>
                    </motion.div>

                    {/* Card 6: Wallpaper Lab & Arcade */}
                    <motion.div 
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-raised)'
                        }}
                    >
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '190px', border: '1px solid var(--color-border)', position: 'relative' }}>
                            <img 
                                src="/arcade.gif" 
                                alt="Arcade & Utilities" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
                                ASSET_ARCADE
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <Terminal size={16} color="var(--color-accent)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                                    GENERATIVE ASSETS & UTILITIES
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Wallpaper Lab & Arcade</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Render custom 4K background textures, curate color palettes with Palette Picker, and sharpen your aesthetic reflexes in the creative playground.
                            </p>
                        </div>

                        <Link 
                            to="/tools" 
                            style={{ 
                                marginTop: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                color: 'var(--color-text)', 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                textDecoration: 'none'
                            }}
                        >
                            Explore All Utilities <ArrowRight size={15} color="var(--color-accent)" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── 02. THE 3-STEP CREATOR PIPELINE ── */}
            <section id="pipeline" style={{ 
                padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)', 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
                    <div className="section-label">02 — THE PRODUCTION PIPELINE</div>
                    
                    <h2 style={{ 
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
                        fontWeight: 900, 
                        lineHeight: 1, 
                        letterSpacing: '-0.03em', 
                        textTransform: 'uppercase',
                        marginBottom: '3rem'
                    }}>
                        FROM RAW IDEA TO <span style={{ color: 'var(--color-accent)' }}>PUBLISHED HIT.</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        
                        {/* Step 1 */}
                        <div style={{ 
                            padding: '2rem', 
                            borderRadius: '20px', 
                            backgroundColor: 'var(--color-surface)', 
                            border: '1px solid var(--color-border)',
                            position: 'relative'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', opacity: 0.3, marginBottom: '1rem' }}>
                                01
                            </div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>Ideate & Retention-Engineer</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Consult Oracle with your topic or concept. Instantly receive psychological retention hooks, viral title formulas, and structured script blocks that keep viewers glued.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div style={{ 
                            padding: '2rem', 
                            borderRadius: '20px', 
                            backgroundColor: 'var(--color-surface)', 
                            border: '1px solid var(--color-border)',
                            position: 'relative'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', opacity: 0.3, marginBottom: '1rem' }}>
                                02
                            </div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>Pre-Visualize & Storyboard</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Let the Storyboard Engine translate your script into cinematic scenes. Plan camera angles, lighting states, and visual cues before turning on the camera.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div style={{ 
                            padding: '2rem', 
                            borderRadius: '20px', 
                            backgroundColor: 'var(--color-surface)', 
                            border: '1px solid var(--color-border)',
                            position: 'relative'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', opacity: 0.3, marginBottom: '1rem' }}>
                                03
                            </div>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>Audit Packaging & Publish</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Run your thumbnail through the multimodal vision auditor to predict CTR, fix weaknesses, and generate tailored platform captions for high algorithmic distribution.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 03. ORACLE SPOTLIGHT ── */}
            <section id="oracle" style={{ padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)', maxWidth: '1360px', margin: '0 auto' }}>
                <div style={{ 
                    borderRadius: '28px', 
                    border: '1px solid var(--color-border)', 
                    backgroundColor: 'var(--color-surface)', 
                    padding: 'clamp(2rem, 6vw, 4rem)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '3rem',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-raised)'
                }}>
                    <div>
                        <div className="section-label" style={{ marginBottom: '1.5rem' }}>03 — THE INTELLIGENCE ENGINE</div>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
                            MEET ORACLE. <br />
                            <span style={{ color: 'var(--color-accent)' }}>BUILT FOR PRODUCTION.</span>
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                            Oracle isn't another generic chatbot. It was trained to think like an uncompromising creative director. Direct, authoritative, and focused solely on making content that dominates feeds.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2.5rem' }}>
                            {[
                                "Understands retention psychology & opening 3-second hooks",
                                "Zero filler phrases — outputs high-density creative directions",
                                "Supports image inputs for visual critique & design improvement",
                                "Generates scene-by-scene storyboard grids with PDF exports"
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                                    <Check size={16} color="var(--color-accent)" strokeWidth={3} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate('/lab/oracle-workspace')}
                            className="skeuo-button"
                            style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}
                        >
                            OPEN ORACLE WORKSPACE <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Interactive UI Mockup */}
                    <div style={{ 
                        borderRadius: '20px', 
                        border: '1px solid var(--color-border)', 
                        backgroundColor: 'var(--color-bg)', 
                        padding: '1.5rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text)' }}>ORACLE 2.0 // DIRECTIVE</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text)' }}>
                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(128,128,128,0.08)', alignSelf: 'flex-end', maxWidth: '85%' }}>
                                Give me a viral hook for a video on how AI will change filmmaking.
                            </div>
                            <div style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(57,255,20,0.2)', background: 'rgba(57,255,20,0.03)', alignSelf: 'flex-start', maxWidth: '95%', lineHeight: 1.6 }}>
                                <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>THE HOOK:</span><br />
                                "In 24 months, a single teenager will win an Oscar without ever touching a camera. Here's how Hollywood is secretly preparing for it."<br /><br />
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>RETENTION RATING: 94% · PSYCHOLOGICAL CURIOSITY GAP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 04. FAIR CREDIT ARCHITECTURE ── */}
            <section id="credits" style={{ 
                padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
                borderTop: '1px solid var(--color-border)'
            }}>
                <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
                    <div className="section-label">04 — FAIR CREDIT ARCHITECTURE</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem', marginBottom: '3.5rem' }}>
                        <div style={{ maxWidth: '700px' }}>
                            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>
                                ZERO SUBSCRIPTION LOCK-IN. <br />
                                <span style={{ color: 'var(--color-accent)' }}>PAY AS YOU CREATE.</span>
                            </h2>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                Tired of $30/month SaaS tools you only use twice? RE-RENDER operates on flexible compute credits. Start free, top-up whenever you need, and never lose your balance.
                            </p>
                        </div>
                        <Link to="/recharge" className="skeuo-button" style={{ padding: '0.85rem 2rem' }}>
                            VIEW TOP-UP PACKS <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { name: "Oracle Chat", cost: "0–1 Credit", desc: "Script ideation, director consultation & viral hook engineering." },
                            { name: "Thumbnail Audit", cost: "5 Credits", desc: "Multimodal CTR grading, vision feedback & neural prompt rewrite." },
                            { name: "News Generation", cost: "0 Credits", desc: "Daily viral news scraping and automated headline layout." },
                            { name: "AI Image Render", cost: "10 Credits", desc: "High-resolution 4K wallpaper & visual asset synthesis." }
                        ].map((tier, idx) => (
                            <div key={idx} style={{ 
                                padding: '1.75rem', 
                                borderRadius: '18px', 
                                backgroundColor: 'var(--color-surface)', 
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 700 }}>
                                    {tier.cost}
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{tier.name}</div>
                                <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{tier.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 05. CREATOR FAQ ── */}
            <div id="faq">
                <PricingFAQ />
            </div>

            {/* ── 06. FINAL CTA (Featuring /cta-bg.gif) ── */}
            <section style={{
                position: 'relative',
                padding: 'clamp(6rem, 15vw, 10rem) clamp(1rem, 5vw, 2rem)',
                textAlign: 'center',
                overflow: 'hidden',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                {/* Background GIF */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    opacity: isDarkMode ? 0.35 : 0.2
                }}>
                    <img 
                        src="/cta-bg.gif" 
                        alt="Background" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                </div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '850px', margin: '0 auto' }}>
                    {/* Live viewer badge */}
                    <div className="viewer-counter" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                        {fakeViewers} creators are building in RE-RENDER right now
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2.8rem, 8vw, 6.5rem)',
                        lineHeight: 0.95,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        margin: '0 0 1.5rem 0'
                    }}>
                        STOP GUESSING. <br />
                        <span style={{ color: 'var(--color-accent)' }}>START CREATING.</span>
                    </h2>

                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.7,
                        maxWidth: '620px',
                        margin: '0 auto 3rem'
                    }}>
                        Leave with scripts, storyboards, and thumbnail scores that give you an unfair advantage over the competition.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => navigate('/lab/oracle-workspace')}
                            className="skeuo-button" 
                            style={{ 
                                fontSize: '1.15rem', 
                                padding: '1.25rem 3rem',
                                border: '2px solid var(--color-accent)'
                            }}
                        >
                            LAUNCH ORACLE WORKSPACE <ArrowRight size={18} />
                        </button>
                        <button 
                            onClick={() => navigate('/tools')}
                            className="skeuo-button" 
                            style={{ 
                                fontSize: '1.15rem', 
                                padding: '1.25rem 3rem',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            EXPLORE ALL TOOLS
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.6, letterSpacing: '0.08em' }}>
                        FREE INFERENCE · ZERO CREDIT CARD REQUIRED · INSTANT ACCESS
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
