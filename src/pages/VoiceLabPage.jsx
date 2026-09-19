import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Mic, Play, Pause, Download, Volume2, VolumeX, 
    Sparkles, Key, Check, Copy, Sliders, RefreshCw, AudioLines,
    FileText, Radio, ArrowLeft, AlertCircle, Cpu, Globe, Search, Coins, X
} from 'lucide-react';

import { synthesizeSpeech, AI_COSTS, getLocalApiKey, setLocalApiKey, hasApiKey } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabLoader from '../components/LabLoader';
import { useWindowSize } from '../hooks/useWindowSize';

const ACCENT = '#f43f5e';
const ACCENT_GLOW = 'rgba(244, 63, 94, 0.25)';

// Curated Deepgram Flux TTS Voices with persona tags
const FLUX_VOICES = [
    // Female
    { id: 'flux-alexis-en', name: 'Alexis', gender: 'Female', vibe: 'Balanced & Natural', tag: 'Modern / Universal' },
    { id: 'flux-bree-en', name: 'Bree', gender: 'Female', vibe: 'Bright & Upbeat', tag: 'Social Media / Vlogger' },
    { id: 'flux-brittany-en', name: 'Brittany', gender: 'Female', vibe: 'Warm & Engaging', tag: 'Storyteller / Commercial' },
    { id: 'flux-brooke-en', name: 'Brooke', gender: 'Female', vibe: 'Crisp & Professional', tag: 'Explainer / Corporate' },
    { id: 'flux-elise-en', name: 'Elise', gender: 'Female', vibe: 'Expressive & Dynamic', tag: 'Creative / Drama' },
    { id: 'flux-gemma-en', name: 'Gemma', gender: 'Female', vibe: 'Refined British', tag: 'Documentary / Luxury' },
    { id: 'flux-haley-en', name: 'Haley', gender: 'Female', vibe: 'Conversational', tag: 'Casual / Relatable' },
    { id: 'flux-kelsey-en', name: 'Kelsey', gender: 'Female', vibe: 'High Energy', tag: 'YouTube Hooks / Hype' },
    { id: 'flux-priya-en', name: 'Priya', gender: 'Female', vibe: 'Warm & Articulate', tag: 'Tech / Educational' },
    { id: 'flux-sienna-en', name: 'Sienna', gender: 'Female', vibe: 'Melodic & Atmospheric', tag: 'Podcast / Narrative' },

    // Male
    { id: 'flux-bruce-en', name: 'Bruce', gender: 'Male', vibe: 'Deep & Cinematic', tag: 'Movie Trailer / Bold' },
    { id: 'flux-cliff-en', name: 'Cliff', gender: 'Male', vibe: 'Resonant Baritone', tag: 'Documentary / Story' },
    { id: 'flux-cole-en', name: 'Cole', gender: 'Male', vibe: 'Cool & Contemporary', tag: 'Tech / Gaming' },
    { id: 'flux-colin-en', name: 'Colin', gender: 'Male', vibe: 'Cultured British', tag: 'Educational / Voiceover' },
    { id: 'flux-jack-en', name: 'Jack', gender: 'Male', vibe: 'Punchy & Viral', tag: 'Short-Form / Ads' },
    { id: 'flux-kai-en', name: 'Kai', gender: 'Male', vibe: 'Smooth & Chill', tag: 'Gen-Z / Lifestyle' },
    { id: 'flux-marcus-en', name: 'Marcus', gender: 'Male', vibe: 'Authoritative', tag: 'Business / Keynote' },
    { id: 'flux-miles-en', name: 'Miles', gender: 'Male', vibe: 'Friendly & Clear', tag: 'Tutorial / Guide' },
    { id: 'flux-sean-en', name: 'Sean', gender: 'Male', vibe: 'Charismatic Host', tag: 'Podcast / Broadcaster' },
    { id: 'flux-wes-en', name: 'Wes', gender: 'Male', vibe: 'Crisp & Anchored', tag: 'News / Fast Delivery' }
];

