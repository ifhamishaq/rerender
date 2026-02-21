import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import prompts from '../data/prompts.json';

const DISPLAY_COUNT = 3;
const CHAR_LIMIT = 120;

const PromptPreview = () => {
    const [copiedId, setCopiedId] = useState(null);
    const previewPrompts = prompts.slice(0, DISPLAY_COUNT);

    const handleCopy = (prompt, id) => {
        navigator.clipboard.writeText(prompt);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section style={{
            padding: '6rem 2rem',
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid var(--color-text)',
        }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                marginBottom: '3rem',
                borderBottom: '2px solid var(--color-text)',
                paddingBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <div>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                        margin: 0,
                        lineHeight: 1,
                    }}>
                        PROMPT_LAB
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: '#666',
                        marginTop: '0.75rem',
                    }}>
                        Copy-paste ready prompts for AI image generation.
                    </p>
                </div>
                <Link to="/prompts" style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    padding: '0.5rem 1.5rem',
                    border: '2px solid var(--color-text)',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                }}>
                    VIEW ALL →
                </Link>
            </div>

            {/* Preview Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '2rem',
            }}>
                {previewPrompts.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
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
                        <div style={{
                            maxHeight: '220px',
                            backgroundColor: '#fff',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}>
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
                                    height: '180px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#eee',
                                }}>
                                    [ IMAGE ]
                                </div>
                            )}

                            <div style={{
                                position: 'absolute',
                                top: '0.5rem',
                                left: '0.5rem',
                                padding: '0.2rem 0.6rem',
                                backgroundColor: 'var(--color-accent)',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                            }}>
                                {item.category}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.25rem' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.9rem',
                                marginBottom: '0.75rem',
                            }}>
                                {item.title}
                            </h3>

                            <div style={{
                                backgroundColor: '#f5f5f5',
                                color: 'var(--color-text)',
                                padding: '1rem',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                lineHeight: 1.7,
                                border: '2px solid var(--color-text)',
                                wordBreak: 'break-word',
                            }}>
                                <span style={{
                                    backgroundColor: 'var(--color-accent)',
                                    color: 'var(--color-text)',
                                    fontWeight: 'bold',
                                    padding: '0.1rem 0.3rem',
                                    marginRight: '0.4rem',
                                    fontSize: '0.65rem',
                                }}>PROMPT</span>
                                {item.prompt.length > CHAR_LIMIT
                                    ? item.prompt.substring(0, CHAR_LIMIT) + '...'
                                    : item.prompt
                                }
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCopy(item.prompt, item.id)}
                                style={{
                                    width: '100%',
                                    marginTop: '0.75rem',
                                    padding: '0.6rem',
                                    border: '1px solid var(--color-text)',
                                    backgroundColor: copiedId === item.id ? 'var(--color-accent)' : 'transparent',
                                    color: 'var(--color-text)',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
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

            {/* Submit CTA */}
            <div style={{
                marginTop: '3rem',
                textAlign: 'center',
            }}>
                <Link to="/submit-prompt" style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    color: '#666',
                    textDecoration: 'underline',
                }}>
                    Have a unique prompt? Submit yours →
                </Link>
            </div>
        </section>
    );
};

export default PromptPreview;
