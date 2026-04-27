import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Download, RefreshCw, Type, Image as ImageIcon } from 'lucide-react';
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
    
    const posterRef = useRef(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoadingNews(true);
        try {
            const apiKey = import.meta.env.VITE_FREENEWS_API_KEY;
            if (!apiKey) {
                // Mock Data if no API key
                setNews([
                    { title: "Gen Z Job Seekers Bring Parents to Interviews", description: "A new study shows an alarming trend in hiring." },
                    { title: "Tech Stocks Rally After AI Announcements", description: "Major tech companies see surges after new AI models." },
                    { title: "Global Coffee Shortage Drives Prices Up", description: "Climate change affects coffee belt regions severely." }
                ]);
                return;
            }

            // Attempt to fetch from our serverless proxy
            const res = await fetch('/.netlify/functions/fetch-news');
            const data = await res.json();
            if (data.articles) {
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
                    1. Write a very short, punchy 3-7 word highly engaging text hook for an image overlay. Format it like this: TEXT: [hook]
                    2. Write a 5-10 word visual prompt for an AI image generator to create the background. Format it like this: PROMPT: [visual prompt]
                    3. Write a caption with hashtags. Format it like this: CAPTION: [caption]` },
                    { role: 'user', content: `Headline: ${article.title}\nDescription: ${article.description}` }
                ]
            });

            const reply = promptData.choices?.[0]?.message?.content || '';
            
            const hookMatch = reply.match(/TEXT:\s*(.+)/i);
            const promptMatch = reply.match(/PROMPT:\s*(.+)/i);
            const captionMatch = reply.match(/CAPTION:\s*([\s\S]+)/i);

            const hook = hookMatch ? hookMatch[1].trim().toUpperCase() : article.title.toUpperCase();
            const bgPrompt = promptMatch ? promptMatch[1].trim() : "abstract modern background";
            const newCaption = captionMatch ? captionMatch[1].trim() : "Read more about this trending news!";

            setCaption(newCaption);

            // Split hook into manageable segments for easy highlighting
            const words = hook.split(' ');
            setTextSegments(words.map(w => ({ text: w, highlight: false })));

            // 2. Generate Image
            await generateImage(bgPrompt);

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
                body: JSON.stringify({ prompt, width: 1024, height: 768 }) // 4:3 ratio
            });
            const data = await response.json();
            const url = data.url || (data.images && data.images[0]?.url) || data.output || data[0]?.url;
            setBgImage(url);
        } catch (err) {
            console.error("Image gen error", err);
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
            const canvas = await html2canvas(posterRef.current, { useCORS: true, allowTaint: true, backgroundColor: '#000000' });
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

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: '80px' }}>
            {/* Sidebar News Feed */}
            <div style={{ width: '350px', borderRight: '1px solid var(--color-border)', overflowY: 'auto', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={18} /> TRENDING NEWS
                </h2>
                {loadingNews ? <div style={{ opacity: 0.5 }}>Fetching latest news...</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {news.map((n, i) => (
                            <div key={i} onClick={() => generatePost(n)} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', transition: 'border 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.border = '1px solid var(--color-accent)'} onMouseLeave={(e) => e.currentTarget.style.border = '1px solid transparent'}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{n.title}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{n.description?.substring(0, 80)}...</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Canvas Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '2rem' }}>
                {!selectedNews && !isGenerating ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>
                        SELECT_NEWS_ARTICLE_TO_BEGIN
                    </div>
                ) : (
                    <>
                        {/* Editor Controls */}
                        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                                <option value="Impact, sans-serif">Impact (Bold)</option>
                                <option value="'Arial Black', sans-serif">Arial Black</option>
                                <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
                                <option value="'Bebas Neue', cursive">Bebas Neue</option>
                            </select>
                            
                            <button onClick={() => generateImage("abstract modern background")} disabled={isGenerating} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text)', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <ImageIcon size={14} /> REGENERATE_IMG
                            </button>
                        </div>

                        {/* Visual Poster */}
                        <div 
                            ref={posterRef}
                            style={{ 
                                width: '100%', 
                                maxWidth: '500px', 
                                aspectRatio: '4/3', 
                                backgroundColor: '#111', 
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            {bgImage ? (
                                <img crossOrigin="anonymous" src={bgImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} alt="Background" />
                            ) : (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                                    <RefreshCw className="spin" size={24} opacity={0.5} />
                                </div>
                            )}

                            {/* Dark Gradient Overlay */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)', zIndex: 1 }} />

                            {/* Text Content */}
                            <div style={{ position: 'relative', zIndex: 2, padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', width: '80%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ marginTop: '-15px', backgroundColor: '#000', padding: '0 10px', borderRadius: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
                                        @YOUR_HANDLE
                                    </div>
                                </div>

                                <div style={{ fontFamily, fontSize: '2.2rem', lineHeight: 1.1, textTransform: 'uppercase', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                                    {textSegments.map((seg, i) => (
                                        <span 
                                            key={i} 
                                            onClick={() => toggleHighlight(i)}
                                            style={{ 
                                                color: seg.highlight ? 'var(--color-accent)' : '#FFF', 
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

                        {/* Export Controls */}
                        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={exportImage} disabled={isExporting} style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 900, cursor: 'pointer' }}>
                                {isExporting ? <RefreshCw className="spin" size={18} /> : <Download size={18} />}
                                EXPORT_POSTER
                            </button>
                        </div>
                        
                        <div style={{ width: '100%', maxWidth: '500px', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }}>
                            Click on any word in the poster to highlight it.
                        </div>

                        {/* AI Generated Caption */}
                        <div style={{ width: '100%', maxWidth: '500px', marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Type size={12} /> AI_SUGGESTED_CAPTION
                            </div>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                {caption}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsGeneratorPage;
