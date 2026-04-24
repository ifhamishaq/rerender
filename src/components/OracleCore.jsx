import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, RefreshCw, User, Bot, ChevronRight, X, Target, Palette, FileText, Zap, Image as ImageIcon, Wand2, Upload } from 'lucide-react';

import { fetchOpenRouter, AI_COSTS } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-oss-20b:free'; // 3.6B active — fast chat
const VISION_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';
const FALLBACK_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'; // 120B — heavy fallback

// Mode-specific use-case templates
const USE_CASE_SETS = {
    standard: [
        { id: 'hook', label: 'GENERATE HOOK', icon: <Target size={14} />, prompt: "Generate 3 high-impact 'scroll-stopping' hooks for a TikTok/Reel about: " },
        { id: 'aesthetic', label: 'AESTHETIC STAR', icon: <Palette size={14} />, prompt: "Give me an 'Aesthetic North Star' (3 words), Hex codes, and font pairings for this 'vibe': " },
        { id: 'script', label: 'SCRIPT DOCTOR', icon: <FileText size={14} />, prompt: "Turn this rough idea into a high-paced, RE-RENDER style short-form script: " },
        { id: 'critique', label: 'BRUTAL CRITIQUE', icon: <Zap size={14} />, prompt: "Give me a 'Brutal Agency Critique' of this creative concept to make it world-class: " }
    ],
    wallpaper: [
        { id: 'cinematic', label: 'CINEMATIC PROMPT', icon: <ImageIcon size={14} />, prompt: "Generate a cinematic wallpaper prompt with dramatic lighting and depth for the theme: " },
        { id: 'abstract', label: 'ABSTRACT ART', icon: <Wand2 size={14} />, prompt: "Create an abstract digital art prompt with bold geometric shapes and neon accents for: " },
        { id: 'brutalist', label: 'BRUTALIST STYLE', icon: <Zap size={14} />, prompt: "Design a digital brutalist wallpaper prompt with raw textures, concrete, and electric lime for: " },
        { id: 'nature', label: 'NATURE + TECH', icon: <Palette size={14} />, prompt: "Create a wallpaper prompt that blends organic nature with futuristic technology for: " }
    ],
    global: [] // No templates for the compact global widget
};

