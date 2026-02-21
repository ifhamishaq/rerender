import React, { useState } from 'react';
import { motion } from 'framer-motion';
import prompts from '../data/prompts.json';

const Prompts = () => {
    const [filter, setFilter] = useState('ALL');
    const [copiedId, setCopiedId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const CHAR_LIMIT = 150;

    const uniqueCategories = [...new Set(prompts.map(p => p.category))];
    const categories = ['ALL', ...uniqueCategories];

    const filteredPrompts = filter === 'ALL'
        ? prompts
        : prompts.filter(p => p.category === filter);

    const handleCopy = (prompt, id) => {
        navigator.clipboard.writeText(prompt);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section style={{
            padding: '8rem 2rem 6rem',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                marginBottom: '4rem',
                borderBottom: '2px solid var(--color-text)',
                paddingBottom: '1rem',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 6rem)',
                        textAlign: 'left',
                        margin: 0,
                        lineHeight: 1
                    }}>
                        PROMPT_LAB
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginTop: '1rem',
                        maxWidth: '500px'
                    }}>
                        Copy-paste ready prompts for AI image generation. Each prompt is paired with its output for reference.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                padding: '0.5rem 1rem',
                                border: '1px solid var(--color-text)',
                                backgroundColor: filter === cat ? 'var(--color-text)' : 'transparent',
                                color: filter === cat ? 'var(--color-bg)' : 'var(--color-text)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Prompts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '2.5rem',
            }}>
                {filteredPrompts.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid var(--color-text)',
                            backgroundColor: '#fff',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Image */}
                        <motion.div
                            whileHover={{ scale: 0.98 }}
                            style={{
                                maxHeight: '300px',
                                backgroundColor: '#fff',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#333',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.8rem',
                                }}>
                                    [ IMAGE PENDING ]
                                </div>
                            )}

                            {/* Category Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '0.75rem',
                                left: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                backgroundColor: 'var(--color-accent)',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                letterSpacing: '0.05em'
                            }}>
                                {item.category}
                            </div>
                        </motion.div>

                        {/* Prompt Content */}
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '1rem',
                                marginBottom: '1rem',
                                letterSpacing: '0.02em'
                            }}>
                                {item.title}
                            </h3>

                            {/* Prompt Text Box */}
                            <div style={{
                                backgroundColor: '#f5f5f5',
                                color: 'var(--color-text)',
                                padding: '1.25rem',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                lineHeight: 1.7,
                                border: '2px solid var(--color-text)',
                                position: 'relative',
                                minHeight: '80px',
                                wordBreak: 'break-word',
                            }}>
                                <span style={{
                                    backgroundColor: 'var(--color-accent)',
                                    color: 'var(--color-text)',
                                    fontWeight: 'bold',
                                    padding: '0.1rem 0.4rem',
                                    marginRight: '0.5rem',
                                    fontSize: '0.7rem',
                                }}>PROMPT</span>
                                {item.prompt.length > CHAR_LIMIT && expandedId !== item.id
                                    ? item.prompt.substring(0, CHAR_LIMIT) + '...'
                                    : item.prompt
                                }
                                {item.prompt.length > CHAR_LIMIT && (
                                    <button
                                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        style={{
                                            display: 'block',
                                            marginTop: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-accent)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            padding: 0,
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        {expandedId === item.id ? '▲ SHOW LESS' : '▼ SHOW MORE'}
                                    </button>
                                )}
                            </div>

                            {/* Copy Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCopy(item.prompt, item.id)}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    border: '1px solid var(--color-text)',
                                    backgroundColor: copiedId === item.id ? 'var(--color-accent)' : 'transparent',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {copiedId === item.id ? '✓ COPIED!' : 'COPY PROMPT'}
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredPrompts.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#999'
                }}>
                    No prompts found for this category.
                </div>
            )}
        </section>
    );
};

export default Prompts;