const PRESET_SCRIPTS = [
    {
        title: "YouTube Hook",
        text: "99% of creators make this exact mistake in their first three seconds. If you fix just this one thing, your retention will double immediately."
    },
    {
        title: "Documentary",
        text: "Deep beneath the silence of the ocean, an unseen world pulses with bioluminescent energy. A sanctuary untouched by the passage of time."
    },
    {
        title: "SaaS Pitch",
        text: "Meet RE-RENDER Creator OS. The high-performance suite engineered for modern digital storytellers. From script to final master, all in one place."
    },
    {
        title: "TikTok Ad",
        text: "Stop scrolling! If you're still doing voiceovers manually, you're wasting hours every week. Try this neural voice engine right now."
    }
];

const VoiceLabPage = () => {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const isMobile = width < 960;
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();

    // Engine Mode: 'openrouter' (Deepgram Flux TTS) vs 'browser' (Native Web Speech)
    const [engineMode, setEngineMode] = useState('openrouter');

    // Script & voice state
    const [script, setScript] = useState(PRESET_SCRIPTS[0].text);
    const [selectedVoice, setSelectedVoice] = useState(FLUX_VOICES[0].id);
    const [genderFilter, setGenderFilter] = useState('All');
    const [voiceSearch, setVoiceSearch] = useState('');
    const [responseFormat, setResponseFormat] = useState('mp3');
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);
    const [endpointDown, setEndpointDown] = useState(false);

    // Browser SpeechSynthesis state
    const [systemVoices, setSystemVoices] = useState([]);
    const [selectedSysVoice, setSelectedSysVoice] = useState('');
    const [speechRate, setSpeechRate] = useState(1.0);
    const [speechPitch, setSpeechPitch] = useState(1.0);

    // Audio playback state
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState(false);

    // API Key Modal
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [inputKey, setInputKey] = useState('');
    const [keyConfigured, setKeyConfigured] = useState(false);

    const audioRef = useRef(null);
    const synthUtteranceRef = useRef(null);
    const animFrameRef = useRef(null);

    useEffect(() => {
        setKeyConfigured(hasApiKey());
        const savedKey = getLocalApiKey();
        if (savedKey) setInputKey(savedKey);

        // Load Browser Speech Synthesis voices
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const updateVoices = () => {
                const vs = window.speechSynthesis.getVoices();
                if (vs && vs.length > 0) {
                    setSystemVoices(vs);
                    const defaultEn = vs.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))) || vs[0];
                    if (defaultEn) setSelectedSysVoice(defaultEn.name);
                }
            };
            updateVoices();
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }

        // Spacebar shortcut for Play/Pause when not focused in textarea/input
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                const tag = document.activeElement?.tagName?.toLowerCase();
                if (tag !== 'textarea' && tag !== 'input') {
                    e.preventDefault();
                    togglePlay();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // Filtered Flux Voices
    const filteredFluxVoices = FLUX_VOICES.filter(v => {
        const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
        const matchesSearch = !voiceSearch.trim() || 
            v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || 
            v.vibe.toLowerCase().includes(voiceSearch.toLowerCase()) ||
            v.tag.toLowerCase().includes(voiceSearch.toLowerCase());
        return matchesGender && matchesSearch;
    });

    const activeFluxVoiceObj = FLUX_VOICES.find(v => v.id === selectedVoice) || FLUX_VOICES[0];

    // Estimated duration (~150 words per minute)
    const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
    const estimatedSeconds = Math.max(1, Math.round((wordCount / 150) * 60));

    const handleSaveKey = () => {
        if (inputKey.trim()) {
            setLocalApiKey(inputKey.trim());
            setKeyConfigured(true);
            setShowKeyModal(false);
            setError(null);
            setEndpointDown(false);
        } else {
            setLocalApiKey('');
            setKeyConfigured(hasApiKey());
            setShowKeyModal(false);
        }
    };

    // Synthesize via OpenRouter Flux TTS
    const handleGenerateOpenRouter = async () => {
        if (!script.trim() || isGenerating) return;

        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!hasApiKey() && !keyConfigured) {
            setShowKeyModal(true);
            return;
        }

        if (!profile || profile.credits < AI_COSTS.VOICE) {
            setError("Insufficient credits. Synthesizing voiceover costs 1 credit.");
            return;
        }

        const success = await spendCredits(AI_COSTS.VOICE, 'VOICE_SYNTHESIS');
        if (!success) return;

        setIsGenerating(true);
        setStatusMessage("Connecting to Deepgram Flux TTS...");
        setError(null);
        setEndpointDown(false);

        try {
            const result = await synthesizeSpeech(
                {
                    text: script.trim(),
                    voice: selectedVoice,
                    responseFormat
                },
                {
                    onStatus: (msg) => setStatusMessage(msg)
                }
            );

            const audioItem = {
                ...result,
                script: script.trim(),
                voiceObj: activeFluxVoiceObj,
                engine: 'Deepgram Flux TTS',
                id: Date.now()
            };

            setCurrentAudio(audioItem);
            setHistory(prev => [audioItem, ...prev.slice(0, 7)]);
            setIsPlaying(false);
            setCurrentTime(0);
        } catch (err) {
            console.error('[VoiceLab] Error:', err);
            const errMsg = err.message || '';
            if (errMsg.includes('MISSING_API_KEY')) {
                setShowKeyModal(true);
            } else if (errMsg.includes('No endpoints found') || errMsg.includes('not a valid model ID')) {
                setEndpointDown(true);
                setError("OpenRouter Flux TTS endpoint is temporarily offline. Switch to Browser Voice Engine below.");
            } else {
                setError(errMsg || 'Speech synthesis failed. Please check your settings.');
            }
        } finally {
            setIsGenerating(false);
            setStatusMessage('');
        }
    };

    // Synthesize / Play via Browser Web Speech
    const handleGenerateBrowser = () => {
        if (!script.trim()) return;
        if (!('speechSynthesis' in window)) {
            setError("Browser Speech Synthesis is not supported in this browser.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(script.trim());
        const matchedVoice = systemVoices.find(v => v.name === selectedSysVoice);
        if (matchedVoice) utterance.voice = matchedVoice;
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

        synthUtteranceRef.current = utterance;

        const estDuration = Math.max(1, (wordCount / (150 * speechRate)) * 60);

        const browserAudioItem = {
            audioUrl: null,
            isBrowserSpeech: true,
            script: script.trim(),
            voiceObj: {
                name: matchedVoice ? matchedVoice.name.split(' ')[0] : 'System Voice',
                vibe: matchedVoice?.lang || 'Native Speech',
                gender: matchedVoice?.name.toLowerCase().includes('female') ? 'Female' : 'Voice'
            },
            engine: 'Browser Neural Voice',
            format: 'LIVE',
            durationEstimate: estDuration,
            id: Date.now()
        };

        setCurrentAudio(browserAudioItem);
        setDuration(estDuration);
        setCurrentTime(0);
        setIsPlaying(true);
        setHistory(prev => [browserAudioItem, ...prev.slice(0, 7)]);

        const startTime = Date.now();
        const updateTimer = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed < estDuration) {
                setCurrentTime(elapsed);
                animFrameRef.current = requestAnimationFrame(updateTimer);
            } else {
                setCurrentTime(estDuration);
                setIsPlaying(false);
            }
        };

        utterance.onstart = () => {
            setIsPlaying(true);
            animFrameRef.current = requestAnimationFrame(updateTimer);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleGenerate = () => {
        if (engineMode === 'browser') {
            handleGenerateBrowser();
        } else {
            handleGenerateOpenRouter();
        }
    };

    // Playback Toggle
    const togglePlay = () => {
        if (!currentAudio) return;

        if (currentAudio.isBrowserSpeech) {
            if (isPlaying) {
                window.speechSynthesis.pause();
                setIsPlaying(false);
            } else {
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                    setIsPlaying(true);
                } else {
                    handleGenerateBrowser();
                }
            }
            return;
        }

        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current && !currentAudio?.isBrowserSpeech) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current && !currentAudio?.isBrowserSpeech) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleDownload = (audioItem = currentAudio) => {
        if (!audioItem || !audioItem.audioUrl) {
            if (audioItem?.isBrowserSpeech) {
                navigator.clipboard.writeText(audioItem.script);
                alert("Browser Speech is streamed live via Web Audio. Script copied to clipboard!");
            }
            return;
        }
        const a = document.createElement('a');
        a.href = audioItem.audioUrl;
        a.download = `rerender_voice_${audioItem.voiceObj?.name || 'flux'}_${Date.now()}.${audioItem.format || 'mp3'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCopyScript = () => {
        if (!currentAudio) return;
        navigator.clipboard.writeText(currentAudio.script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (secs) => {
        if (isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{
            height: isMobile ? 'auto' : 'calc(100vh - 28px)',
            minHeight: isMobile ? '100vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            overflow: isMobile ? 'auto' : 'hidden',
            fontFamily: 'var(--font-sans)',
            boxSizing: 'border-box'
        }}>
            <style>{`
                .vl-sb::-webkit-scrollbar { width: 5px; height: 5px; }
                .vl-sb::-webkit-scrollbar-track { background: transparent; }
                .vl-sb::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
                .vl-sb::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--color-text-secondary) 50%, transparent); }
                .vl-pill { transition: all 0.15s ease; cursor: pointer; border: 1px solid var(--color-border); }
                .vl-pill:hover { border-color: ${ACCENT}; color: ${ACCENT}; }
            `}</style>

            {/* Hidden HTML Audio Tag for OpenRouter files */}
            {currentAudio && currentAudio.audioUrl && (
                <audio 
                    ref={audioRef}
                    src={currentAudio.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    muted={isMuted}
                />
            )}

            {/* ── 1. LOCKED STUDIO HEADER BAR ── */}
            <header style={{
                height: '54px',
                minHeight: '54px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.25rem',
                zIndex: 20
            }}>
                {/* Left: Nav Back & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link
                        to="/tools"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            transition: 'all 0.15s ease'
                        }}
                        title="Back to Tools"
                    >
                        <ArrowLeft size={13} />
                        <span>Tools</span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isGenerating ? '#eab308' : ACCENT,
                            boxShadow: `0 0 10px ${isGenerating ? '#eab308' : ACCENT}`,
                            animation: isGenerating ? 'pulse 1s infinite' : 'none'
                        }} />
                        <h1 style={{
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-display)',
                            margin: 0,
                            letterSpacing: '-0.02em',
                            textTransform: 'uppercase'
                        }}>
                            Voice Lab <span style={{ color: ACCENT, fontStyle: 'italic', fontFamily: 'Playfair Display', fontWeight: 400 }}>Studio</span>
                        </h1>
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            VOL. 04
                        </span>
                    </div>
                </div>

                {/* Center: Engine Segmented Switch */}
                <div style={{
                    display: isMobile ? 'none' : 'inline-flex',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '3px'
                }}>
                    <button
                        onClick={() => { setEngineMode('openrouter'); setError(null); }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            backgroundColor: engineMode === 'openrouter' ? ACCENT : 'transparent',
                            color: engineMode === 'openrouter' ? '#fff' : 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Cpu size={12} />
                        <span>Deepgram Flux (Free)</span>
                    </button>

                    <button
                        onClick={() => { setEngineMode('browser'); setError(null); setEndpointDown(false); }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            backgroundColor: engineMode === 'browser' ? ACCENT : 'transparent',
                            color: engineMode === 'browser' ? '#fff' : 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Globe size={12} />
                        <span>Browser Engine (Offline)</span>
                    </button>
                </div>

                {/* Right: Credits & API Key config */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        padding: '4px 10px',
                        borderRadius: '8px'
                    }}>
                        <Coins size={12} color={ACCENT} />
                        <span style={{ fontWeight: 700 }}>{profile?.credits ?? 0}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>CR</span>
                    </div>

                    {engineMode === 'openrouter' && (
                        <button
                            onClick={() => setShowKeyModal(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: keyConfigured ? 'rgba(255,255,255,0.04)' : 'rgba(244, 63, 94, 0.12)',
                                border: `1px solid ${keyConfigured ? 'var(--color-border)' : 'rgba(244, 63, 94, 0.3)'}`,
                                color: keyConfigured ? 'var(--color-text-secondary)' : ACCENT,
                                padding: '4px 8px',
                                borderRadius: '8px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                            title="OpenRouter API Key Settings"
                        >
                            <Key size={11} />
                            <span>{keyConfigured ? 'Key OK' : 'Set Key'}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Down/Error Alert Banner (if needed) */}
            {endpointDown && (
                <div style={{
                    padding: '8px 1.25rem',
                    backgroundColor: 'rgba(244, 63, 94, 0.1)',
                    borderBottom: '1px solid rgba(244, 63, 94, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    gap: '1rem',
                    zIndex: 15
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={14} color={ACCENT} />
                        <span>OpenRouter Flux TTS is currently offline upstream. Switch to Browser Engine for instant zero-lag voiceover.</span>
                    </div>
                    <button
                        onClick={() => { setEngineMode('browser'); setEndpointDown(false); setError(null); }}
                        style={{
                            padding: '3px 10px',
                            backgroundColor: ACCENT,
                            border: 'none',
                            color: '#fff',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Switch Now
                    </button>
                </div>
            )}

            {/* ── 2. LOCKED TWO-COLUMN WORKSPACE GRID ── */}
            <main style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.12fr 0.88fr',
                gap: '14px',
                padding: '14px',
                overflow: isMobile ? 'visible' : 'hidden',
                boxSizing: 'border-box'
            }}>

                {/* ── LEFT COLUMN: SCRIPT & VOICE CONSOLE ── */}
                <section style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-raised)'
                }}>
                    {/* Presets Strip */}
                    <div style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                    }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Quick Presets:
                        </span>
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }} className="vl-sb">
                            {PRESET_SCRIPTS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setScript(preset.text)}
                                    className="vl-pill"
                                    style={{
                                        padding: '3px 9px',
                                        borderRadius: '7px',
                                        backgroundColor: script === preset.text ? `color-mix(in srgb, ${ACCENT} 14%, transparent)` : 'var(--color-bg)',
                                        borderColor: script === preset.text ? ACCENT : 'var(--color-border)',
                                        color: script === preset.text ? ACCENT : 'var(--color-text)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {preset.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Script Textarea Card */}
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: ACCENT, letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
                                Voiceover Script
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                    {wordCount} words · ~{estimatedSeconds}s
                                </span>
                                <button
                                    onClick={() => setScript('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.65rem',
                                        cursor: 'pointer',
                                        padding: '0 4px'
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Enter script text or dialogue to synthesize..."
                            rows={isMobile ? 4 : 3}
                            style={{
                                width: '100%',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.88rem',
                                lineHeight: 1.5,
                                resize: 'none',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Voice Actor Selector Deck (Scrollable) */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        padding: '10px 14px'
                    }}>
                        {/* Voice Filters Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                                    {engineMode === 'openrouter' ? 'Flux Actors' : 'System Voices'}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    ({engineMode === 'openrouter' ? filteredFluxVoices.length : systemVoices.length})
                                </span>
                            </div>

                            {engineMode === 'openrouter' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {/* Search Input */}
                                    <div style={{ position: 'relative', width: '120px' }}>
                                        <Search size={11} style={{ position: 'absolute', left: '7px', top: '7px', color: 'var(--color-text-muted)' }} />
                                        <input 
                                            type="text"
                                            value={voiceSearch}
                                            onChange={(e) => setVoiceSearch(e.target.value)}
                                            placeholder="Search..."
                                            style={{
                                                width: '100%',
                                                padding: '3px 6px 3px 22px',
                                                fontSize: '0.65rem',
                                                backgroundColor: 'var(--color-bg)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '6px',
                                                color: 'var(--color-text)',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    {/* Gender Segment */}
                                    <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '2px' }}>
                                        {['All', 'Female', 'Male'].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGenderFilter(g)}
                                                style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: genderFilter === g ? ACCENT : 'transparent',
                                                    color: genderFilter === g ? '#fff' : 'var(--color-text-muted)',
                                                    fontSize: '0.62rem',
                                                    fontFamily: 'var(--font-mono)',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {g === 'All' ? 'All' : g[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Voices Grid */}
                        {engineMode === 'openrouter' ? (
                            <div 
                                className="vl-sb"
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '8px',
                                    paddingRight: '2px'
                                }}
                            >
                                {filteredFluxVoices.map((voice) => {
                                    const isSelected = selectedVoice === voice.id;
                                    return (
                                        <div
                                            key={voice.id}
                                            onClick={() => setSelectedVoice(voice.id)}
                                            style={{
                                                padding: '8px 10px',
                                                backgroundColor: isSelected ? `color-mix(in srgb, ${ACCENT} 10%, transparent)` : 'var(--color-bg)',
                                                border: `1px solid ${isSelected ? ACCENT : 'var(--color-border)'}`,
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '3px',
                                                boxShadow: isSelected ? `0 0 12px ${ACCENT_GLOW}` : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 800,
                                                    color: isSelected ? ACCENT : 'var(--color-text)'
                                                }}>
                                                    {voice.name}
                                                </span>
                                                <span style={{
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.55rem',
                                                    color: 'var(--color-text-muted)',
                                                    padding: '1px 4px',
                                                    borderRadius: '3px',
                                                    backgroundColor: 'var(--color-surface)'
                                                }}>
                                                    {voice.gender[0]}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                                {voice.vibe}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Browser System Voice Controls */
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }} className="vl-sb">
                                <select
                                    value={selectedSysVoice}
                                    onChange={(e) => setSelectedSysVoice(e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '10px',
                                        padding: '8px 10px',
                                        color: 'var(--color-text)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {systemVoices.map((v, i) => (
                                        <option key={i} value={v.name}>
                                            {v.name} ({v.lang})
                                        </option>
                                    ))}
                                </select>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ backgroundColor: 'var(--color-bg)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                                            <span>Playback Rate</span>
                                            <span style={{ fontWeight: 700, color: ACCENT }}>{speechRate}x</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0.75"
                                            max="1.5"
                                            step="0.05"
                                            value={speechRate}
                                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                            style={{ width: '100%', accentColor: ACCENT, marginTop: '4px' }}
                                        />
                                    </div>

                                    <div style={{ backgroundColor: 'var(--color-bg)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                                            <span>Vocal Pitch</span>
                                            <span style={{ fontWeight: 700, color: ACCENT }}>{speechPitch}x</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0.8"
                                            max="1.2"
                                            step="0.05"
                                            value={speechPitch}
                                            onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                                            style={{ width: '100%', accentColor: ACCENT, marginTop: '4px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Strip (Locked) */}
                    <div style={{
                        padding: '10px 14px',
                        borderTop: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                    }}>
                        {/* Format selector */}
                        {engineMode === 'openrouter' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>FMT:</span>
                                {['mp3', 'pcm'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setResponseFormat(fmt)}
                                        style={{
                                            padding: '2px 7px',
                                            borderRadius: '5px',
                                            border: `1px solid ${responseFormat === fmt ? ACCENT : 'var(--color-border)'}`,
                                            backgroundColor: responseFormat === fmt ? `color-mix(in srgb, ${ACCENT} 14%, transparent)` : 'transparent',
                                            color: responseFormat === fmt ? ACCENT : 'var(--color-text-muted)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.62rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                NATIVE AUDIO
                            </span>
                        )}

                        {/* Big Primary Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleGenerate}
                            disabled={isGenerating || !script.trim()}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: isGenerating || !script.trim() ? 'var(--color-border)' : ACCENT,
                                color: isGenerating || !script.trim() ? 'var(--color-text-muted)' : '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                cursor: isGenerating || !script.trim() ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: isGenerating || !script.trim() ? 'none' : `0 4px 16px ${ACCENT_GLOW}`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Mic size={15} />
                            <span>
                                {isGenerating 
                                    ? 'Synthesizing...' 
                                    : engineMode === 'browser' 
                                        ? 'Play Voiceover' 
                                        : 'Synthesize Master'}
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                backgroundColor: 'rgba(0,0,0,0.25)',
                                padding: '2px 6px',
                                borderRadius: '5px'
                            }}>
                                {engineMode === 'browser' ? 'FREE' : '1 CR'}
                            </span>
                        </motion.button>
                    </div>
                </section>

                {/* ── RIGHT COLUMN: MASTER DECK & SESSION TAKES ── */}
                <section style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    gap: '14px',
                    overflow: 'hidden'
                }}>
                    
                    {/* Master Deck Audio Player Card */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: 'var(--shadow-raised)'
                    }}>
                        {/* Player Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AudioLines size={15} color={ACCENT} />
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    color: ACCENT,
                                    textTransform: 'uppercase'
                                }}>
                                    Master Track Monitor
                                </span>
                            </div>

                            {currentAudio && (
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.62rem',
                                    color: 'var(--color-text-muted)',
                                    border: '1px solid var(--color-border)',
                                    padding: '2px 6px',
                                    borderRadius: '100px'
                                }}>
                                    {currentAudio.voiceObj?.name} · {currentAudio.engine}
                                </span>
                            )}
                        </div>

                        {/* Monitor Screen / Waveform Box */}
                        <div style={{
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            minHeight: '110px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}>
                            {isGenerating ? (
                                <div style={{ transform: 'scale(0.85)' }}>
                                    <LabLoader label={statusMessage || "Synthesizing audio..."} accentColor={ACCENT} />
                                </div>
                            ) : currentAudio ? (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* 36-Band Waveform simulation */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '3px',
                                        height: '52px',
                                        width: '100%'
                                    }}>
                                        {Array.from({ length: 36 }).map((_, i) => {
                                            const progress = duration > 0 ? currentTime / duration : 0;
                                            const barProgress = i / 36;
                                            const isPassed = barProgress <= progress;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        height: isPlaying 
                                                            ? `${20 + Math.sin(i * 0.45 + currentTime * 8) * 35 + 20}%`
                                                            : `${25 + Math.sin(i * 0.35) * 20}%`
                                                    }}
                                                    transition={{ duration: 0.12 }}
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: isPassed ? ACCENT : 'var(--color-border)',
                                                        borderRadius: '2px',
                                                        maxWidth: '5px',
                                                        boxShadow: isPassed ? `0 0 6px ${ACCENT_GLOW}` : 'none'
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Timeline Slider */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <input
                                            type="range"
                                            min="0"
                                            max={duration || 1}
                                            step="0.01"
                                            value={currentTime}
                                            onChange={handleSeek}
                                            disabled={currentAudio.isBrowserSpeech}
                                            style={{
                                                width: '100%',
                                                accentColor: ACCENT,
                                                cursor: currentAudio.isBrowserSpeech ? 'default' : 'pointer',
                                                height: '4px'
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '10px 0' }}>
                                    <Radio size={20} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.5 }} />
                                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>Master Monitor Idle</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                        Select voice and click Synthesize to monitor playback
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transport Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={togglePlay}
                                    disabled={!currentAudio}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: currentAudio ? ACCENT : 'var(--color-border)',
                                        border: 'none',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: currentAudio ? 'pointer' : 'not-allowed',
                                        boxShadow: currentAudio ? `0 3px 12px ${ACCENT_GLOW}` : 'none',
                                        transition: 'all 0.15s ease'
                                    }}
                                    title="Play / Pause (Space)"
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                                </button>

                                {!currentAudio?.isBrowserSpeech && (
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        disabled={!currentAudio}
                                        style={{
                                            background: 'none',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            padding: '6px',
                                            color: isMuted ? ACCENT : 'var(--color-text-secondary)',
                                            cursor: currentAudio ? 'pointer' : 'not-allowed'
                                        }}
                                        title={isMuted ? 'Unmute' : 'Mute'}
                                    >
                                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={handleCopyScript}
                                    disabled={!currentAudio}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        color: copied ? ACCENT : 'var(--color-text)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.68rem',
                                        fontWeight: 600,
                                        cursor: currentAudio ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                    <span>{copied ? 'Copied' : 'Copy'}</span>
                                </button>

                                {currentAudio?.audioUrl && (
                                    <button
                                        onClick={() => handleDownload(currentAudio)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: ACCENT,
                                            border: 'none',
                                            color: '#ffffff',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: `0 3px 10px ${ACCENT_GLOW}`
                                        }}
                                    >
                                        <Download size={12} />
                                        <span>Download MP3</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Session Takes Rack (Scrollable) */}
                    <div style={{
                        flex: 1,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        padding: '12px 14px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                                    Session Takes
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    ({history.length})
                                </span>
                            </div>

                            {history.length > 0 && (
                                <button
                                    onClick={() => setHistory([])}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.62rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear History
                                </button>
                            )}
                        </div>

                        {history.length > 0 ? (
                            <div 
                                className="vl-sb"
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    paddingRight: '2px'
                                }}
                            >
                                {history.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '7px 10px',
                                            backgroundColor: currentAudio?.id === item.id ? `color-mix(in srgb, ${ACCENT} 8%, var(--color-bg))` : 'var(--color-bg)',
                                            border: `1px solid ${currentAudio?.id === item.id ? ACCENT : 'var(--color-border)'}`,
                                            borderRadius: '8px',
                                            gap: '8px',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                                    {item.voiceObj?.name}
                                                </span>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                    {item.engine?.split(' ')[0]}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '0.68rem',
                                                color: 'var(--color-text-secondary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {item.script}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <button
                                                onClick={() => {
                                                    setCurrentAudio(item);
                                                    setIsPlaying(false);
                                                }}
                                                style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border)',
                                                    color: ACCENT,
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Load
                                            </button>
                                            {item.audioUrl && (
                                                <button
                                                    onClick={() => handleDownload(item)}
                                                    style={{
                                                        padding: '3px 6px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'var(--color-surface)',
                                                        border: '1px solid var(--color-border)',
                                                        color: 'var(--color-text-secondary)',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Download MP3"
                                                >
                                                    <Download size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                                textAlign: 'center',
                                padding: '1rem'
                            }}>
                                No audio takes recorded in this session
                            </div>
                        )}
                    </div>

                </section>

            </main>

            {/* API Key Modal */}
            <AnimatePresence>
                {showKeyModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                padding: '1.75rem',
                                maxWidth: '460px',
                                width: '100%',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: ACCENT
                                    }}>
                                        <Key size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800 }}>
                                            OpenRouter API Key
                                        </h3>
                                        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                            Required for Deepgram Flux TTS models
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowKeyModal(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                Enter your free OpenRouter API key to synthesize voice clips directly. The key is stored locally in your browser session.
                            </p>

                            <input 
                                type="password"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="sk-or-v1-..."
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.82rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                                <a 
                                    href="https://openrouter.ai/settings/keys" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{
                                        color: ACCENT,
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.72rem',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    Get Free Key on OpenRouter
                                </a>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setShowKeyModal(false)}
                                        style={{
                                            padding: '0.55rem 1rem',
                                            borderRadius: '8px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--color-border)',
                                            color: 'var(--color-text-secondary)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.72rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveKey}
                                        style={{
                                            padding: '0.55rem 1.15rem',
                                            borderRadius: '8px',
                                            backgroundColor: ACCENT,
                                            border: 'none',
                                            color: '#ffffff',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save Key
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceLabPage;
