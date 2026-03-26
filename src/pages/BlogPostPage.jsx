import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import blogPosts from '../data/blog.json';
import './Blog.css';

const BlogPostPage = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) return <Navigate to="/blog" />;

    return (
        <article className="blog-post">
            <header className="post-header">
                <div className="container">
                    <Link to="/blog" className="back-link">&larr; BACK TO BLOG</Link>
                    <div className="post-meta-top">
                        <span className="category-tag">{post.category}</span>
                        <span className="date">{post.date}</span>
                    </div>
                    <h1 className="post-title">{post.title}</h1>
                    <div className="author-info">
                        WRITTEN BY <span className="author-name">{post.author}</span>
                    </div>
                </div>
            </header>

            <div className="post-hero-image container">
                <img 
                    src={post.image} 
                    alt={post.title} 
                    loading="eager" 
                    decoding="async"
                />
            </div>

            <section className="post-content">
                <div className="container-narrow">
                    <div 
                        dangerouslySetInnerHTML={{ __html: post.content }} 
                        className="prose-editorial"
                    />
                </div>
            </section>

            <section className="blog-cta-section">
                <div className="container">
                    <div className="blog-cta-box">
                        <div className="cta-noise-overlay" />
                        <div className="cta-content">
                            <h2 className="cta-heading">
                                READY TO GROW <br />
                                <span className="serif-italic">Your Brand?</span>
                            </h2>
                            <p className="cta-sub">
                                Make your content look great and get better results. We are taking new projects now.
                            </p>
                            <Link to="/get-in-touch#inquiry" className="hero-cta editorial-cta">
                                GET IN TOUCH
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="post-footer">
                <div className="container">
                    <div className="share-section">
                        <span className="mono-label">SHARE THIS ARTICLE</span>
                        <div className="share-links">
                            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${post.title}&url=${window.location.href}`)}>TWITTER</button>
                            <button onClick={() => navigator.clipboard.writeText(window.location.href)}>COPY LINK</button>
                        </div>
                    </div>
                </div>
            </footer>
        </article>
    );
};

export default BlogPostPage;
