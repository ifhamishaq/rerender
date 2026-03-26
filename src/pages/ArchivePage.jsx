import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Filter, Eye, Copy, Heart, Share2, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';

const TYPE_FILTERS = [
    { id: 'all', label: 'ALL_ASSETS' },
    { id: 'wallpaper', label: 'WALLPAPERS' },
    { id: 'thumbnail', label: 'ANALYSES' },
    { id: 'caption', label: 'CAPTIONS' }
];

const ArchivePage = () => {
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchArchive();
    }, [filter]);

    const fetchArchive = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('community_archive')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('type', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setAssets(data || []);
        } catch (err) {
            console.error('Error fetching archive:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (id, currentLikes) => {
        const { error } = await supabase
            .from('community_archive')
            .update({ likes_count: (currentLikes || 0) + 1 })
            .eq('id', id);
        
        if (!error) {
            setAssets(prev => prev.map(a => 
                a.id === id ? { ...a, likes_count: (a.likes_count || 0) + 1 } : a
            ));
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                
                {/* Header Section */}
                <header style={{ borderBottom: '4px solid var(--color-text)', paddingBottom: '2.5rem', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Link to="/tools" style={{ color: 'var(--color-text)', opacity: 0.5 }}><ArrowLeft size={20} /></Link>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5, letterSpacing: '0.2em' }}>VOL. 09 // GLOBAL_CURATION // PUBLIC_GALLERY</span>
                    </div>
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 10vw, 7rem)', 
                        fontWeight: 900, margin: 0, 
                        letterSpacing: '-0.04em', lineHeight: 0.85, 
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase'
                    }}>
                        THE<br/>
                        <span style={{ color: 'var(--color-accent)', fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 400, textTransform: 'none' }}>Community</span>
                    </h1>
                </header>

                {/* Filter & Search Bar */}
                <div style={{ 
                    display: 'flex', flexWrap: 'wrap', 
                    gap: '1rem', marginBottom: '5rem', 
                    justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '0.75rem' }} className="no-scrollbar">
                        {TYPE_FILTERS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                style={{
                                    padding: '0.8rem 1.75rem',
                                    border: '1.5px solid var(--color-text)',
                                    backgroundColor: filter === f.id ? 'var(--color-text)' : 'transparent',
                                    color: filter === f.id ? 'var(--color-bg)' : 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900,
                                    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                                    borderRadius: '0px'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', opacity: 0.4 }}>
                        {assets.length} ENTRIES_LOADED
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15vh 0', gap: '2rem' }}>
                        <RefreshCw size={40} className="spin" style={{ color: 'var(--color-accent)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>SYNCHRONIZING_DATABASE...</span>
                    </div>
                ) : assets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '10vh 0', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>
                        <Filter size={48} style={{ marginBottom: '1.5rem' }} />
                        <div>NO_ASSETS_FOUND_IN_THIS_SECTOR</div>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                        gap: '3rem' 
                    }}>
                        {assets.map((asset) => (
                            <AssetCard 
                                key={asset.id} 
                                asset={asset} 
                                onLike={() => handleLike(asset.id, asset.likes_count)} 
                            />
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                @media (max-width: 768px) {
                    main { padding: 0 1.5rem; }
                }
            `}</style>
        </div>
    );
};

const AssetCard = ({ asset, onLike }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [copying, setCopying] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        const textToCopy = asset.data.prompt || asset.data.content || '';
        navigator.clipboard.writeText(textToCopy);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    return (
        <motion.div
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                boxShadow: isHovered ? '20px 20px 0px rgba(0,0,0,0.08)' : '0px 0px 0px rgba(0,0,0,0)',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                borderColor: isHovered ? 'var(--color-text)' : 'var(--color-border)',
                overflow: 'hidden'
            }}
        >
            {/* Type Indicator Tag */}
            <div style={{
                position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 10,
                backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
                padding: '0.4rem 0.8rem', fontSize: '0.55rem', fontWeight: 900,
                fontFamily: 'var(--font-mono)', border: '1px solid var(--color-text)',
                textTransform: 'uppercase'
            }}>
                {asset.type}
            </div>

            {/* Visual Media */}
            {asset.image_url ? (
                <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#000' }}>
                    <img 
                        src={asset.image_url} 
                        alt="Archive Asset" 
                        loading="lazy"
                        style={{ 
                            width: '100%', height: '100%', objectFit: 'cover', 
                            filter: isHovered ? 'grayscale(0)' : 'grayscale(0.2)',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                        }} 
                    />
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ 
                                    position: 'absolute', inset: 0, 
                                    backgroundColor: 'rgba(0,0,0,0.4)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    gap: '1.5rem', backdropFilter: 'blur(8px)' 
                                }}
                            >
                                <button title="Copy Directive" onClick={handleCopy} style={cardBtnStyle}>
                                    {copying ? 'COPIED' : <Copy size={20} />}
                                </button>
                                <button title="View Details" style={cardBtnStyle}><Eye size={20} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div style={{ 
                    padding: '3rem 2rem', flex: 1, minHeight: '280px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ 
                        fontSize: '1rem', lineHeight: 1.6, fontStyle: 'italic', 
                        opacity: 0.9, color: 'var(--color-text)' 
                    }}>
                        "{asset.data.content || asset.data.prompt || 'No description provided'}"
                    </div>
                </div>
            )}

            {/* Content Preview (Short description if image exists) */}
            {asset.image_url && asset.data.prompt && (
                <div style={{ padding: '1rem 1.25rem', fontSize: '0.7rem', opacity: 0.6, borderTop: '1px solid var(--color-border)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {asset.data.prompt}
                </div>
            )}

            {/* Metrics & Info */}
            <div style={{ 
                padding: '1.25rem', borderTop: '1.5px solid var(--color-border)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'var(--color-bg)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.6rem' }}>
                        {asset.user_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>{asset.user_name || 'ANON_CREATOR'}</div>
                        <div style={{ fontSize: '0.5rem', opacity: 0.5 }}>{new Date(asset.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={onLike}
                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900 }}
                    >
                        <Heart size={16} fill={asset.likes_count > 0 ? 'var(--color-accent)' : 'none'} color={asset.likes_count > 0 ? 'var(--color-accent)' : 'currentColor'} />
                        {asset.likes_count || 0}
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', opacity: 0.5 }}>
                        <Share2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const cardBtnStyle = {
    padding: '1.25rem',
    backgroundColor: 'var(--color-accent)',
    color: '#000',
    border: 'none',
    borderRadius: '0px',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.7rem'
};

export default ArchivePage;
