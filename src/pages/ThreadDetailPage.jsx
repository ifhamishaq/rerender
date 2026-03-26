import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, ArrowBigUp, ArrowBigDown, MessageSquare, 
    Share2, Bot, Send, RefreshCw, X, Shield, Award, Zap
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { fetchOpenRouter } from '../utils/ai';

const RED = '#E8111A';

const ThreadDetailPage = () => {
    const { id } = useParams();
    const { user, profile, setIsAuthModalOpen } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);

    useEffect(() => {
        fetchThread();
    }, [id]);

    const fetchThread = async () => {
        setLoading(true);
        // Fetch Post
        const { data: postData } = await supabase
            .from('community_archive')
            .select('*')
            .eq('id', id)
            .single();
        
        if (postData) setPost(postData);

        // Fetch Comments
        const { data: commentData } = await supabase
            .from('community_comments')
            .select('*')
            .eq('post_id', id)
            .order('created_at', { ascending: true });

        if (commentData) setComments(commentData);
        setLoading(false);
    };

    const handleVote = async (amount, type) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        const newUpvotes = type === 'up' ? post.upvotes + amount : post.upvotes;
        const newDownvotes = type === 'down' ? post.downvotes + amount : post.downvotes;
        setPost({ ...post, upvotes: newUpvotes, downvotes: newDownvotes });
        await supabase.from('community_archive').update({ upvotes: newUpvotes, downvotes: newDownvotes }).eq('id', id);
    };

    const submitComment = async (content = newComment, isAi = false) => {
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);

        const { data, error } = await supabase
            .from('community_comments')
            .insert({
                post_id: id,
                user_id: isAi ? null : user?.id,
                user_name: isAi ? 'ORACLE_AI' : (profile?.full_name || 'ANON_AGENT'),
                content: content
            })
            .select()
            .single();

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
            const context = `Thread Title: ${post.title}\nThread Content: ${post.content || post.data?.prompt}\nType: ${post.type}`;
            const prompt = `As the RE-RENDER Community Oracle, provide a technical, high-level critique or contribution to this thread. Tone: Aggressive, Expert, Editorial. Keep it under 100 words.\n\nCONTEXT:\n${context}`;
            
            const response = await fetchOpenRouter({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ role: 'user', content: prompt }]
            }, { title: 'Community Oracle Critique' });

            const aiContent = response.choices?.[0]?.message?.content || 'SYSTEM_OFFLINE: Oracle could not process intelligence.';
            await submitComment(aiContent, true);
        } catch (err) {
            console.error('Oracle failed:', err);
        } finally {
            setIsAiThinking(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
            <RefreshCw className="spin" size={48} color={RED} />
        </div>
    );

    if (!post) return <div style={{ color: '#fff', textAlign: 'center', padding: '10rem' }}>THREAD_NOT_FOUND</div>;

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
                
                {/* Back Link */}
                <Link to="/archive" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', opacity: 0.5, textDecoration: 'none', marginBottom: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <ArrowLeft size={16} /> BACK_TO_FEED
                </Link>

                {/* Thread Header */}
                <article style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '3rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => handleVote(1, 'up')} style={voteBtnStyle}><ArrowBigUp size={32} /></button>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>{post.upvotes - post.downvotes}</span>
                        <button onClick={() => handleVote(1, 'down')} style={voteBtnStyle}><ArrowBigDown size={32} /></button>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.2rem 0.6rem', backgroundColor: RED, color: '#fff', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                                {post.type.toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>POSTED_BY @{post.user_name} // {new Date(post.created_at).toLocaleString()}</span>
                        </div>

                        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.1, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                            {post.title || post.data?.prompt?.slice(0, 100)}
                        </h1>

                        {post.image_url && (
                            <div style={{ marginBottom: '2.5rem', border: '1px solid var(--color-border)', backgroundColor: '#000' }}>
                                <img src={post.image_url} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Asset" />
                            </div>
                        )}

                        <div style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9, whiteSpace: 'pre-wrap', fontFamily: post.type === 'discussion' ? 'inherit' : 'var(--font-mono)' }}>
                            {post.content || post.data?.prompt}
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, fontSize: '0.8rem' }}>
                                <MessageSquare size={18} /> {comments.length} COMMENTS
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Share2 size={18} /> SHARE_THREAD
                            </button>
                        </div>
                    </div>
                </article>

                {/* Comment Section */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textTransform: 'uppercase' }}>DISCUSSIONS</h2>
                        <button 
                            onClick={askOracle}
                            disabled={isAiThinking}
                            style={{ 
                                background: 'none', border: `1.5px solid ${RED}`, color: RED, 
                                padding: '0.6rem 1.2rem', fontFamily: 'var(--font-mono)', 
                                fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.6rem'
                            }}
                        >
                            {isAiThinking ? <RefreshCw className="spin" size={14} /> : <Bot size={14} />} 
                            {isAiThinking ? 'ORACLE_THINKING...' : 'SUMMON_ORACLE_CRITIQUE'}
                        </button>
                    </div>

                    {/* New Comment Box */}
                    <div style={{ marginBottom: '4rem' }}>
                        <textarea 
                            placeholder="Add to the intelligence..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ 
                                width: '100%', minHeight: '120px', padding: '1.5rem', 
                                backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                color: 'var(--color-text)', fontFamily: 'var(--font-mono)',
                                marginBottom: '1rem', outline: 'none', resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => user ? submitComment() : setIsAuthModalOpen(true)}
                                disabled={isSubmitting || !newComment.trim()}
                                style={{ 
                                    backgroundColor: 'var(--color-text)', color: 'var(--color-bg)',
                                    padding: '0.8rem 2.5rem', border: 'none', fontFamily: 'var(--font-mono)',
                                    fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.6rem'
                                }}
                            >
                                <Send size={14} /> {isSubmitting ? 'PROCESSING...' : 'POST_COMMENT'}
                            </button>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {comments.map((comment, i) => (
                            <CommentCard key={comment.id} comment={comment} />
                        ))}
                    </div>
                </section>
            </main>

            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const CommentCard = ({ comment }) => {
    const isAi = comment.user_name === 'ORACLE_AI';
    
    return (
        <div style={{ 
            padding: '2rem', backgroundColor: isAi ? 'rgba(232,17,26,0.03)' : 'var(--color-bg)', 
            borderLeft: `4px solid ${isAi ? RED : 'var(--color-border)'}`,
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ 
                    width: '24px', height: '24px', 
                    backgroundColor: isAi ? RED : 'var(--color-text)', 
                    color: isAi ? '#fff' : 'var(--color-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.6rem'
                }}>
                    {isAi ? <Bot size={12} /> : comment.user_name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.7rem', color: isAi ? RED : 'inherit' }}>
                    {comment.user_name}
                </span>
                <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>
                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isAi && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', color: RED, opacity: 0.6 }}>
                        <Zap size={12} /> <Shield size={12} />
                    </div>
                )}
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
                {comment.content}
            </p>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '1.5rem', opacity: 0.4, fontSize: '0.7rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                <span>REPLY</span>
                <span>SHARE</span>
            </div>
        </div>
    );
};

const voteBtnStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text)',
    opacity: 0.4,
    cursor: 'pointer',
    padding: '0.2rem',
    transition: 'all 0.2s'
};

export default ThreadDetailPage;
