import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Download, RefreshCw, Type, Image as ImageIcon, AlignLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// Helper for calling Oracle AI for text generation
import { fetchOpenRouter } from '../utils/ai';

const NewsGeneratorPage = () => {
    const { user, spendCredits } = useAuth();
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
    
    // Save settings to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('news_gen_handle', handle);
            localStorage.setItem('news_gen_brandColor', brandColor);
            if (logo && logo.startsWith('data:') && logo.length < 2000000) { // Limit to 2MB
                localStorage.setItem('news_gen_logo', logo);
            }
        } catch (e) {
            console.warn("LocalStorage quota exceeded, branding not saved.");
        }
    }, [handle, brandColor, logo]);
    
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

        const success = await spendCredits(10, 'NEWS_GENERATOR');
        if (!success) {
            alert('Insufficient credits. This costs 10 credits.');
            return;
        }

        setSelectedNews(article);
        setIsGenerating(true);

        try {
            // 1. Ask Oracle to generate a hook and a background image prompt
            const promptData = await fetchOpenRouter({
                model: 'baidu/qianfan-ocr-fast:free',
                messages: [
                    { role: 'system', content: `You are a viral social media manager. I will give you a news headline. 
                    1. Write a punchy, viral 5-10 word text hook for an image overlay. Surround the 2 or 3 most important words with asterisks for highlighting (e.g. *BREAKING* NEWS). Format it like this: TEXT: [hook]
                    2. Write a 5-10 word visual prompt for an AI image generator to create the background. Format it like this: PROMPT: [visual prompt]
                    3. Write a long, engaging caption with emojis and trending hashtags. Format it like this: CAPTION: [caption]` },
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
            setBgImage(url);
        } catch (err) {
            console.error("Image gen error", err);
        }
    };

    const regenerateHook = async () => {
        if (!selectedNews) return;
        setIsGenerating(true);
        try {
            const promptData = await fetchOpenRouter({
                model: 'baidu/qianfan-ocr-fast:free',
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
                model: 'baidu/qianfan-ocr-fast:free',
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

    const exportImage = async () => {
        if (!posterRef.current || !bgImage) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(posterRef.current, { 
                useCORS: true, 
                allowTaint: true, 
                backgroundColor: '#000000',
                scale: 3 // Forces 3x resolution for export
            });
            const link = document.createElement('a');
            link.download = 'news-post.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Export error", err);
        } finally {
            setIsExporting(false);
        }
    };

    const getFontSize = () => {
        const totalChars = textSegments.reduce((acc, s) => acc + s.text.length, 0);
        let baseSize = 3.5;
        if (totalChars > 50) baseSize = 1.8;
        else if (totalChars > 35) baseSize = 2.3;
        else if (totalChars > 20) baseSize = 2.9;
        
        return `${baseSize + (fontSizeAdjustment / 10)}rem`;
    };

    const handleHeadlineEdit = (val) => {
        const words = val.toUpperCase().split(' ');
        setTextSegments(words.map(w => ({ text: w, highlight: false })));
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', boxSizing: 'border-box', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: '40px', overflow: 'hidden', zIndex: 10 }}>
            {/* Inject custom scrollbar styling for this page */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@700&display=swap');

                    .news-sidebar::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .news-sidebar::-webkit-scrollbar-track, .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.02);
                    }
                    .news-sidebar::-webkit-scrollbar-thumb, .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.1);
                        border-radius: 10px;
                    }
                    .news-sidebar::-webkit-scrollbar-thumb:hover, .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: var(--color-accent);
                    }
                `}
            </style>

            {/* Sidebar News Feed */}
            <div className="news-sidebar" style={{ width: '280px', flexShrink: 0, height: '100%', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', padding: '1.2rem', backgroundColor: 'var(--color-bg)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                    <RefreshCw size={18} className={loadingNews ? 'spin' : ''} /> TRENDING NEWS
                </h2>

                {/* Categories */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
                    onWheel={(e) => e.stopPropagation()}
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
            </div>

            {/* Main Preview Area */}
            <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '1rem', backgroundColor: 'var(--color-surface)', backgroundImage: 'radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, transparent 100%)' }}>
                {!selectedNews && !isGenerating ? (
                    <div style={{ opacity: 0.5, fontFamily: 'var(--font-mono)' }}>
                        SELECT_NEWS_ARTICLE_TO_BEGIN
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        {/* Visual Poster */}
                        <div 
                            ref={posterRef}
                            style={{ 
                                width: '500px', 
                                height: '625px', 
                                flexShrink: 0,
                                backgroundColor: '#111', 
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
                            }}
                        >
                            {bgImage ? (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, left: 0, 
                                    width: '100%', height: '100%', 
                                    backgroundImage: `url(${bgImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    zIndex: 0 
                                }} />
                            ) : (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                                    <RefreshCw className="spin" size={24} opacity={0.5} />
                                </div>
                            )}

                            {/* Dark Gradient Overlay */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.8}) 50%, transparent 100%)`, zIndex: 1 }} />

                            {/* Text Content */}
                            <div style={{ position: 'relative', zIndex: 2, padding: '3rem 1rem', width: '100%', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ position: 'relative', width: '95%', marginBottom: '1.8rem', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 0 }} />
                                    <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'transparent', padding: '4px 12px', height: '32px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        {logo ? (
                                            <img crossOrigin="anonymous" src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                                        ) : (
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: brandColor }} />
                                        )}
                                        <span style={{ color: '#FFF', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', height: '28px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>@{handle}</span>
                                    </div>
                                </div>

                                <div style={{ fontFamily, fontSize: getFontSize(), width: '100%', padding: '0 0.5rem', boxSizing: 'border-box', lineHeight: 1.1, textTransform: 'uppercase', textShadow: '0 4px 10px rgba(0,0,0,0.5)', wordWrap: 'break-word' }}>
                                    {textSegments.map((seg, i) => (
                                        <span 
                                            key={i} 
                                            onClick={() => toggleHighlight(i)}
                                            style={{ 
                                                color: seg.highlight ? brandColor : '#FFF', 
                                                cursor: 'pointer',
                                                display: 'inline-block',
                                                margin: '0 0.3rem'
                                            }}
                                        >
                                            {seg.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Regeneration Tools */}
                        <div style={{ width: '432px', marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => generateImage(bgPrompt)} disabled={isGenerating} style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                <ImageIcon size={14} /> AI_IMAGE
                            </button>
                            <label style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                <Camera size={14} /> CUSTOM_BG
                                <input type="file" accept="image/*" onChange={handleCustomBgUpload} style={{ display: 'none' }} />
                            </label>
                            <button onClick={regenerateHook} disabled={isGenerating} style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                <Type size={14} /> HOOK
                            </button>
                            <button onClick={regenerateCaption} disabled={isGenerating} style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                <AlignLeft size={14} /> CAPTION
                            </button>
                        </div>

                        {/* HD Export Button */}
                        <button 
                            onClick={exportImage} 
                            disabled={isExporting || !bgImage}
                            style={{ 
                                width: '432px',
                                marginTop: '1rem',
                                padding: '1.2rem', 
                                backgroundColor: 'var(--color-accent)', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontWeight: 900, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.8rem', 
                                cursor: 'pointer',
                                fontSize: '1rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                opacity: (isExporting || !bgImage) ? 0.5 : 1
                            }}
                        >
                            {isExporting ? <RefreshCw className="spin" size={18} /> : <Download size={18} />}
                            {isExporting ? 'EXPORTING_HD...' : 'DOWNLOAD HD POST'}
                        </button>
                    </div>
                )}
            </div>

            {/* Right Sidebar: Design Controls */}
            <div style={{ width: '300px', flexShrink: 0, height: '100%', borderLeft: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', color: 'var(--color-text)' }} className="custom-scrollbar">
                <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8, color: 'var(--color-text)' }}>DESIGN_CONTROLS</h3>
                
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                            <div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.8rem', color: 'var(--color-text-secondary)' }}>BRANDING</div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Handle" style={{ flex: 1, padding: '0.6rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.8rem' }} />
                                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }} />
                                    <label style={{ padding: '0.6rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--color-text)' }}>
                                        <Camera size={18} />
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>POST_CAPTION</div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '8px', fontSize: '0.75rem', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto', color: 'var(--color-text)' }}>
                                {caption || 'Caption will appear here...'}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsGeneratorPage;
