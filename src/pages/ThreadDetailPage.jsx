import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, ArrowBigUp, ArrowBigDown, MessageSquare, 
    Share2, Bot, Send, RefreshCw, X, Shield, Award, Zap,
    Target, Cpu, Layout, TrendingUp, Trash2
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { fetchOpenRouter } from '../utils/ai';
import { useNavigate } from 'react-router-dom';

const RED = '#E8111A';

const PERSONAS = [
    { id: 'director', name: 'CREATIVE_DIRECTOR', icon: <Layout size={14} />, color: RED, bio: 'Aesthetics, Brand Narratives, Visual Precision.' },
    { id: 'hacker', name: 'GROWTH_HACKER', icon: <TrendingUp size={14} />, color: '#00FF00', bio: 'CTR, Virality, Retention, Hook Optimization.' },
    { id: 'architect', name: 'TECH_ARCHITECT', icon: <Cpu size={14} />, color: '#0070F3', bio: 'Prompt Engineering, Latency, System Architecture.' }
];

const ThreadDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile, setIsAuthModalOpen } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [activePersona, setActivePersona] = useState(PERSONAS[0]);
    const [userVote, setUserVote] = useState(null); // 1, -1, or null

    useEffect(() => {
        fetchThread();
    }, [id, user]);

    const fetchThread = async () => {
        setLoading(true);
        // Fetch Post
        const { data: postData } = await supabase.from('community_archive').select('*').eq('id', id).single();
        if (postData) setPost(postData);

        // Fetch User Vote
        if (user) {
            const { data: voteData } = await supabase.from('community_votes').select('*').eq('user_id', user.id).eq('post_id', id).single();
            if (voteData) setUserVote(voteData.vote_type);
        }

        // Fetch Comments (Flat list, we will nest in UI)
        const { data: commentData } = await supabase.from('community_comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
        if (commentData) setComments(commentData);
        setLoading(false);
    };

    const handleVote = async (type) => {
        if (!user) { setIsAuthModalOpen(true); return; }
        const voteVal = type === 'up' ? 1 : -1;
        
        try {
            const votePower = profile?.is_pro ? 2 : 1;
            if (userVote === voteVal) {
                const prevPower = profile?.is_pro ? 2 : 1;
                await supabase.from('community_votes').delete().eq('user_id', user.id).eq('post_id', id);
                setUserVote(null);
                
                // Sync Count (Subtract previous)
                const upDelta = (userVote === 1) ? -prevPower : 0;
                const downDelta = (userVote === -1) ? -prevPower : 0;
                const newUp = Math.max(0, post.upvotes + upDelta);
                const newDown = Math.max(0, post.downvotes + downDelta);
                setPost({ ...post, upvotes: newUp, downvotes: newDown });
                await supabase.from('community_archive').update({ upvotes: newUp, downvotes: newDown }).eq('id', id);
            } else {
                // If changing vote or new vote
                const prevPower = userVote ? (profile?.is_pro ? 2 : 1) : 0;
                await supabase.from('community_votes').upsert({ user_id: user.id, post_id: id, vote_type: voteVal });
                setUserVote(voteVal);

                // Sync Count
                let upDelta = 0;
                let downDelta = 0;
                if (userVote) {
                    if (userVote === 1) upDelta = -prevPower; else downDelta = -prevPower;
                }
                if (voteVal === 1) upDelta += votePower; else downDelta += votePower;

                const newUp = Math.max(0, post.upvotes + upDelta);
                const newDown = Math.max(0, post.downvotes + downDelta);
                setPost({ ...post, upvotes: newUp, downvotes: newDown });
                await supabase.from('community_archive').update({ upvotes: newUp, downvotes: newDown }).eq('id', id);
            }
        } catch (err) { console.error(err); }
    };

    const submitComment = async (content = newComment, isAi = false, parentId = null) => {
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);

        const { data, error } = await supabase
            .from('community_comments')
            .insert({
                post_id: id,
                user_id: isAi ? null : user?.id,
                user_name: isAi ? `${activePersona.name}_AI` : (profile?.full_name || 'ANON_AGENT'),
                content: content,
                parent_id: parentId
            })
            .select().single();

        if (data) {
            setComments([...comments, data]);
            if (!isAi) setNewComment('');
        }
        setIsSubmitting(false);
    };

    const askOracle = async () => {
        if (isAiThinking) return;
        setIsAiThinking(true);
        try {
            const isPro = profile?.is_pro;
            const context = `Thread Title: ${post.title}\nContent: ${post.content || post.data?.prompt}\nPersona: ${activePersona.name} (${activePersona.bio})`;
            const prompt = `As the ${activePersona.name} in the RE-RENDER Community, provide a technical, perspective-driven critique. Tone: High-level, Editorial. Keep it under 80 words.\n\nCONTEXT:\n${context}`;
            
            const response = await fetchOpenRouter({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ role: 'user', content: prompt }]
            }, { title: `Oracle Critique: ${activePersona.name}` });

            const aiContent = response.choices?.[0]?.message?.content || 'SYSTEM_OFFLINE';
            await submitComment(aiContent, true);
        } catch (err) { 
            console.error(err); 
        } finally { 
            setIsAiThinking(false); 
        }
    };

    const deleteThread = async () => {
        if (!window.confirm('TERMINATE_THREAD: Are you sure? This cannot be undone.')) return;
        const { error } = await supabase.from('community_archive').delete().eq('id', id);
        if (!error) {
            navigate('/community');
        } else {
            console.error('Delete Error:', error);
            alert(`DELETE_FAIL: ${error.message || 'Restricted Action'}`);
        }
    };

    // Helper to build recursive comment tree
    const renderComments = (parentId = null, depth = 0) => {
        const levelComments = comments.filter(c => c.parent_id === parentId);
        return levelComments.map(comment => (
            <div key={comment.id} style={{ marginLeft: depth > 0 ? '2rem' : '0', borderLeft: depth > 0 ? '1px solid var(--color-border)' : 'none', paddingLeft: depth > 0 ? '1.5rem' : '0', marginTop: '1.5rem' }}>
                <CommentCard comment={comment} profile={profile} onReply={(content) => submitComment(content, false, comment.id)} />
                {renderComments(comment.id, depth + 1)}
            </div>
        ));
    };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}><RefreshCw className="spin" size={48} color={RED} /></div>;
    if (!post) return <div style={{ color: '#fff', textAlign: 'center', padding: '10rem' }}>THREAD_NOT_FOUND</div>;

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
                <Link to="/archive" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', opacity: 0.5, textDecoration: 'none', marginBottom: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <ArrowLeft size={16} /> BACK_TO_FEED
                </Link>

                <article style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '3rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => handleVote('up')} style={{ ...voteBtnStyle, color: userVote === 1 ? RED : 'inherit', opacity: userVote === 1 ? 1 : 0.4 }}><ArrowBigUp size={32} /></button>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>{post.upvotes - post.downvotes}</span>
                        <button onClick={() => handleVote('down')} style={{ ...voteBtnStyle, color: userVote === -1 ? RED : 'inherit', opacity: userVote === -1 ? 1 : 0.4 }}><ArrowBigDown size={32} /></button>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.2rem 0.6rem', backgroundColor: RED, color: '#fff', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>{post.type.toUpperCase()}</div>
                            <span style={{ fontSize: '0.7rem', opacity: 0.4, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                POSTED_BY @{post.user_name} // {new Date(post.created_at).toLocaleString()}
                                {post.data?.is_pro_author && (
                                    <span style={{ backgroundColor: RED, color: '#fff', padding: '0.1rem 0.4rem', fontSize: '0.5rem', fontWeight: 900 }}>PRO_AGENT</span>
                                )}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.1, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{post.title || post.data?.prompt?.slice(0, 100)}</h1>
                        {post.image_url && <div style={{ marginBottom: '2.5rem', border: '1px solid var(--color-border)', backgroundColor: '#000' }}><img src={post.image_url} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Asset" /></div>}
                        <div style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9, whiteSpace: 'pre-wrap', fontFamily: post.type === 'discussion' ? 'inherit' : 'var(--font-mono)' }}>{post.content || post.data?.prompt}</div>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, fontSize: '0.8rem' }}>
                                <MessageSquare size={18} /> {comments.length} COMMENTS
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Share2 size={18} /> SHARE_THREAD
                            </button>
                            
                            {user?.id === post.user_id && (
                                <button 
                                    onClick={deleteThread}
                                    style={{ background: 'none', border: 'none', color: RED, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}
                                >
                                    <Trash2 size={16} /> DELETE_POST
                                </button>
                            )}
                        </div>
                    </div>
                </article>

                {/* AI Agents & Comments */}
                <section>
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '3rem' }}>
                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.4, marginBottom: '1.5rem', letterSpacing: '0.1em' }}>SELECT_ORACLE_PERSPECTIVE</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {PERSONAS.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => setActivePersona(p)}
                                    style={{
                                        padding: '1rem', backgroundColor: activePersona.id === p.id ? 'var(--color-bg)' : 'transparent',
                                        border: `1.5px solid ${activePersona.id === p.id ? p.color : 'rgba(255,255,255,0.05)'}`,
                                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--color-text)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem', color: activePersona.id === p.id ? p.color : 'inherit' }}>
                                        {p.id === 'director' ? <Layout size={12}/> : p.id === 'hacker' ? <TrendingUp size={12}/> : <Cpu size={12}/>}
                                        {p.name}
                                    </div>
                                    <div style={{ fontSize: '0.55rem', opacity: 0.5, marginTop: '0.4rem', lineHeight: 1.3 }}>{p.bio}</div>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={askOracle}
                            disabled={isAiThinking}
                            style={{ 
                                width: '100%', padding: '1rem', backgroundColor: activePersona.color, color: '#fff', 
                                border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, 
                                fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                            }}
                        >
                            {isAiThinking ? <RefreshCw className="spin" size={16} /> : <Bot size={16} />} 
                            {isAiThinking ? 'ORACLE_INITIALIZING...' : `SUMMON_${activePersona.name}`}
                        </button>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <textarea placeholder="Contribute to the collective intelligence..." value={newComment} onChange={(e) => setNewComment(e.target.value)} style={{ width: '100%', minHeight: '120px', padding: '1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', marginBottom: '1rem', outline: 'none', resize: 'vertical' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => user ? submitComment() : setIsAuthModalOpen(true)} disabled={isSubmitting || !newComment.trim()} style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', padding: '0.8rem 2.5rem', border: 'none', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Send size={14} /> {isSubmitting ? 'UPLOADING...' : 'POST_COMMENT'}</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {renderComments()}
                    </div>
                </section>
            </main>
            <style>{`.spin { animation: spin 2s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const CommentCard = ({ comment, profile, onReply }) => {
    const isAi = comment.user_name.includes('_AI');
    const persona = PERSONAS.find(p => comment.user_name.includes(p.name)) || PERSONAS[0];
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    return (
        <div style={{ padding: '1.5rem', backgroundColor: isAi ? 'rgba(255,255,255,0.02)' : 'transparent', borderLeft: `3px solid ${isAi ? persona.color : 'var(--color-border)'}`, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: isAi ? persona.color : 'var(--color-text)', color: isAi ? '#fff' : 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.5rem' }}>
                    {isAi ? <Bot size={10} /> : comment.user_name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.65rem', color: isAi ? persona.color : 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {comment.user_name}
                </span>
                <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.8 }}>{comment.content}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.2rem', opacity: 0.4, fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setIsReplying(!isReplying)}>REPLY</span>
                <span style={{ cursor: 'pointer' }}>SHARE</span>
            </div>

            {isReplying && (
                <div style={{ marginTop: '1rem' }}>
                    <textarea 
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none' }} 
                        placeholder="Write reply..."
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button onClick={() => { onReply(replyText); setIsReplying(false); setReplyText(''); }} style={{ padding: '0.4rem 1rem', backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}>SEND</button>
                        <button onClick={() => setIsReplying(false)} style={{ padding: '0.4rem 1rem', background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', cursor: 'pointer' }}>CANCEL</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const voteBtnStyle = { background: 'none', border: 'none', color: 'var(--color-text)', opacity: 0.4, cursor: 'pointer', padding: '0.2rem', transition: 'all 0.2s' };

export default ThreadDetailPage;