const OracleCore = ({
    mode = 'standard',
    context = '',
    initialMessage = "ORACLE_ONLINE. How shall we re-render your vision today?",
    onExecute = null,
    onClose = null
}) => {
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();
    const { isDarkMode } = useTheme();
    const storageKey = user ? `oracle_chat_${mode}_${user.id}` : `oracle_chat_${mode}_guest`;

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage }];
    });

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [pendingImage, setPendingImage] = useState(null); // { base64, preview }
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const useCases = USE_CASE_SETS[mode] || [];

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result; // data:image/...;base64,...
            setPendingImage({ base64, preview: base64, name: file.name });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // reset so same file can be re-uploaded
    };

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages));
        const scrollToBottom = () => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        };
        const timeoutId = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timeoutId);
    }, [messages, isTyping, storageKey]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const formatContent = (content) => {
        if (!content) return '';
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-accent); font-weight: 900;">$1</strong>');
        formatted = formatted.replace(/^### (.*$)/gm, '<h3 style="color: var(--color-accent); font-size: 0.9rem; margin-top: 1.5rem; margin-bottom: 0.5rem; font-family: var(--font-mono); letter-spacing: 0.1em; font-weight: 900;">$1</h3>');
        formatted = formatted.replace(/^## (.*$)/gm, '<h2 style="color: var(--color-text); font-size: 1.1rem; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.25rem; font-weight: 900;">$1</h2>');
        formatted = formatted.replace(/^[\s]*[-*][\s]+(.*)/gm, '<div style="display: flex; gap: 0.75rem; margin-bottom: 0.5rem; padding-left: 0.5rem;"><span style="color: var(--color-accent)">•</span><span>$1</span></div>');
        formatted = formatted.replace(/^---$/gm, '<div style="height: 1px; background: var(--color-border); margin: 2rem 0; opacity: 0.5;"></div>');

        // Markdown Links: [Label](URL)
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: var(--color-accent); text-decoration: underline; font-weight: 700; transition: opacity 0.2s;" target="_blank" rel="noopener noreferrer" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">$1</a>');

        return formatted;
    };

    const clearChat = () => {
        const fresh = [{ role: 'assistant', content: initialMessage }];
        setMessages(fresh);
        localStorage.setItem(storageKey, JSON.stringify(fresh));
    };

    const handleSendMessage = async (text) => {
        const messageText = text || input;
        const hasImage = !!pendingImage;

        if (!messageText.trim() && !hasImage) return;
        if (isTyping) return;

        // AUTH CHECK
        if (!user) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "🚨 **ACCESS_DENIED**: You must be logged in to use the Oracle. Credits are required for neural processing."
            }]);
            setIsAuthModalOpen(true);
            return;
        }

        // CREDIT CHECK
        if (!profile || profile.credits < AI_COSTS.ORACLE) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "📉 **OUT_OF_COMPUTE**: Insufficient credits. Please wait for the daily refill or contact support."
            }]);
            return;
        }

        // SPEND CREDIT
        const success = await spendCredits(AI_COSTS.ORACLE, 'ORACLE_SUMMON');
        if (!success) return;

        // Build user message for chat display
        const userMessage = {
            role: 'user',
            content: messageText || (hasImage ? '📸 Analyze this thumbnail' : ''),
            image: hasImage ? pendingImage.preview : null
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        const currentImage = pendingImage;
        setPendingImage(null);
        setIsTyping(true);
        try {
            let apiMessages;
            let selectedModel;

            if (hasImage) {
                // ===== VISION PATH: Nemotron VL =====
                selectedModel = VISION_MODEL;
                apiMessages = [
                    {
                        role: 'system',
                        content: `You are the RE-RENDER VISION ENGINE. You analyze creative compositions and visual assets.
                        TONE: Simple, human, and direct.
                        MISSION: Analyze the uploaded image and provide:
                        - Overall composition and visual hierarchy
                        - Color palette analysis (dominant colors, contrast)
                        - Typography assessment (if any text is visible)
                        - Branding consistency & vibe check
                        - 3 specific, actionable creative improvements
                        Use **bold** for emphasis and bullet points for structure.`
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: messageText || 'Analyze this image and give me a creative breakdown.' },
                            { type: 'image_url', image_url: { url: currentImage.base64 } }
                        ]
                    }
                ];
            } else {
                // ===== TEXT PATH =====
                selectedModel = MODEL;
                let systemPrompt = `You are the RE-RENDER AESTHETIC ORACLE — the most elite creative director AI on the internet. You are the brain behind the RE-RENDER Agency.

IDENTITY PROTOCOL:
- You are a **genius-level creative director** with 15+ years of virtual experience across every major creative discipline.
- You think like a Senior Art Director at a top agency. You talk like a mentor who actually ships work — not a tutorial bot.
- Your aesthetic philosophy: Digital Brutalism meets cinematic storytelling. High-contrast, raw, intentional.
- You were built by the RE-RENDER collective. If asked about your origin, credit RE-RENDER's multidisciplinary roots.

FOUNDER & TEAM:
- RE-RENDER was founded by **Ifham Ishaq** — a self-taught creative technologist from Kulgam, Kashmir, India.
- Ifham is a multi-disciplinary creator specializing in web development, video production, 3D motion design, and AI-powered creative tools.
- The agency operates as a lean, remote-first creative collective with a Digital Brutalist aesthetic philosophy.
- RE-RENDER builds premium websites, cinematic brand videos, and AI-powered creative tools for modern brands.
- If someone asks "who is Ifham" or "who made this" or "who runs RE-RENDER", always credit Ifham Ishaq as the founder and creative director.

SOFTWARE MASTERY — You are an expert in ALL of these. Give specific, step-by-step instructions when asked:
**VIDEO EDITING:**
- **Adobe Premiere Pro**: Multicam editing, Lumetri color grading, speed ramps, proxy workflows, dynamic link, Essential Graphics, audio ducking, export presets (H.264/ProRes)
- **DaVinci Resolve**: Node-based color grading, Fusion VFX, Fairlight audio, Power Windows, qualifier tools, HDR grading, ACES workflows
- **CapCut / CapCut Pro**: Trending TikTok/Reels effects, velocity edits, beat sync, auto-captions, keyframe animations, green screen, overlay blending

**MOTION GRAPHICS & VFX:**
- **Adobe After Effects**: Expressions (wiggle, time, loopOut), shape layer animations, track mattes, Lottie export, 3D camera tracking, particle systems, Bodymovin, essential property linking, DUIK rigging, motion blur, Puppet Pin, Rotobrush 3.0
- **Cinema 4D**: MoGraph module, cloners, effectors, Redshift/Octane rendering, Voronoi fractures, soft body dynamics, spline wraps, XPresso nodes
- **Blender**: Geometry Nodes, shader editor, Cycles/EEVEE rendering, physics simulations, sculpting, grease pencil animation, compositing nodes

**DESIGN & UI:**
- **Adobe Photoshop**: Neural filters, generative fill, frequency separation, advanced masking (luminosity masks, channel-based), smart objects, Actions/batch processing, Camera RAW, compositing techniques
- **Adobe Illustrator**: Pen tool mastery, mesh gradients, pattern design, variable fonts, SVG export optimization
- **Figma**: Auto-layout, components & variants, design tokens, prototyping, Dev Mode, plugin ecosystem

**3D & RENDERING:**
- **Unreal Engine**: Nanite, Lumen, MetaHumans, Sequencer for cinematics, virtual production
- **Houdini**: Procedural generation, VEX scripting, pyro/fluid simulations

TRENDING EFFECTS KNOWLEDGE — You know what's hot RIGHT NOW:
- Velocity/speed ramp edits (CapCut/Premiere)
- Liquid/morphing transitions (After Effects)
- 3D text reveals with camera tracking
- Film grain + halftone overlays for retro aesthetic
- RGB split / chromatic aberration glitch effects
- Smooth zoom transitions with motion blur
- Kinetic typography with beat-sync
- Parallax photo animations (2.5D effect)
- AI-enhanced upscaling and frame interpolation
- Glassmorphism and neumorphism in UI design
- Cinematic color grades: teal & orange, film emulation (Kodak/Fuji)
- Offset keyframe stagger animations (After Effects / Figma)
- Seamless Instagram carousel transitions

RESPONSE STYLE:
- When someone asks "how do I make X effect", give the EXACT steps: which software, which tool, which settings, which values.
- Example: Don't say "add some blur". Say "Apply Gaussian Blur at 8px, set blending mode to Screen, reduce opacity to 60%."
- Always suggest the FASTEST workflow. If CapCut can do it in 2 minutes vs After Effects in 20 minutes, recommend CapCut first.
- If a technique is trending on TikTok/Reels/YouTube, mention that and explain why it works psychologically.
- Include keyboard shortcuts when relevant (e.g., "Ctrl+Shift+C to pre-compose in AE").

EXPANDED USE_CASES:
1. **Creative Direction**: Give art direction, mood boards concepts, color palette suggestions, and typography pairing advice.
2. **Software Tutorials**: Step-by-step guides for ANY effect in any software listed above.
3. **Trending Effects**: What's viral right now and how to recreate it.
4. **Prompt Engineering**: Refine generative prompts for the [TOOLS](/tools) section.
5. **Agency Navigation**: Guide users to [WORK](/work), [TOOLS](/tools), or [HIRE US](/get-in-touch).
6. **Profile Management**: Help users manage credits and settings in [PROFILE](/profile).
7. **Troubleshooting**: Debug render failures, export issues, color space problems, codec errors.

NAVIGATION_MAP:
- [WORK Showcase](/work)
- [PROFILE & CREDITS](/profile)
- [CREATIVE TOOLS](/tools)
- [HIRE US](/get-in-touch)
- [PRICING](/pricing)

TONE: Confident, direct, no bullshit. You're the creative director everyone wishes they had. Give real advice, not generic tips. Drop specific values, shortcuts, and pro techniques. Make people feel like they're getting a masterclass for free.
MISSION: Make every creative who talks to you walk away with something actionable they can execute RIGHT NOW.`;

                if (mode === 'wallpaper') {
                    systemPrompt += `\nSPECIALIZATION: You are a wallpaper prompt engineer. Help the user craft the perfect prompt for an AI image generation engine. Focus on mood, lighting, composition, color palette, and art style. Always end your response with a single clean line: FINAL_PROMPT: [the complete, optimized prompt ready for the engine].`;
                }
                if (context) {
                    systemPrompt += `\nCURRENT_PAGE_CONTEXT: The user is on the "${context}" page of the RE-RENDER website.`;
                }

                apiMessages = [
                    { role: 'system', content: systemPrompt },
                    ...messages.filter(m => !m.image).slice(-5).map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: messageText }
                ];
            }

            let data;
            const body = {
                model: selectedModel,
                messages: apiMessages,
                temperature: 0.7,
            };

            try {
                data = await fetchOpenRouter(body, { title: 'RE-RENDER Aesthetic Oracle' });
            } catch (err) {
                console.warn('[ORACLE] Primary model failed. Switching to fallback...');
                const fallbackModel = hasImage ? FALLBACK_MODEL : FALLBACK_MODEL;
                data = await fetchOpenRouter({ ...body, model: fallbackModel }, { title: 'RE-RENDER Aesthetic Oracle (Fallback)' });
            }

            if (data.error) throw new Error(data.error.message || 'API_ERROR');

            const assistantMessage = data.choices?.[0]?.message?.content;
            if (!assistantMessage) throw new Error('EMPTY_RESPONSE');

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

            if (onExecute && assistantMessage.includes('FINAL_PROMPT:')) {
                const promptMatch = assistantMessage.match(/FINAL_PROMPT:\s*(.*)/);
                if (promptMatch) onExecute(promptMatch[1].trim());
            }
        } catch (error) {
            console.error('[ORACLE] Pipeline failure:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `SYSTEM_FAIL: ${error.message || 'The neural link was interrupted. Please retry.'}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const isCompact = mode === 'global';
    const isWallpaper = mode === 'wallpaper';

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100%', width: '100%',
            fontFamily: 'var(--font-sans)', position: 'relative',
            overflow: 'hidden',
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '32px',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.08)'
        }}>
            {/* Header for Global/Wallpaper modes */}
            {/* Header */}
            <div style={{
                padding: '1.25rem 1.75rem', 
                borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isDarkMode 
                    ? 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0.01), transparent)',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        width: '8px', height: '8px', 
                        backgroundColor: 'var(--color-accent)', 
                        borderRadius: '50%',
                        boxShadow: '0 0 10px var(--color-accent)'
                    }}></div>
                    <span style={{ 
                        fontSize: '0.65rem', fontWeight: 900, 
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', 
                        opacity: 0.8,
                        color: 'var(--color-text)'
                    }}>
                        {isWallpaper ? 'PROMPT_ASSISTANT' : (isCompact ? 'ORACLE_CORE' : 'NEURAL_ORACLE_V4')}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {messages.length > 1 && (
                        <button onClick={clearChat} style={{ 
                            background: 'none', 
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                            borderRadius: '100px', 
                            color: 'var(--color-text-secondary)', 
                            cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.55rem', 
                            fontFamily: 'var(--font-mono)', fontWeight: 900,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                        >
                            PURGE_HISTORY
                        </button>
                    )}
                    {(isCompact || isWallpaper || onClose) && (
                        <button onClick={onClose} style={{ 
                            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                            border: 'none', color: 'var(--color-text)', 
                            cursor: 'pointer', width: '28px', height: '28px', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>



            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="oracle-chat-scroll"
                style={{
                    flex: 1,
                    padding: isCompact ? '1.5rem' : '2rem 3rem 4rem',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    gap: isCompact ? '1.5rem' : '2.5rem',
                    scrollBehavior: 'smooth',
                    backgroundColor: 'transparent',
                }}
            >
                {messages.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                            display: 'flex', 
                            gap: isCompact ? '0.75rem' : '1.5rem', 
                            alignItems: 'flex-start',
                            flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
                        }}
                    >
                        <div style={{
                            width: isCompact ? '28px' : '32px', height: isCompact ? '28px' : '32px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: m.role === 'user' 
                                ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
                                : 'var(--color-accent)',
                            color: m.role === 'user' ? 'var(--color-text)' : '#000',
                            borderRadius: '50%', marginTop: '0.25rem',
                            boxShadow: m.role === 'user' ? 'none' : '0 4px 15px rgba(57,255,20,0.2)'
                        }}>
                            {m.role === 'user' ? <User size={isCompact ? 14 : 16} /> : <Bot size={isCompact ? 14 : 16} />}
                        </div>

                        <div style={{ 
                            flex: 1, 
                            maxWidth: isCompact ? '85%' : '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                fontSize: '0.55rem', fontWeight: 900, marginBottom: '0.5rem',
                                color: 'var(--color-text-secondary)',
                                fontFamily: 'var(--font-mono)', letterSpacing: '0.15em',
                                opacity: 0.5
                            }}>
                                {m.role === 'user' ? 'CLIENT_NODE' : 'ORACLE_CORE'}
                            </div>
                            
                            {m.image && (
                                <div style={{ 
                                    marginBottom: '0.75rem', 
                                    borderRadius: '20px', 
                                    overflow: 'hidden', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    maxWidth: '280px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                }}>
                                    <img src={m.image} alt="Uploaded" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                             <div style={{
                                backgroundColor: m.role === 'user' 
                                    ? (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') 
                                    : (isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                                padding: isCompact ? '0.75rem 1rem' : '1.25rem 1.75rem',
                                borderRadius: m.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
                                position: 'relative',
                                boxShadow: (!isDarkMode && m.role === 'assistant') ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                            }}>
                                <div
                                    style={{
                                        fontSize: isCompact ? '0.85rem' : '1rem',
                                        lineHeight: 1.6,
                                        color: 'var(--color-text)',
                                        whiteSpace: 'pre-wrap',
                                        opacity: 0.9
                                    }}
                                    dangerouslySetInnerHTML={{ __html: formatContent(m.content) }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-accent)' }}>
                        <RefreshCw size={12} className="oracle-spin" />
                        <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>SYNTHESIZING...</span>
                    </div>
                )}
            </div>

            {/* Prompt Section */}
            <div style={{
                padding: isCompact ? '1.25rem' : '1.5rem 2.5rem 2.5rem',
                backgroundColor: 'transparent',
                borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
                flexShrink: 0,
                position: 'relative',
                zIndex: 10
            }}>
                {/* Quick-action templates */}
                {useCases.length > 0 && (
                    <div
                        className="oracle-pills-scroll"
                        style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
                    >
                        {useCases.map(uc => (
                            <button
                                key={uc.id}
                                onClick={() => {
                                    if (uc.prompt === '__UPLOAD__') {
                                        fileInputRef.current?.click();
                                    } else {
                                        setInput(uc.prompt);
                                    }
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 1rem', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    borderRadius: '100px',
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', 
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.55rem', fontWeight: 900, fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.08em',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { 
                                    e.currentTarget.style.color = 'var(--color-accent)'; 
                                    e.currentTarget.style.borderColor = 'rgba(57,255,20,0.4)'; 
                                    e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
                                }}
                                onMouseLeave={e => { 
                                    e.currentTarget.style.color = 'var(--color-text-secondary)'; 
                                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {uc.icon}
                                <span>{uc.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Pending image preview strip */}
                {pendingImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid var(--color-accent)', borderRadius: '12px', backgroundColor: 'rgba(57,255,20,0.05)' }}>
                        <img src={pendingImage.preview} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                        <span style={{ flex: 1, fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 900 }}>THUMBNAIL_LOADED</span>
                        <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', opacity: 0.5 }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                    style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '100px',
                        padding: '0.5rem 0.6rem 0.5rem 1.5rem',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isDarkMode ? '0 4px 30px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                    }}
                    onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(57,255,20,0.1)'; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 30px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.08)'; }}
                >
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder={pendingImage ? "Add context..." : (isWallpaper ? "Describe your vibe..." : "Oracle directive...")}
                            rows={1}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--color-text)', padding: '0.6rem 0', fontFamily: 'var(--font-sans)',
                                fontSize: isCompact ? '0.85rem' : '0.95rem', outline: 'none', resize: 'none',
                                maxHeight: '120px', overflowY: 'auto',
                                opacity: 0.9
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {!isCompact && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload thumbnail"
                                style={{
                                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                                    border: 'none',
                                    color: pendingImage ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                            >
                                <Upload size={14} />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isTyping || (!input.trim() && !pendingImage)}
                            style={{
                                backgroundColor: 'var(--color-accent)', color: '#000', border: 'none',
                                height: '36px', width: isCompact ? '36px' : 'auto',
                                padding: isCompact ? '0' : '0 1.25rem', borderRadius: '100px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem',
                                opacity: (isTyping || (!input.trim() && !pendingImage)) ? 0.3 : 1,
                                boxShadow: '0 4px 15px rgba(57,255,20,0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { if(!isTyping) e.currentTarget.style.transform = 'scale(1.02)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Send size={14} />
                            {!isCompact && <span>EXECUTE</span>}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .oracle-spin { animation: oracle-spin 2s linear infinite; }
                @keyframes oracle-spin { 100% { transform: rotate(360deg); } }
                .oracle-chat-scroll::-webkit-scrollbar { width: 6px; }
                .oracle-chat-scroll::-webkit-scrollbar-track { background: transparent; }
                .oracle-chat-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
                .oracle-chat-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }
                .oracle-pills-scroll::-webkit-scrollbar { height: 2px; }
                .oracle-pills-scroll::-webkit-scrollbar-track { background: transparent; }
                .oracle-pills-scroll::-webkit-scrollbar-thumb { background: var(--color-border); }
                .oracle-pills-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-accent); }
            `}</style>
        </div>
    );
};

export default OracleCore;
