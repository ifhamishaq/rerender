import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Mic, Play, Pause, Download, Volume2, VolumeX, 
    Sparkles, Key, Check, Copy, Sliders, RefreshCw, AudioLines,
    FileText, Radio, ArrowRight, AlertCircle, Cpu, Globe
} from 'lucide-react';

import { synthesizeSpeech, AI_COSTS, getLocalApiKey, setLocalApiKey, hasApiKey } from '../utils/ai';
import { useAuth } from '../context/AuthContext';
import LabHeader from '../components/LabHeader';
import LabLoader from '../components/LabLoader';
import { useWindowSize } from '../hooks/useWindowSize';

const ACCENT = '#f43f5e'; // Electric Rose / Sound Wave
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
        title: "YouTube Viral Hook",
        text: "99% of creators make this exact mistake in their first three seconds. If you fix just this one thing, your retention will double immediately."
    },
    {
        title: "Cinematic Documentary",
        text: "Deep beneath the silence of the ocean, an unseen world pulses with bioluminescent energy. A sanctuary untouched by the passage of time."
    },
    {
        title: "SaaS / Tech Product",
        text: "Meet RE-RENDER Creator OS. The high-performance suite engineered for modern digital storytellers. From script to final master, all in one place."
    },
    {
        title: "TikTok / Reel Ad",
        text: "Stop scrolling! If you're still doing voiceovers manually, you're wasting hours every week. Try this neural voice engine right now."
    }
];

