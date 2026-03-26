import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Search, Filter, Plus, MessageSquare, ArrowBigUp, ArrowBigDown, 
    Share2, MoreVertical, TrendingUp, Clock, Award, Shield, Zap,
    ImageIcon, FileText, Globe, Bot, ArrowLeft, RefreshCw, X
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const RED = '#E8111A';

const ArchivePage = () => {
    const { user, profile, setIsAuthModalOpen } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('hot');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', content: '', type: 'discussion' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const CATEGORIES = [
        { id: 'hot', label: 'HOT', icon: <TrendingUp size={14} /> },
        { id: 'new', label: 'NEW', icon: <Clock size={14} /> },
        { id: 'top', label: 'TOP', icon: <Award size={14} /> },
    ];

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const fetchPosts = async () => {
        setLoading(true);
        let query = supabase
            .from('community_archive')
            .select('*');

        if (category === 'new') query = query.order('created_at', { ascending: false });
        else if (category === 'top') query = query.order('upvotes', { ascending: false });
        else query = query.order('created_at', { ascending: false }); 

        const { data, error } = await query;
        if (data) setPosts(data);
        if (error) console.error('Error fetching posts:', error);
        setLoading(false);
    };

    const handleVote = async (postId, amount, type) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        const post = posts.find(p => p.id === postId);
        const newUpvotes = type === 'up' ? post.upvotes + amount : post.upvotes;
        const newDownvotes = type === 'down' ? post.downvotes + amount : post.downvotes;

        setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: newUpvotes, downvotes: newDownvotes } : p));

        await supabase
            .from('community_archive')
            .update({ upvotes: newUpvotes, downvotes: newDownvotes })
            .eq('id', postId);
    };

    const createThread = async () => {
        if (!newThread.title.trim() || isSubmitting) return;
        setIsSubmitting(true);

        const { data, error } = await supabase
            .from('community_archive')
            .insert({
                user_id: user.id,
                user_name: profile?.full_name || user.email?.split('@')[0] || 'ANON_CREATOR',
                title: newThread.title,
                content: newThread.content,
                type: 'discussion',
                upvotes: 1
            })
            .select()
            .single();

        if (data) {
            setPosts([data, ...posts]);
            setShowCreateModal(false);
            setNewThread({ title: '', content: '', type: 'discussion' });
        }
        setIsSubmitting(false);
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', paddingTop: '100px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                
                {/* Main Feed */}
                <main>
                    {/* Header */}
                    <header style={{ marginBottom: '3rem', borderBottom: '4px solid var(--color-text)', paddingBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                                    THE<br/><span style={{ color: RED }}>COMMUNITY</span>
                                </h1>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5, marginTop: '0.5rem' }}>
                                    VOL. 26 // AGENCY_FORUM // COLLABORATIVE_INTELLIGENCE
                                </p>
                            </div>
                            <button 
                                onClick={() => user ? setShowCreateModal(true) : setIsAuthModalOpen(true)}
                                style={{
                                    backgroundColor: 'var(--color-text)', color: 'var(--color-bg)',
                                    border: 'none', padding: '1rem 2rem', fontFamily: 'var(--font-mono)',
                                    fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                                }}
                            >
                                <Plus size={18} /> START_THREAD
                            </button>
                        </div>
                    </header>

                    {/* Sorting Tabs */}
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                        {CATEGORIES.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setCategory(c.id)}
                                style={{
                                    background: 'none', border: 'none', color: category === c.id ? RED : 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.75rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    opacity: category === c.id ? 1 : 0.4, transition: 'all 0.2s'
                                }}
                            >
                                {c.icon} {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Posts List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {loading ? (
                            <div style={{ padding: '5rem', textAlign: 'center' }}>
                                <RefreshCw className="spin" size={32} />
                            </div>
                        ) : posts.map(post => (
                            <ThreadCard key={post.id} post={post} onVote={handleVote} />
                        ))}
                    </div>
                </main>

                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ padding: '2rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>AGENCY_RULES</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7, fontSize: '0.8rem', lineHeight: 1.5 }}>
                            <div>1. No low-effort prompts.</div>
                            <div>2. Critique with technical merit.</div>
                            <div>3. AI Oracle has final say in all disputes.</div>
                            <div>4. Share resources, build momentum.</div>
                        </div>
                    </div>

                    <div style={{ padding: '2rem', backgroundColor: RED, color: '#fff' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.5rem 0' }}>COMMUNITY_ORACLE</h3>
                        <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.4, margin: '0 0 1.5rem 0' }}>
                            Currently analyzing 1,240 assets. Cyberpunk-Brutalism is trending with a +24% CTR projection.
                        </p>
                        <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fff', color: '#000', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem' }}>
                            VIEW_TREND_REPORT
                        </button>
                    </div>
                </aside>
            </div>

            {/* Create Thread Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}
                    >
                        <motion.div 
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
                            style={{ backgroundColor: 'var(--color-bg)', width: '100%', maxWidth: '700px', border: '4px solid var(--color-text)', padding: '3rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>INITIALIZE_THREAD</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}><X /></button>
                            </div>

                            <input 
                                placeholder="THREAD_TITLE..."
                                value={newThread.title}
                                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                                style={{ width: '100%', background: 'none', border: 'none', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text)', padding: '1rem 0', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '2rem', outline: 'none' }}
                            />

                            <textarea 
                                placeholder="SYSTEM_MESSAGE: Share your resources or discuss agency problems..."
                                value={newThread.content}
                                onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                                style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '2rem', outline: 'none', minHeight: '200px', resize: 'vertical' }}
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={createThread}
                                    disabled={isSubmitting}
                                    style={{ flex: 1, padding: '1.25rem', backgroundColor: RED, color: '#fff', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, cursor: 'pointer' }}
                                >
                                    {isSubmitting ? '[ PUBLISHING... ]' : '[ DEPLOY_THREAD ]'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
                    aside { display: none !important; }
                }
            `}</style>
        </div>
    );
};

const ThreadCard = ({ post, onVote }) => {
    const isAsset = post.type !== 'discussion';
    
    return (
        <motion.div 
            whileHover={{ x: 5 }}
            style={{ 
                display: 'flex', gap: '0', backgroundColor: 'var(--color-surface)', 
                border: '1px solid var(--color-border)', transition: 'border-color 0.2s',
                overflow: 'hidden'
            }}
        >
            {/* Vote Sidebar */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--color-border)' }}>
                <button onClick={() => onVote(post.id, 1, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', opacity: 0.5 }}><ArrowBigUp size={24} /></button>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.8rem' }}>{post.upvotes - post.downvotes}</div>
                <button onClick={() => onVote(post.id, 1, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', opacity: 0.5 }}><ArrowBigDown size={24} /></button>
            </div>

            {/* Post Content */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.2rem 0.5rem', backgroundColor: isAsset ? RED : 'var(--color-text)', color: '#fff', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                        {isAsset ? <ImageIcon size={10} /> : <FileText size={10} />} {post.type.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>POSTED_BY @{post.user_name} // {new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <Link to={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.2 }}>
                        {post.title || post.data?.prompt?.slice(0, 50) + '...'}
                    </h2>
                </Link>

                {isAsset && post.image_url && (
                    <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', border: '1px solid var(--color-border)', cursor: 'zoom-in' }}>
                        <img src={post.image_url} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Asset" />
                    </div>
                )}

                {!isAsset && post.content && (
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.content}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <Link to={`/community/${post.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text)', opacity: 0.6, textDecoration: 'none', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                        <MessageSquare size={14} /> 24 COMMENTS
                    </Link>
                    <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text)', opacity: 0.6, fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                        <Share2 size={14} /> SHARE
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.3, marginLeft: 'auto' }}>
                        <MoreVertical size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ArchivePage;
