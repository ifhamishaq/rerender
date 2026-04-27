import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Download, RefreshCw, Type, Image as ImageIcon, AlignLeft, ChevronLeft, Copy, Check, Maximize, Move } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// Helper for calling Oracle AI for text generation
import { fetchOpenRouter } from '../utils/ai';

const NewsGeneratorPage = () => {
    const { user, profile, spendCredits } = useAuth();
    const navigate = useNavigate();
    const isMobile = window.innerWidth < 768;
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);
    
    // Canvas State
    const [selectedNews, setSelectedNews] = useState(null);
    const [bgImage, setBgImage] = useState(null);
    const [caption, setCaption] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Text Editor State
    const [textSegments, setTextSegments] = useState([]); // [{text: 'MOST GEN Z', highlight: false}, ...]
    const [fontFamily, setFontFamily] = useState('Impact, sans-serif');
    const [handle, setHandle] = useState(() => {
        try { return localStorage.getItem('news_gen_handle') || 'YOUR_HANDLE'; } 
        catch (e) { return 'YOUR_HANDLE'; }
    });
    const [brandColor, setBrandColor] = useState(() => {
        try { return localStorage.getItem('news_gen_brandColor') || '#E8111A'; } 
        catch (e) { return '#E8111A'; }
    });
    const [logo, setLogo] = useState(() => {
        try { return localStorage.getItem('news_gen_logo') || null; } 
        catch (e) { return null; }
    });
    const [category, setCategory] = useState('all');
    const [bgPrompt, setBgPrompt] = useState('abstract modern background');
    const [fontSizeAdjustment, setFontSizeAdjustment] = useState(0);
    const [overlayOpacity, setOverlayOpacity] = useState(0.95);
    const [aspectRatio, setAspectRatio] = useState('4/5');
    const [textPosition, setTextPosition] = useState(75); // % from top
    const [useStroke, setUseStroke] = useState(false);
    const [showWatermark, setShowWatermark] = useState(false);
    const [exportScale, setExportScale] = useState(3);
    const [copied, setCopied] = useState(false);
    const [bgUrl, setBgUrl] = useState('');
    const [tone, setTone] = useState('shocking');
    const [language, setLanguage] = useState('english');
    const [includeHashtags, setIncludeHashtags] = useState(true);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const isLifetime = profile?.is_pro == true || profile?.is_pro == 1 || profile?.is_pro == 'true' || profile?.plan === 'PRO' || profile?.role === 'admin' || profile?.plan?.toUpperCase()?.includes('PRO');
    const [letterSpacing, setLetterSpacing] = useState(-0.05);
    const [lineHeight, setLineHeight] = useState(0.85);
    const [textGlow, setTextGlow] = useState(false);
    const [view, setView] = useState('news'); // 'news' or 'gallery'
    const [recentLogos, setRecentLogos] = useState(() => {
        try { return JSON.parse(localStorage.getItem('news_gen_recent_logos')) || []; }
        catch (e) { return []; }
    });
    const [gallery, setGallery] = useState(() => {
        try { return JSON.parse(localStorage.getItem('news_gen_gallery')) || []; }
        catch (e) { return []; }
    });
    const [bgPosX, setBgPosX] = useState(50);
    const [bgPosY, setBgPosY] = useState(50);
    const [bgZoom, setBgZoom] = useState(100);
    const [isDraggingBg, setIsDraggingBg] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Save/Load settings to localStorage
    useEffect(() => {
        const saved = localStorage.getItem('news_generator_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.handle) setHandle(parsed.handle);
                if (parsed.brandColor) setBrandColor(parsed.brandColor);
                if (parsed.logo) setLogo(parsed.logo);
                if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
                if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
                if (parsed.textPosition) setTextPosition(parsed.textPosition);
                if (parsed.fontSizeAdjustment) setFontSizeAdjustment(parsed.fontSizeAdjustment);
                if (parsed.useStroke) setUseStroke(parsed.useStroke);
                if (parsed.textGlow) setTextGlow(parsed.textGlow);
                if (parsed.letterSpacing !== undefined) setLetterSpacing(parsed.letterSpacing);
                if (parsed.lineHeight !== undefined) setLineHeight(parsed.lineHeight);
            } catch (e) { console.error('Load Error:', e); }
        }
        
        const savedLogo = localStorage.getItem('news_gen_persistent_logo');
        if (savedLogo) setLogo(savedLogo);
    }, []);

    useEffect(() => {
        const settings = { handle, brandColor, fontFamily, aspectRatio, textPosition, fontSizeAdjustment, useStroke, letterSpacing, lineHeight, textGlow };
        localStorage.setItem('news_generator_settings', JSON.stringify(settings));
        
        if (logo) {
            try { 
                localStorage.setItem('news_gen_persistent_logo', logo); 
                // Add to recent if not exists
                if (!recentLogos.includes(logo)) {
                    const updated = [logo, ...recentLogos].slice(0, 5);
                    setRecentLogos(updated);
                    localStorage.setItem('news_gen_recent_logos', JSON.stringify(updated));
                }
            }
            catch (e) { console.warn('Logo too large for localStorage'); }
        } else {
            localStorage.removeItem('news_gen_persistent_logo');
        }
    }, [handle, brandColor, logo, fontFamily, aspectRatio, textPosition, fontSizeAdjustment, useStroke, letterSpacing, lineHeight, textGlow]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getCanvasDimensions = () => {
        // Base width for HD quality
        const baseWidth = 1080;
        switch(aspectRatio) {
            case '1/1': return { width: `${baseWidth}px`, height: `${baseWidth}px` };
            case '9/16': return { width: `${baseWidth}px`, height: `${Math.floor(baseWidth * 16 / 9)}px` };
            case '16/9': return { width: `${baseWidth}px`, height: `${Math.floor(baseWidth * 9 / 16)}px` };
            default: return { width: `${baseWidth}px`, height: `${Math.floor(baseWidth * 1.25)}px` }; // 4:5
        }
    };
    
    const posterRef = useRef(null);

    useEffect(() => {
        fetchNews(category);
    }, [category]);

    const fetchNews = async (currentCategory = 'all') => {
        setLoadingNews(true);
        try {
            const apiKey = import.meta.env.VITE_FREENEWS_API_KEY;
            if (!apiKey) {
                // Mock Data if no API key
                setNews([
                    { title: `[${currentCategory.toUpperCase()}] Gen Z Job Seekers Bring Parents to Interviews`, description: "A new study shows an alarming trend in hiring." },
                    { title: `[${currentCategory.toUpperCase()}] Tech Stocks Rally After AI Announcements`, description: "Major tech companies see surges after new AI models." },
                    { title: `[${currentCategory.toUpperCase()}] Global Coffee Shortage Drives Prices Up`, description: "Climate change affects coffee belt regions severely." }
                ]);
                return;
            }

            // Attempt to fetch from our serverless proxy
            const res = await fetch(`/.netlify/functions/fetch-news?topic=${currentCategory}`);
            const data = await res.json();
            if (data.data) {
                setNews(data.data.slice(0, 10));
            } else if (data.articles) {
                setNews(data.articles.slice(0, 10));
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error("Error fetching news:", err);
            // Fallback mock
            setNews([{ title: "Failed to load news. Check API key.", description: "Error fetching." }]);
        } finally {
            setLoadingNews(false);
        }
    };

    const generatePost = async (article) => {
        if (!user) {
            alert('Please login to generate content.');
            return;
        }

        const success = await spendCredits(50, 'NEWS_GENERATOR');
        if (!success) {
            alert('Insufficient credits. This costs 50 credits.');
            return;
        }

        setSelectedNews(article);
        setIsGenerating(true);
        setBgImage(null);
        setCaption('');
        setTextSegments([]);
        setBgPrompt('');
        setTextPosition(75); // Reset to bottom
        setFontSizeAdjustment(5); // Reset to large sizing

        try {
            // 1. Ask Oracle to generate a hook and a background image prompt
            const promptData = await fetchOpenRouter({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [
                    { role: 'system', content: `You are a viral social media manager. I will give you a news headline. 
                    1. Write a punchy, viral 5-10 word text hook for an image overlay. No emojis in the TEXT hook. Surround the 2 or 3 most important words with asterisks for highlighting (e.g. *BREAKING* NEWS). Format it like this: TEXT: [hook]
                    2. Write a 5-10 word visual prompt for an AI image generator to create the background. Format it like this: PROMPT: [visual prompt]
                    3. Write a long, engaging caption with emojis${includeHashtags ? ' and trending hashtags' : ''}. Format it like this: CAPTION: [caption]
                    
                    Tone: ${tone.toUpperCase()}
                    Language: ${language.toUpperCase()}` },
                    { role: 'user', content: `Headline: ${article.title}\nDescription: ${article.description}` }
                ]
            });

            const reply = promptData.choices?.[0]?.message?.content || '';
            
            const hookMatch = reply.match(/TEXT:\s*(.+)/i);
            const promptMatch = reply.match(/PROMPT:\s*(.+)/i);
            const captionMatch = reply.match(/CAPTION:\s*([\s\S]+)/i);

            const hook = hookMatch ? hookMatch[1].trim().toUpperCase() : article.title.toUpperCase();
            const generatedPrompt = promptMatch ? promptMatch[1].trim() : "abstract modern background";
            const newCaption = captionMatch ? captionMatch[1].trim() : "Read more about this trending news!";

            setBgPrompt(generatedPrompt);
            setCaption(newCaption);

            // Split hook into manageable segments for easy highlighting
            const words = hook.split(' ');
            setTextSegments(words.map(w => {
                const isHighlighted = w.includes('*');
                return { text: w.replace(/\*/g, ''), highlight: isHighlighted };
            }));

            // 2. Generate Image
            await generateImage(generatedPrompt);

        } catch (err) {
            console.error(err);
            alert("Error generating content.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateImage = async (prompt) => {
        setBgImage(null);
        try {
            const response = await fetch('/.netlify/functions/generate-wallpaper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, width: 1080, height: 1350 }) // 4:5 ratio HD
            });
            const data = await response.json();
            const url = data.url || (data.images && data.images[0]?.url) || data.output || data[0]?.url;
            if (url) {
                const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1200&q=90`;
                setBgImage(proxiedUrl);
            }
        } catch (err) {
            console.error("Image gen error", err);
        }
    };

    const loadFromGallery = (item) => {
        if (item.bgImage) setBgImage(item.bgImage);
        if (item.textSegments) setTextSegments(item.textSegments);
        if (item.caption) setCaption(item.caption);
        if (item.aspectRatio) setAspectRatio(item.aspectRatio);
        setView('news');
    };

    const regenerateHook = async () => {
        if (!selectedNews) return;
        setIsGenerating(true);
        try {
            const promptData = await fetchOpenRouter({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [
                    { role: 'system', content: `Give me a DIFFERENT viral 5-10 word text hook for this news. Surround 2-3 words with asterisks. Format: TEXT: [hook]` },
                    { role: 'user', content: `Headline: ${selectedNews.title}` }
                ]
            });
            const reply = promptData.choices?.[0]?.message?.content || '';
            const hookMatch = reply.match(/TEXT:\s*(.+)/i);
            if (hookMatch) {
                const hook = hookMatch[1].trim().toUpperCase();
                const words = hook.split(' ');
                setTextSegments(words.map(w => ({ text: w.replace(/\*/g, ''), highlight: w.includes('*') })));
            }
        } catch (err) { console.error(err); } finally { setIsGenerating(false); }
    };

    const regenerateCaption = async () => {
        if (!selectedNews) return;
        setIsGenerating(true);
        try {
            const promptData = await fetchOpenRouter({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [
                    { role: 'system', content: `Write a long, engaging Instagram caption for this news with emojis and hashtags. Format: CAPTION: [caption]` },
                    { role: 'user', content: `Headline: ${selectedNews.title}` }
                ]
            });
            const reply = promptData.choices?.[0]?.message?.content || '';
            const captionMatch = reply.match(/CAPTION:\s*([\s\S]+)/i);
            if (captionMatch) setCaption(captionMatch[1].trim());
        } catch (err) { console.error(err); } finally { setIsGenerating(false); }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setLogo(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCustomBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setBgImage(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleHighlight = (index) => {
        const newSegments = [...textSegments];
        newSegments[index].highlight = !newSegments[index].highlight;
        setTextSegments(newSegments);
    };

    const handleDragMove = (e) => {
        if (!isDraggingBg) return;
        const dx = (e.clientX - dragStart.x) / 5;
        const dy = (e.clientY - dragStart.y) / 5;
        setBgPosX(prev => Math.max(0, Math.min(100, prev + dx)));
        setBgPosY(prev => Math.max(0, Math.min(100, prev + dy)));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const exportImage = async () => {
        if (!posterRef.current || !bgImage) return;
        
        const success = await spendCredits(50, 'NEWS_EXPORT');
        if (!success) {
            alert('Insufficient credits to export HD Post. (Requires 50 Credits)');
            return;
        }

        setIsExporting(true);
        try {
            // High-fidelity capture settings
            const canvas = await html2canvas(posterRef.current, { 
                useCORS: true, 
                scale: 2, // 2x for retina quality without bloating file size
                backgroundColor: '#000',
                imageTimeout: 0,
                logging: false,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    // Forcefully remove watermark in the capture clone if Pro
                    if (isLifetime) {
                        const wm = clonedDoc.querySelector('[data-watermark="oracle"]');
                        if (wm) wm.style.display = 'none';
                    }
                    // Fix potential color shifting by ensuring backgrounds are solid
                    const poster = clonedDoc.querySelector('.poster-canvas');
                    if (poster) {
                        poster.style.boxShadow = 'none';
                        poster.style.border = 'none';
                    }
                }
            });
            const img = canvas.toDataURL('image/png', 1.0); // Maximum quality
            
            // 3. Set background (Proxying through images.weserv.nl to fix CORS export issues)
            const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(bgImage)}&w=1200&q=90`;
            
            // Save to gallery
            const newDesign = {
                id: Date.now(),
                title: selectedNews?.title || 'Untitled',
                bgImage: proxiedUrl, 
                textSegments: textSegments,
                caption: caption,
                aspectRatio,
                date: new Date().toLocaleDateString()
            };
            const updatedGallery = [newDesign, ...gallery].slice(0, 20);
            setGallery(updatedGallery);
            localStorage.setItem('news_gen_gallery', JSON.stringify(updatedGallery));

            const link = document.createElement('a');
            link.download = `ORACLE_${Date.now()}.png`;
            link.href = img;
            link.click();
        } catch (err) {
            console.error("Export error", err);
        } finally {
            setIsExporting(false);
        }
    };

    const getFontSize = () => {
        const totalChars = textSegments.reduce((acc, s) => acc + s.text.length, 0);
        let baseSize = 8.5; // Increased for HD base
        if (totalChars > 50) baseSize = 4.5;
        else if (totalChars > 35) baseSize = 5.5;
        else if (totalChars > 20) baseSize = 7.0;
        
        // Multiplier based on aspect ratio width
        let widthMultiplier = 1;
        if (aspectRatio === '9/16') widthMultiplier = 0.8;
        if (aspectRatio === '16/9') widthMultiplier = 1.4;
        
        return `${(baseSize + (fontSizeAdjustment / 5)) * widthMultiplier}rem`;
    };

    const handleHeadlineEdit = (val) => {
        const words = val.toUpperCase().split(' ');
        setTextSegments(words.map(w => ({ text: w, highlight: false })));
    };

    return (
        <div className="workspace-root" style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', overflowX: 'hidden' }}>
            {/* Inject custom scrollbar styling for this page */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@700&display=swap');

                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.01);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.1);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: var(--color-accent);
                    }
                    .workspace-root div {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255,255,255,0.1) transparent;
                    }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    
                    @media (max-width: 1024px) {
                        .workspace-main {
                            flex-direction: column !important;
                        }
                        .news-sidebar, .design-sidebar {
                            width: 100% !important;
                            height: auto !important;
                            border: none !important;
                            position: relative !important;
                            top: 0 !important;
                        }
                    }
                `}
            </style>

            <div className="workspace-main" style={{ flex: 1, display: 'flex', overflow: 'visible', paddingTop: '60px' }}>
                {/* Sidebar News Feed */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="news-sidebar custom-scrollbar" 
                    style={{ 
                        width: '320px', flexShrink: 0, height: 'calc(100vh - 60px)', borderRight: '2px solid var(--color-text)', 
                        display: 'flex', flexDirection: 'column', padding: '2rem', backgroundColor: 'var(--color-bg)', 
                        overflowY: 'auto', zIndex: 10, position: 'sticky', top: '60px',
                        scrollbarWidth: 'none', msOverflowStyle: 'none'
                    }}
                >
                    <header style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, opacity: 0.8 }}>NEWS_FEED</h2>
                    </header>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                        <button 
                            onClick={() => navigate('/tools')} 
                            style={{ 
                                padding: '0.6rem 1rem', borderRadius: '4px', backgroundColor: 'transparent', border: '2px solid var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase'
                            }}
                        >
                            <ChevronLeft size={16} /> BACK
                        </button>
                    </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-text)' }}>
                    <button 
                        onClick={() => setView('news')}
                        style={{ padding: '0.75rem 0', flex: 1, border: 'none', background: 'none', color: view === 'news' ? 'var(--color-accent)' : 'var(--color-text)', fontWeight: 900, fontSize: '0.75rem', borderBottom: view === 'news' ? '4px solid var(--color-accent)' : 'none', cursor: 'pointer', opacity: view === 'news' ? 1 : 0.4, transition: 'all 0.2s' }}
                    >
                        NEWS
                    </button>
                    <button 
                        onClick={() => setView('gallery')}
                        style={{ padding: '0.75rem 0', flex: 1, border: 'none', background: 'none', color: view === 'gallery' ? 'var(--color-accent)' : 'var(--color-text)', fontWeight: 900, fontSize: '0.75rem', borderBottom: view === 'gallery' ? '4px solid var(--color-accent)' : 'none', cursor: 'pointer', opacity: view === 'gallery' ? 1 : 0.4, transition: 'all 0.2s' }}
                    >
                        GALLERY ({gallery.length})
                    </button>
                </div>

                {view === 'news' ? (
                    <>
                        {/* Categories */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {['all', 'business', 'technology', 'sports', 'entertainment', 'science', 'health'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                padding: '0.25rem 0.75rem',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                fontWeight: 800,
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: category === cat ? 'var(--color-accent)' : 'var(--color-border)',
                                backgroundColor: category === cat ? 'var(--color-accent)' : 'transparent',
                                color: category === cat ? '#FFF' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Scrollable News List */}
                <div 
                    style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        paddingRight: '0.5rem',
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1rem' 
                    }}
                    className="custom-scrollbar"
                >
                    {loadingNews ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0.2 }}
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                    style={{ 
                                        height: '80px', 
                                        backgroundColor: 'var(--color-surface)', 
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)',
                                        opacity: 0.3
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {news.map((n, i) => (
                                <div key={i} onClick={() => generatePost(n)} style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--color-border)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{n.title}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, color: 'var(--color-text-secondary)' }}>{n.description?.substring(0, 80)}...</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                </>
                ) : (
                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                        {gallery.length === 0 ? (
                            <div style={{ opacity: 0.4, fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>NO_SAVED_DESIGNS</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0.5rem' }}>
                                {gallery.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => loadFromGallery(item)} 
                                        style={{ 
                                            aspectRatio: '4/5', 
                                            borderRadius: '8px', 
                                            overflow: 'hidden', 
                                            cursor: 'pointer', 
                                            border: '1px solid var(--color-border)',
                                            position: 'relative',
                                            backgroundColor: '#000'
                                        }}
                                    >
                                        <img src={item.bgImage} alt="Saved Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', fontSize: '0.5rem', color: '#FFF', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                </motion.div>

                {/* Main Preview Area */}
                <div className="preview-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '4rem 2rem', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
                    
                    <header style={{ width: '100%', maxWidth: '1000px', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#FF4F00', letterSpacing: '0.4em', textTransform: 'uppercase' }}>DREAM_OF_NETHERLANDS</div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '4px solid var(--color-text)', paddingBottom: '1rem' }}>
                            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.06em', lineHeight: 0.9 }}>POST_STUDIO</h1>
                            <div style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.3 }}>VOL. 26.04</div>
                        </div>
                    </header>
                {!selectedNews && !isGenerating ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: '0.8rem' }}
                    >
                        SELECT_NEWS_ARTICLE_TO_BEGIN
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', width: '100%', maxWidth: '800px' }}
                    >
                        <div style={{ 
                            border: '2px solid var(--color-text)', 
                            boxShadow: '20px 20px 0px rgba(0,0,0,0.1)', 
                            overflow: 'hidden', 
                            flexShrink: 0,
                            zoom: isMobile ? 0.3 : 0.45 // Scale down for preview while keeping HD internal dimensions
                        }}>
                            <div 
                                ref={posterRef}
                                className="poster-canvas"
                                onMouseDown={(e) => {
                                    if (e.target.tagName !== 'SPAN') {
                                        setIsDraggingBg(true);
                                        setDragStart({ x: e.clientX, y: e.clientY });
                                    }
                                }}
                                onMouseMove={handleDragMove}
                                onMouseUp={() => setIsDraggingBg(false)}
                                onMouseLeave={() => setIsDraggingBg(false)}
                                style={{ 
                                    ...getCanvasDimensions(),
                                    backgroundColor: '#050505', 
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    cursor: isDraggingBg ? 'grabbing' : 'grab',
                                    userSelect: 'none'
                                }}
                            >
                                {bgImage ? (
                                    <img 
                                        crossOrigin="anonymous"
                                        src={bgImage} 
                                        alt="Background" 
                                        style={{ 
                                            position: 'absolute', 
                                            top: `${bgPosY}%`, 
                                            left: `${bgPosX}%`, 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover',
                                            transform: `translate(-50%, -50%) scale(${bgZoom / 100})`,
                                            zIndex: 0,
                                            transition: isDraggingBg ? 'none' : 'transform 0.1s ease-out'
                                        }} 
                                    />
                                ) : (
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                                        <RefreshCw className="spin" size={24} color="var(--color-accent)" />
                                    </div>
                                )}

                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%', background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.7}) 40%, transparent 100%)`, zIndex: 1 }} />

                                <div style={{ 
                                    position: 'absolute', 
                                    top: `${textPosition}%`, 
                                    transform: 'translateY(-50%)', 
                                    zIndex: 2, 
                                    padding: '0 80px', // Scaled for HD
                                    width: '100%', 
                                    boxSizing: 'border-box', 
                                    textAlign: 'center', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <div style={{ position: 'relative', width: '100%', marginBottom: '40px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '10%', width: '30%', height: '3px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.6))', zIndex: 0 }} />
                                        <div style={{ position: 'absolute', top: '50%', right: '10%', width: '30%', height: '3px', background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.6))', zIndex: 0 }} />
                                        <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'transparent', padding: '0 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            {logo ? (
                                                <div style={{ 
                                                    width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #FFF', 
                                                    overflow: 'hidden', flexShrink: 0, backgroundColor: '#000', 
                                                    boxShadow: '0 0 30px rgba(255,255,255,0.2)',
                                                    backgroundImage: `url(${logo})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }} />
                                            ) : (
                                                <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: brandColor, border: '4px solid #FFF', flexShrink: 0 }} />
                                            )}
                                            <span style={{ color: '#FFF', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '15px', textShadow: '0 4px 8px rgba(0,0,0,0.8)', fontFamily: 'var(--font-sans)' }}>@{handle}</span>
                                        </div>
                                    </div>

                                    <div style={{ fontFamily, fontSize: getFontSize(), width: '100%', boxSizing: 'border-box', lineHeight: lineHeight, fontWeight: 'normal', textTransform: 'uppercase', textShadow: textGlow ? `0 0 12px ${brandColor}, 0 0 20px ${brandColor}` : (useStroke ? 'none' : '0 10px 25px rgba(0,0,0,0.8)'), paintOrder: useStroke ? 'stroke fill' : 'normal', WebkitTextStroke: useStroke ? `8px #000` : '0px transparent', wordWrap: 'break-word', letterSpacing: `${letterSpacing}em` }}>
                                        {textSegments.map((seg, i) => (
                                            <span key={i} onClick={() => toggleHighlight(i)} style={{ color: seg.highlight ? brandColor : '#FFF', cursor: 'pointer', display: 'inline-block', margin: '0 0.5rem', textShadow: textGlow ? `0 0 15px ${seg.highlight ? brandColor : '#FFF'}, 0 10px 25px rgba(0,0,0,0.8)` : (useStroke ? 'none' : '0 10px 25px rgba(0,0,0,0.8)') }}>{seg.text}</span>
                                        ))}
                                    </div>
                                </div>

                                {!isLifetime && (
                                    <div 
                                        data-watermark="oracle"
                                        style={{ position: 'absolute', bottom: '40px', right: '40px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '15px' }}
                                    >
                                        <div style={{ opacity: 0.4, fontSize: '1.2rem', fontWeight: 900, color: '#FFF', letterSpacing: '0.2em' }}>MADE_WITH_ORACLE</div>
                                        <button onClick={() => setShowUnlockModal(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ width: '100%', maxWidth: getCanvasDimensions().width, marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <motion.button 
                                    whileHover={{ scale: 1.01, backgroundColor: '#FF4F00', color: '#FFF' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => generateImage(bgPrompt)} 
                                    disabled={isGenerating} 
                                    style={{ padding: '1.2rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}
                                >
                                    <ImageIcon size={18} /> AI_IMAGE
                                </motion.button>
                                <motion.label 
                                    whileHover={{ scale: 1.01, border: '1px solid #FF4F00' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ padding: '1.2rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em' }}
                                >
                                    <Camera size={18} /> CUSTOM_BG
                                    <input type="file" accept="image/*" onChange={handleCustomBgUpload} style={{ display: 'none' }} />
                                </motion.label>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: 'var(--color-surface)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                <input 
                                    type="text" 
                                    placeholder="Paste Image URL..." 
                                    value={bgUrl}
                                    onChange={(e) => setBgUrl(e.target.value)}
                                    onBlur={() => bgUrl && setBgImage(bgUrl)}
                                    style={{ flex: '1 1 300px', padding: '0.8rem', backgroundColor: 'transparent', color: 'var(--color-text)', border: 'none', outline: 'none', fontSize: '0.8rem', fontWeight: 500 }}
                                />
                                <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0.5rem 0', display: isMobile ? 'none' : 'block' }} />
                                <button 
                                    onClick={regenerateHook} 
                                    disabled={isGenerating} 
                                    style={{ flex: isMobile ? '1 1 100%' : '0 0 auto', padding: '0.8rem 1.5rem', backgroundColor: 'transparent', color: '#FF4F00', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.05em' }}
                                >
                                    <Type size={16} /> REGENERATE_HOOK
                                </button>
                            </div>
                        </div>

                        <div style={{ width: '100%', maxWidth: getCanvasDimensions().width, marginTop: '1rem', boxSizing: 'border-box' }}>
                            <motion.button 
                                whileHover={{ scale: 1.01, boxShadow: '0 15px 40px rgba(255,79,0,0.3)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={exportImage} 
                                disabled={isExporting || !bgImage}
                                style={{ 
                                    width: '100%', padding: '1.4rem', backgroundColor: '#FF4F00', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', opacity: (isExporting || !bgImage) ? 0.5 : 1, transition: 'all 0.3s ease'
                                }}
                            >
                                {isExporting ? <RefreshCw className="spin" size={20} /> : <Download size={20} />}
                                {isExporting ? 'PREPARING_ASSETS...' : `DOWNLOAD ${aspectRatio} POST`}
                            </motion.button>
                            <div style={{ fontSize: '0.6rem', textAlign: 'center', marginTop: '0.5rem', opacity: 0.5, letterSpacing: '0.05em' }}>
                                COST: 50 CREDITS PER EXPORT
                            </div>
                        </div>

                        <div style={{ width: '100%', maxWidth: '600px', padding: '2rem', backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.1em' }}>POST_CAPTION</div>
                                <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.7rem', fontWeight: 900, color: copied ? 'var(--color-accent)' : 'var(--color-text)', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '30px', transition: 'all 0.2s' }}>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'COPIED' : 'COPY'}
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif' }}>
                                {caption || 'Caption will appear here...'}
                            </div>
                        </div>
                        <div style={{ height: '4rem' }} />
                    </motion.div>
                )}
            </div>

                {/* Right Sidebar: Design Controls */}
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="design-sidebar" 
                    style={{ 
                        width: '350px', flexShrink: 0, borderLeft: '2px solid var(--color-text)', 
                        backgroundColor: 'var(--color-bg)', padding: '2rem', display: 'flex', 
                        flexDirection: 'column', gap: '2rem', color: 'var(--color-text)', zIndex: 10 
                    }}
                >
                    <header style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, opacity: 0.8 }}>DIRECTOR_KIT</h2>
                    </header>
                
                {selectedNews && (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea 
                                value={textSegments.map(s => s.text).join(' ')}
                                onChange={(e) => handleHeadlineEdit(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem', minHeight: '80px', fontFamily: 'inherit', lineHeight: 1.4 }}
                            />
                            <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>* Click words on the poster to toggle highlights.</div>
                        </div>

                        <div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <AlignLeft size={12} /> TEXT_SETTINGS
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.4rem' }}>VERTICAL_POSITION ({textPosition}%)</div>
                                        <input type="range" min="10" max="90" value={textPosition} onChange={(e) => setTextPosition(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.4rem' }}>FONT_SIZE_ADJUST</div>
                                        <input type="range" min="-20" max="30" value={fontSizeAdjustment} onChange={(e) => setFontSizeAdjustment(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Maximize size={12} /> ASPECT_RATIO
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {['4/5', '1/1', '9/16', '16/9'].map(ratio => (
                                        <button 
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            style={{ 
                                                flex: 1, padding: '0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900,
                                                backgroundColor: aspectRatio === ratio ? 'var(--color-accent)' : 'var(--color-surface)',
                                                color: aspectRatio === ratio ? '#000' : 'var(--color-text)',
                                                border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Move size={12} /> IMAGE_CONTROLS
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setBgPosX(50);
                                            setBgPosY(50);
                                            setBgZoom(100);
                                        }}
                                        style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 900 }}
                                    >
                                        RESET_DEFAULT
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.4rem' }}>POS_X ({bgPosX}%)</div>
                                            <input type="range" min="0" max="100" value={bgPosX} onChange={(e) => setBgPosX(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.4rem' }}>POS_Y ({bgPosY}%)</div>
                                            <input type="range" min="0" max="100" value={bgPosY} onChange={(e) => setBgPosY(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.4rem' }}>ZOOM ({bgZoom}%)</div>
                                        <input type="range" min="50" max="300" value={bgZoom} onChange={(e) => setBgZoom(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>LETTER_SPACING ({letterSpacing}em)</div>
                                    <input type="range" min="-0.1" max="0.2" step="0.01" value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>LINE_HEIGHT ({lineHeight})</div>
                                    <input type="range" min="0.7" max="1.5" step="0.05" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button 
                                    onClick={() => setUseStroke(!useStroke)}
                                    style={{ 
                                        flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)',
                                        backgroundColor: useStroke ? 'var(--color-text)' : 'var(--color-surface)',
                                        color: useStroke ? 'var(--color-bg)' : 'var(--color-text)',
                                        fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    TEXT_STROKE
                                </button>
                                <button 
                                    onClick={() => setTextGlow(!textGlow)}
                                    style={{ 
                                        flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)',
                                        backgroundColor: textGlow ? brandColor : 'var(--color-surface)',
                                        color: textGlow ? '#000' : 'var(--color-text)',
                                        fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: textGlow ? `0 0 15px ${brandColor}` : 'none'
                                    }}
                                >
                                    NEON_GLOW
                                </button>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)' }}>FONT_FAMILY</div>
                                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                                    <option value="Impact, sans-serif">Impact (Bold)</option>
                                    <option value="'Oswald', sans-serif">Oswald (Bold)</option>
                                    <option value="'Arial Black', sans-serif">Arial Black</option>
                                    <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
                                    <option value="'Bebas Neue', cursive">Bebas Neue</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)' }}>FONT_SIZE</div>
                                    <input type="range" min="-10" max="30" value={fontSizeAdjustment} onChange={(e) => setFontSizeAdjustment(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)' }}>OVERLAY</div>
                                    <input type="range" min="0" max="100" value={overlayOpacity * 100} onChange={(e) => setOverlayOpacity(parseInt(e.target.value) / 100)} style={{ width: '100%', accentColor: 'var(--color-accent)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)' }}>EXPORT_SCALE</div>
                                    <select value={exportScale} onChange={(e) => setExportScale(parseInt(e.target.value))} style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                                        <option value="1">1x (SD)</option>
                                        <option value="2">2x (Retina)</option>
                                        <option value="3">3x (HD)</option>
                                        <option value="4">4x (Ultra HD)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ flex: 1, paddingBottom: '3rem' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '1.2rem', color: 'var(--color-text-secondary)' }}>BRANDING</div>
                                
                                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                    <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Handle" style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }} />
                                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ width: '45px', height: '45px', padding: '0', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <label style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--color-text)', color: '#000', borderRadius: '4px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', textTransform: 'uppercase', textAlign: 'center' }}>
                                        UPLOAD_LOGO
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                    </label>
                                    {logo && (
                                        <button onClick={() => setLogo(null)} style={{ padding: '0.8rem', border: '2px solid var(--color-text)', backgroundColor: 'transparent', color: 'var(--color-text)', borderRadius: '4px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}>✕</button>
                                    )}
                                </div>

                                {recentLogos.length > 1 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '0.8rem', letterSpacing: '0.1em' }}>RECENT_LOGOS</div>
                                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                            {recentLogos.map((lg, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => setLogo(lg)}
                                                    style={{ 
                                                        width: '36px', height: '36px', borderRadius: '50%', border: logo === lg ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', 
                                                        backgroundImage: `url(${lg})`, backgroundSize: 'cover', cursor: 'pointer', transition: 'all 0.2s', opacity: logo === lg ? 1 : 0.4,
                                                        boxShadow: logo === lg ? `0 0 10px ${brandColor}44` : 'none'
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
                </motion.div>
            </div>

            {/* Monetization Modal */}
            {showUnlockModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>REMOVE_WATERMARK</h2>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Unlock lifetime watermark removal and professional export scaling for a one-time fee.</p>
                        </div>
                        
                        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)' }}>$50</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginTop: '0.2rem' }}>LIFETIME_ACCESS</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <a 
                                href="https://www.paypal.com/paypalme/ImadWani96/50" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ flex: 1, padding: '1rem', backgroundColor: '#0070ba', color: '#FFF', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, fontSize: '0.8rem' }}
                            >
                                PAYPAL
                            </a>
                            <a 
                                href="https://wise.com/pay/business/imaddudinwani?utm_source=open_link" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ flex: 1, padding: '1rem', backgroundColor: '#00b9ff', color: '#FFF', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, fontSize: '0.8rem' }}
                            >
                                WISE
                            </a>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800 }}>ENTER_TRANSACTION_ID</div>
                            <input 
                                type="text" 
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Txn: 123456789..."
                                style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '0.8rem' }}
                            />
                            <button 
                                onClick={async () => {
                                    if (!transactionId) return alert('Please enter Transaction ID');
                                    await supabase.from('admin_requests').insert({ user_id: user.id, type: 'WATERMARK_REMOVAL', txn_id: transactionId });
                                    alert('Request submitted! Our team will verify and activate your lifetime access.');
                                    setShowUnlockModal(false);
                                }}
                                style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-accent)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}
                            >
                                SUBMIT_FOR_VERIFICATION
                            </button>
                        </div>

                        <button onClick={() => setShowUnlockModal(false)} style={{ border: 'none', backgroundColor: 'transparent', color: 'var(--color-text)', opacity: 0.5, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                            MAYBE_LATER
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsGeneratorPage;