const VoiceLabPage = () => {
    const { width } = useWindowSize();
    const isMobile = width < 860;
    const { user, profile, spendCredits, setIsAuthModalOpen } = useAuth();

    // Engine Mode: 'openrouter' (Deepgram Flux TTS) vs 'browser' (Native Web Speech)
    const [engineMode, setEngineMode] = useState('openrouter');

    // Script & voice state
    const [script, setScript] = useState(PRESET_SCRIPTS[0].text);
    const [selectedVoice, setSelectedVoice] = useState(FLUX_VOICES[0].id);
    const [genderFilter, setGenderFilter] = useState('All');
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

        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // Filtered Flux Voices
    const filteredFluxVoices = FLUX_VOICES.filter(v => {
        if (genderFilter === 'All') return true;
        return v.gender === genderFilter;
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
        setStatusMessage("Connecting to Deepgram Flux TTS (deepgram/flux-tts:free)...");
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
                engine: 'OpenRouter Deepgram Flux',
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
                setError("OpenRouter's free Flux TTS endpoint is currently experiencing upstream provider downtime. You can switch to the Browser Voice Engine with 1 click below.");
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
                vibe: matchedVoice?.lang || 'Native',
                gender: matchedVoice?.name.toLowerCase().includes('female') ? 'Female' : 'Voice'
            },
            engine: 'Browser Neural Speech',
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
                // If browser audio, copy script text
                navigator.clipboard.writeText(audioItem.script);
                alert("Browser Speech is streamed live through your device audio output. Script copied to clipboard!");
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
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)', paddingBottom: '8rem' }}>
            {/* Header */}
            <LabHeader 
                title="Voice" 
                subtitle="Studio." 
                vol="04" 
                credits={profile?.credits || 0}
                accentColor={ACCENT}
                tag="CREATOR OS"
            />

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

            {/* Main Studio Console */}
            <main style={{ maxWidth: '1200px', margin: '2.5rem auto 0', padding: '0 2rem' }}>
                
                {/* Engine Selector & Status Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '0.85rem 1.25rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    marginBottom: '2rem'
                }}>
                    {/* Mode Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            ENGINE:
                        </span>
                        <div style={{
                            display: 'inline-flex',
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
                                    borderRadius: '8px',
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
                                <span>Flux TTS (OpenRouter)</span>
                            </button>

                            <button
                                onClick={() => { setEngineMode('browser'); setError(null); setEndpointDown(false); }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
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
                                <span>Browser Neural Engine (Always Online)</span>
                            </button>
                        </div>
                    </div>

                    {/* API Key Status */}
                    {engineMode === 'openrouter' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowKeyModal(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: keyConfigured ? 'rgba(255,255,255,0.04)' : 'rgba(244, 63, 94, 0.12)',
                                    border: `1px solid ${keyConfigured ? 'var(--color-border)' : 'rgba(244, 63, 94, 0.3)'}`,
                                    color: keyConfigured ? 'var(--color-text-secondary)' : ACCENT,
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '10px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Key size={13} />
                                <span>{keyConfigured ? 'OpenRouter Key Active' : 'Configure API Key'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Endpoint Down or Error Notification */}
                {endpointDown && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '1.25rem 1.5rem',
                            backgroundColor: 'rgba(244, 63, 94, 0.08)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            borderRadius: '16px',
                            color: 'var(--color-text)',
                            marginBottom: '2rem',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <AlertCircle size={20} color={ACCENT} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: ACCENT }}>
                                    OpenRouter Flux TTS Endpoint Temporarily Offline
                                </div>
                                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                                    OpenRouter reported: <em>"No endpoints found for deepgram/flux-tts"</em>. This occurs when the upstream provider's cluster has zero active replicas or is experiencing an outage. You can switch to the <strong>Browser Voice Engine</strong> to generate speech immediately with zero downtime.
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setEngineMode('browser');
                                setEndpointDown(false);
                                setError(null);
                            }}
                            style={{
                                padding: '0.65rem 1.25rem',
                                borderRadius: '10px',
                                backgroundColor: ACCENT,
                                color: '#ffffff',
                                border: 'none',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: `0 4px 14px ${ACCENT_GLOW}`
                            }}
                        >
                            ⚡ Switch to Browser Voice Engine
                        </button>
                    </motion.div>
                )}

                {error && !endpointDown && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '1rem 1.25rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '14px',
                            color: '#ef4444',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.85rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}
                    >
                        <span>{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}

                {/* 2-Column Studio Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr',
                    gap: '2.5rem',
                    alignItems: 'start'
                }}>

                    {/* ── LEFT PANEL: SCRIPT & VOICE CONTROLS ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        
                        {/* Quick Presets */}
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '20px',
                            padding: '1.5rem'
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                letterSpacing: '0.12em',
                                color: 'var(--color-text-secondary)',
                                textTransform: 'uppercase',
                                marginBottom: '0.85rem',
                                fontWeight: 700
                            }}>
                                1-Click Script Starters
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                gap: '0.6rem'
                            }}>
                                {PRESET_SCRIPTS.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setScript(preset.text)}
                                        style={{
                                            padding: '0.55rem 0.85rem',
                                            backgroundColor: script === preset.text ? `color-mix(in srgb, ${ACCENT} 12%, transparent)` : 'var(--color-bg)',
                                            border: `1px solid ${script === preset.text ? ACCENT : 'var(--color-border)'}`,
                                            borderRadius: '10px',
                                            color: script === preset.text ? ACCENT : 'var(--color-text)',
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {preset.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Script Input Box */}
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.12em',
                                    color: ACCENT,
                                    textTransform: 'uppercase',
                                    fontWeight: 700
                                }}>
                                    Voiceover Script
                                </label>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    {wordCount} words · ~{estimatedSeconds}s est.
                                </div>
                            </div>

                            <textarea
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                placeholder="Paste your video script, podcast intro, hook, or narration here..."
                                rows={5}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                    resize: 'vertical',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setScript('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        padding: '4px 8px'
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Voice Selector: Mode Specific */}
                        {engineMode === 'openrouter' ? (
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div>
                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.7rem',
                                            letterSpacing: '0.12em',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 700
                                        }}>
                                            Select AI Voice Actor
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            {activeFluxVoiceObj.name} · {activeFluxVoiceObj.vibe}
                                        </div>
                                    </div>

                                    {/* Gender Filter Tabs */}
                                    <div style={{
                                        display: 'inline-flex',
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '10px',
                                        padding: '3px'
                                    }}>
                                        {['All', 'Female', 'Male'].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGenderFilter(g)}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: genderFilter === g ? ACCENT : 'transparent',
                                                    color: genderFilter === g ? '#fff' : 'var(--color-text-secondary)',
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Voice Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '0.75rem',
                                    maxHeight: '260px',
                                    overflowY: 'auto',
                                    paddingRight: '4px'
                                }}>
                                    {filteredFluxVoices.map((voice) => {
                                        const isSelected = selectedVoice === voice.id;
                                        return (
                                            <div
                                                key={voice.id}
                                                onClick={() => setSelectedVoice(voice.id)}
                                                style={{
                                                    padding: '0.85rem',
                                                    backgroundColor: isSelected ? `color-mix(in srgb, ${ACCENT} 10%, transparent)` : 'var(--color-bg)',
                                                    border: `1px solid ${isSelected ? ACCENT : 'var(--color-border)'}`,
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: isSelected ? `0 0 16px ${ACCENT_GLOW}` : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontFamily: 'var(--font-display)',
                                                        fontSize: '0.95rem',
                                                        fontWeight: 800,
                                                        color: isSelected ? ACCENT : 'var(--color-text)'
                                                    }}>
                                                        {voice.name}
                                                    </span>
                                                    <span style={{
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.55rem',
                                                        color: 'var(--color-text-muted)',
                                                        border: '1px solid var(--color-border)',
                                                        padding: '1px 5px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {voice.gender[0]}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.7rem',
                                                    color: 'var(--color-text-secondary)',
                                                    fontWeight: 500
                                                }}>
                                                    {voice.vibe}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Browser System Voices Selector */
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem'
                            }}>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.12em',
                                    color: ACCENT,
                                    textTransform: 'uppercase',
                                    fontWeight: 700
                                }}>
                                    Browser Neural Voices ({systemVoices.length} Available)
                                </div>

                                <select
                                    value={selectedSysVoice}
                                    onChange={(e) => setSelectedSysVoice(e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '0.85rem 1rem',
                                        color: 'var(--color-text)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.85rem',
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

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                            <span>Speed Multiplier</span>
                                            <span>{speechRate}x</span>
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

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                            <span>Pitch</span>
                                            <span>{speechPitch}x</span>
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

                        {/* Primary Synthesize Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleGenerate}
                            disabled={isGenerating || !script.trim()}
                            style={{
                                width: '100%',
                                padding: '1.25rem 2rem',
                                backgroundColor: isGenerating || !script.trim() ? 'var(--color-surface)' : ACCENT,
                                color: isGenerating || !script.trim() ? 'var(--color-text-muted)' : '#ffffff',
                                border: 'none',
                                borderRadius: '16px',
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                cursor: isGenerating || !script.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: isGenerating || !script.trim() ? 'none' : `0 8px 30px ${ACCENT_GLOW}`,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Mic size={20} />
                            <span>
                                {isGenerating 
                                    ? 'Synthesizing Audio...' 
                                    : engineMode === 'browser' 
                                        ? 'Play Browser Voiceover' 
                                        : 'Synthesize Flux Voiceover'}
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                marginLeft: '8px'
                            }}>
                                {engineMode === 'browser' ? 'FREE' : '1 CR'}
                            </span>
                        </motion.button>
                    </div>

                    {/* ── RIGHT PANEL: AUDIO MASTER CONSOLE ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        
                        {/* Audio Player Card */}
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            boxShadow: 'var(--shadow-raised)',
                            minHeight: '320px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AudioLines size={18} color={ACCENT} />
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.12em',
                                        color: ACCENT,
                                        textTransform: 'uppercase'
                                    }}>
                                        Master Track Console
                                    </span>
                                </div>

                                {currentAudio && (
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.65rem',
                                        color: 'var(--color-text-muted)',
                                        border: '1px solid var(--color-border)',
                                        padding: '2px 8px',
                                        borderRadius: '100px'
                                    }}>
                                        {currentAudio.engine}
                                    </span>
                                )}
                            </div>

                            {isGenerating ? (
                                <div style={{ margin: 'auto' }}>
                                    <LabLoader label={statusMessage || "Generating speech..."} accentColor={ACCENT} />
                                </div>
                            ) : currentAudio ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    {/* Waveform Visualizer simulation */}
                                    <div style={{
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '16px',
                                        padding: '1.5rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        height: '90px'
                                    }}>
                                        {Array.from({ length: 32 }).map((_, i) => {
                                            const progress = duration > 0 ? currentTime / duration : 0;
                                            const barProgress = i / 32;
                                            const isPassed = barProgress <= progress;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        height: isPlaying 
                                                            ? `${20 + Math.sin(i * 0.5 + currentTime * 8) * 35 + 20}%`
                                                            : `${25 + Math.sin(i * 0.4) * 20}%`
                                                    }}
                                                    transition={{ duration: 0.15 }}
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: isPassed ? ACCENT : 'var(--color-border)',
                                                        borderRadius: '2px',
                                                        maxWidth: '6px',
                                                        boxShadow: isPassed ? `0 0 6px ${ACCENT_GLOW}` : 'none'
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Timeline Slider */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                                                cursor: currentAudio.isBrowserSpeech ? 'default' : 'pointer'
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>

                                    {/* Playback Controls Bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button
                                                onClick={togglePlay}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    backgroundColor: ACCENT,
                                                    border: 'none',
                                                    color: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: `0 4px 16px ${ACCENT_GLOW}`,
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
                                            </button>

                                            {!currentAudio.isBrowserSpeech && (
                                                <button
                                                    onClick={() => setIsMuted(!isMuted)}
                                                    style={{
                                                        background: 'none',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '10px',
                                                        padding: '8px',
                                                        color: isMuted ? ACCENT : 'var(--color-text-secondary)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={handleCopyScript}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '0.55rem 0.85rem',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'var(--color-bg)',
                                                    border: '1px solid var(--color-border)',
                                                    color: copied ? ACCENT : 'var(--color-text)',
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                                <span>{copied ? 'Copied' : 'Copy Text'}</span>
                                            </button>

                                            {currentAudio.audioUrl && (
                                                <button
                                                    onClick={() => handleDownload(currentAudio)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '0.55rem 1rem',
                                                        borderRadius: '10px',
                                                        backgroundColor: ACCENT,
                                                        border: 'none',
                                                        color: '#ffffff',
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        boxShadow: `0 4px 12px ${ACCENT_GLOW}`
                                                    }}
                                                >
                                                    <Download size={14} />
                                                    <span>Download MP3</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Track Metadata */}
                                    <div style={{
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        padding: '0.85rem 1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>Actor Voice:</span>
                                            <span style={{ fontWeight: 700, color: ACCENT }}>{currentAudio.voiceObj?.name} ({currentAudio.voiceObj?.vibe})</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                                            "{currentAudio.script.slice(0, 100)}..."
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div style={{
                                    margin: 'auto',
                                    textAlign: 'center',
                                    padding: '2rem 1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Radio size={24} color="var(--color-text-muted)" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.4rem', fontSize: '1.1rem' }}>
                                            No Audio Master Synthesized Yet
                                        </h4>
                                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '320px', margin: 0 }}>
                                            Choose a script starter, pick your preferred voice actor on the left, and click Synthesize to generate studio voiceovers.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Generations History */}
                        {history.length > 0 && (
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.12em',
                                    color: 'var(--color-text-secondary)',
                                    textTransform: 'uppercase',
                                    fontWeight: 700
                                }}>
                                    Session Voice Clips ({history.length})
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {history.map((item, idx) => (
                                        <div
                                            key={item.id || idx}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 1rem',
                                                backgroundColor: 'var(--color-bg)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '12px',
                                                gap: '0.75rem'
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    color: 'var(--color-text)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <span>{item.voiceObj?.name}</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                        {item.engine}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.7rem',
                                                    color: 'var(--color-text-secondary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {item.script}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <button
                                                    onClick={() => {
                                                        setCurrentAudio(item);
                                                        setIsPlaying(false);
                                                    }}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '8px',
                                                        backgroundColor: 'var(--color-surface)',
                                                        border: '1px solid var(--color-border)',
                                                        color: ACCENT,
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.65rem',
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
                                                            padding: '5px 8px',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'var(--color-surface)',
                                                            border: '1px solid var(--color-border)',
                                                            color: 'var(--color-text-secondary)',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Download size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

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
                                borderRadius: '24px',
                                padding: '2rem',
                                maxWidth: '500px',
                                width: '100%',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: ACCENT
                                }}>
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                                        OpenRouter API Key
                                    </h3>
                                    <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        Required for Deepgram Flux TTS neural synthesis.
                                    </p>
                                </div>
                            </div>

                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                You can get an API key with zero upfront cost directly from your OpenRouter dashboard. Paste it below to enable voice generation directly in your browser.
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
                                    borderRadius: '12px',
                                    padding: '0.85rem 1rem',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <a 
                                    href="https://openrouter.ai/settings/keys" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{
                                        color: ACCENT,
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    Get Free Key on OpenRouter <ArrowRight size={12} />
                                </a>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setShowKeyModal(false)}
                                        style={{
                                            padding: '0.65rem 1.1rem',
                                            borderRadius: '10px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--color-border)',
                                            color: 'var(--color-text-secondary)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveKey}
                                        style={{
                                            padding: '0.65rem 1.25rem',
                                            borderRadius: '10px',
                                            backgroundColor: ACCENT,
                                            border: 'none',
                                            color: '#ffffff',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.75rem',
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
