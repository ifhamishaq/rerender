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
    const [userVotes, setUserVotes] = useState({}); // { postId: type }

    const CATEGORIES = [
        { id: 'hot', label: 'HOT', icon: <TrendingUp size={14} /> },
        { id: 'new', label: 'NEW', icon: <Clock size={14} /> },
        { id: 'top', label: 'TOP', icon: <Award size={14} /> },
    ];

    useEffect(() => {
        fetchPosts();
    }, [category, user]);

    const fetchPosts = async () => {
        setLoading(true);
        let query = supabase
            .from('community_archive')
            .select('*');

        if (category === 'new') query = query.order('created_at', { ascending: false });
        else if (category === 'top') query = query.order('upvotes', { ascending: false });
        else query = query.order('created_at', { ascending: false }); 

        const { data, error } = await query;
        if (data) {
            setPosts(data);
            if (user) {
                const { data: votes } = await supabase
                    .from('community_votes')
                    .select('post_id, vote_type')
                    .eq('user_id', user.id);
                
                const voteMap = {};
                votes?.forEach(v => voteMap[v.post_id] = v.vote_type);
                setUserVotes(voteMap);
            }
        }
        if (error) console.error('Error fetching posts:', error);
        setLoading(false);
    };

    const handleVote = async (postId, type) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        try {
            const voteVal = type === 'up' ? 1 : -1;
            const existingVoteType = userVotes[postId];
            const post = posts.find(p => p.id === postId);
            
            // Pro Benefit: Double Vote Power
            const votePower = profile?.is_pro ? 2 : 1;
            const absoluteVoteVal = voteVal * votePower;

            if (existingVoteType) {
                // If toggling off, we subtract the previous power
                // If changing, we subtract previous and add new
                await supabase.from('community_votes').delete().eq('user_id', user.id).eq('post_id', postId);
                setUserVotes({ ...userVotes, [postId]: null });
            } else {
                await supabase.from('community_votes').upsert({ user_id: user.id, post_id: postId, vote_type: voteVal });
                setUserVotes({ ...userVotes, [postId]: voteVal });
            }

            // Sync Count (Manual for speed)
            let upDelta = 0;
            let downDelta = 0;

            if (existingVoteType) {
                // Remove previous vote impact
                const prevPower = profile?.is_pro ? 2 : 1;
                if (existingVoteType === 1) upDelta = -prevPower; else downDelta = -prevPower;
            } else {
                // Add new vote impact
                if (voteVal === 1) upDelta = votePower; else downDelta = votePower;
            }
            
            const newUp = Math.max(0, post.upvotes + upDelta);
            const newDown = Math.max(0, post.downvotes + downDelta);

            setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: newUp, downvotes: newDown } : p));
            await supabase.from('community_archive').update({ upvotes: newUp, downvotes: newDown }).eq('id', postId);
        } catch (err) { console.error(err); }
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
                upvotes: profile?.is_pro ? 2 : 1, // Double starting power
                data: { is_pro_author: profile?.is_pro } // Track Pro status
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

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this intelligence thread?')) return;
        const { error } = await supabase.from('community_archive').delete().eq('id', postId);
        if (!error) setPosts(posts.filter(p => p.id !== postId));
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', paddingTop: '100px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <main>
                    <header style={{ marginBottom: '3rem', borderBottom: '4px solid var(--color-text)', paddingBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>THE_COMMUNITY</h1>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.5 }}>VOL. 26 // AGENCY_FORUM // COLLABORATIVE_INTELLIGENCE</p>
                            </div>
                            <button onClick={() => user ? setShowCreateModal(true) : setIsAuthModalOpen(true)} style={btnStyle}><Plus size={18} /> START_THREAD</button>
                        </div>
                    </header>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                        {CATEGORIES.map(c => (
                            <button key={c.id} onClick={() => setCategory(c.id)} style={{ background: 'none', border: 'none', color: category === c.id ? RED : 'var(--color-text)', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: category === c.id ? 1 : 0.4 }}>{c.icon} {c.label}</button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {loading ? <div style={{ padding: '5rem', textAlign: 'center' }}><RefreshCw className="spin" size={32} /></div> : posts.map(post => (
                            <ThreadCard 
                                key={post.id} 
                                post={post} 
                                user={user} 
                                profile={profile}
                                onVote={handleVote} 
                                onDelete={handleDelete} 
                                userVote={userVotes[post.id]} 
                            />
                        ))}
                    </div>
                </main>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ padding: '2rem', backgroundColor: RED, color: '#fff' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.5rem 0' }}>{profile?.is_pro ? 'PRO_DASHBOARD' : 'UPGRADE_TO_PRO'}</h3>
                        <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.4, margin: '0 0 1.5rem 0' }}>
                            {profile?.is_pro 
                                ? 'You have [DOUBLE_VOTE_POWER] and [PRO_PRESTIGE] active.' 
                                : 'Gain 2x Vote Power and Exclusive Pro_Agent Badges.'}
                        </p>
                        {!profile?.is_pro && (
                            <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fff', color: '#000', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem' }}>
                                BECOME_PRO_AGENT
                            </button>
                        )}
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <div style={modalOverlayStyle}>
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={modalStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>INITIALIZE_THREAD</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                            </div>
                            <input value={newThread.title} onChange={e => setNewThread({ ...newThread, title: e.target.value })} placeholder="TITLE..." style={inputStyle} />
                            <textarea value={newThread.content} onChange={e => setNewThread({ ...newThread, content: e.target.value })} placeholder="CONTENT..." style={textareaStyle} />
                            <button onClick={createThread} disabled={isSubmitting} style={{ ...btnStyle, width: '100%', backgroundColor: RED, color: '#fff' }}>[ DEPLOY_THREAD ]</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style>{`.spin { animation: spin 2s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const ThreadCard = ({ post, user, profile, onVote, onDelete, userVote }) => {
    const isAsset = post.type !== 'discussion';
    const isOwnerPro = post.data?.is_pro_author; // We'll need to save this on creation
    
    return (
        <div style={{ 
            display: 'flex', backgroundColor: 'var(--color-surface)', 
            border: `1px solid ${isOwnerPro ? RED : 'var(--color-border)'}`, 
            boxShadow: isOwnerPro ? `0 0 20px -10px ${RED}` : 'none',
            overflow: 'hidden' 
        }}>
            <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--color-border)', backgroundColor: isOwnerPro ? 'rgba(232, 17, 26, 0.05)' : 'rgba(0,0,0,0.02)' }}>
                <button onClick={() => onVote(post.id, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: userVote === 1 ? RED : 'inherit', opacity: userVote === 1 ? 1 : 0.4 }}><ArrowBigUp size={24} /></button>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.8rem' }}>{post.upvotes - post.downvotes}</div>
                <button onClick={() => onVote(post.id, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: userVote === -1 ? RED : 'inherit', opacity: userVote === -1 ? 1 : 0.4 }}><ArrowBigDown size={24} /></button>
            </div>
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.65rem', opacity: 0.4, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    POSTED_BY @{post.user_name} // {new Date(post.created_at).toLocaleDateString()}
                    {isOwnerPro && (
                        <span style={{ backgroundColor: RED, color: '#fff', padding: '0.1rem 0.4rem', fontSize: '0.5rem', fontWeight: 900 }}>PRO_AGENT</span>
                    )}
                </div>
                <Link to={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>{post.title || (isAsset ? 'SHARED_ASSET' : 'DISCUSSION')}</h2></Link>
                {isAsset && post.image_url && <img src={post.image_url} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', border: '1px solid var(--color-border)' }} alt="Asset" />}
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content || post.data?.prompt}</p>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto', alignItems: 'center' }}>
                    <Link to={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)', opacity: 0.6 }}><MessageSquare size={14} /> DISCUSS</Link>
                    {user?.id === post.user_id && <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}><X size={14} /> DELETE</button>}
                </div>
            </div>
        </div>
    );
};

const btnStyle = { padding: '0.8rem 1.5rem', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(10px)' };
const modalStyle = { backgroundColor: 'var(--color-bg)', width: '100%', maxWidth: '600px', border: '2px solid #fff', padding: '2rem' };
const inputStyle = { width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #333', color: '#fff', padding: '1rem 0', fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem', outline: 'none' };
const textareaStyle = { width: '100%', minHeight: '150px', background: '#111', border: '1px solid #333', color: '#fff', padding: '1rem', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem', outline: 'none' };

export default ArchivePage;
