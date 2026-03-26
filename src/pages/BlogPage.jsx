import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blog.json';
import FadeUp from '../components/Animations/FadeUp';
import './Blog.css';

const BlogPage = () => {
    return (
        <main className="blog-archive">
            <section className="blog-hero">
                <div className="container">
                    <div className="section-label">BLOG</div>
                    <h1 className="editorial-title">
                        <span className="sans-bold">LATEST</span>
                        <span className="serif-italic">Design</span>
                        <span className="sans-outline">ARTICLES</span>
                    </h1>
                </div>
            </section>

            <section className="blog-grid-section">
                <div className="container">
                    <div className="blog-grid">
                        {blogPosts.map((post, index) => (
                            <FadeUp key={post.id} delay={index * 0.1}>
                                <Link to={`/blog/${post.slug}`} className="blog-card">
                                    <div className="blog-card-image">
                                        <img 
                                            src={post.image} 
                                            alt={post.title}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="category-overlay">
                                            <span className="mono-label">{post.category}</span>
                                        </div>
                                    </div>
                                    <div className="blog-card-content">
                                        <div className="blog-meta">
                                            <span className="mono-date">{post.date}</span>
                                            <span className="dot" />
                                            <span className="mono-author">{post.author}</span>
                                        </div>
                                        <h2 className="blog-card-title">{post.title}</h2>
                                        <p className="blog-card-excerpt">{post.excerpt}</p>
                                        <span className="read-more">READ MORE &rarr;</span>
                                    </div>
                                </Link>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default BlogPage;
