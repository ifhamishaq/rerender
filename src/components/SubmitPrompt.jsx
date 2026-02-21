import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SubmitPrompt = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString(),
        })
            .then(() => setSubmitted(true))
            .catch(() => alert('Submission failed. Please try again.'));
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        border: '2px solid var(--color-text)',
        backgroundColor: '#fff',
        color: 'var(--color-text)',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    };

    if (submitted) {
        return (
            <section style={{
                padding: '8rem 2rem 6rem',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        maxWidth: '500px',
                    }}
                >
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        marginBottom: '1rem',
                    }}>
                        SUBMITTED ✓
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        color: '#666',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                    }}>
                        Your prompt has been received. If it's selected, it will appear on the Prompts page.
                    </p>
                    <a href="/prompts" style={{
                        display: 'inline-block',
                        marginTop: '2rem',
                        padding: '0.75rem 2rem',
                        border: '2px solid var(--color-text)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                    }}>
                        ← BACK TO PROMPTS
                    </a>
                </motion.div>
            </section>
        );
    }

    return (
        <section style={{
            padding: '8rem 2rem 6rem',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    borderBottom: '2px solid var(--color-text)',
                    paddingBottom: '1rem',
                    marginBottom: '3rem',
                }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        margin: 0,
                        lineHeight: 1,
                    }}>
                        SUBMIT_PROMPT
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginTop: '1rem',
                    }}>
                        Share your unique AI prompts with the community. Selected prompts will be featured on the Prompts page.
                    </p>
                </div>

                {/* Netlify Form */}
                <form
                    name="prompt-submissions"
                    method="POST"
                    data-netlify="true"
                    netlify-honeypot="bot-field"
                    onSubmit={handleSubmit}
                >
                    <input type="hidden" name="form-name" value="prompt-submissions" />
                    <p hidden>
                        <label>Don't fill this out: <input name="bot-field" /></label>
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div>
                            <label style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                            }}>
                                YOUR NAME
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="John Doe"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                            }}>
                                EMAIL
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="you@example.com"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                            }}>
                                PROMPT TITLE
                            </label>
                            <input
                                type="text"
                                name="prompt-title"
                                required
                                placeholder="e.g. Cinematic Sunset"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                            }}>
                                CATEGORY
                            </label>
                            <select name="category" required style={inputStyle}>
                                <option value="">Select a category...</option>
                                <option value="PORTRAIT">PORTRAIT</option>
                                <option value="LANDSCAPE">LANDSCAPE</option>
                                <option value="PRODUCT">PRODUCT</option>
                                <option value="ABSTRACT">ABSTRACT</option>
                                <option value="CINEMATIC">CINEMATIC</option>
                                <option value="ANIME">ANIME</option>
                                <option value="3D">3D</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                            }}>
                                YOUR PROMPT
                            </label>
                            <textarea
                                name="prompt"
                                required
                                rows="6"
                                placeholder="Paste your full prompt here..."
                                style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                            />
                        </div>

                        <div>
                            <label style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                            }}>
                                AI TOOL USED
                            </label>
                            <input
                                type="text"
                                name="ai-tool"
                                placeholder="e.g. Midjourney, DALL·E, Stable Diffusion"
                                style={inputStyle}
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: 'var(--color-text)',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginTop: '0.5rem',
                            }}
                        >
                            SUBMIT PROMPT →
                        </motion.button>
                    </div>
                </form>

                {/* Contact */}
                <div style={{
                    marginTop: '3rem',
                    padding: '1.5rem',
                    border: '2px solid var(--color-text)',
                    backgroundColor: '#fff',
                    textAlign: 'center',
                }}>
                    <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: '#666',
                        margin: 0,
                    }}>
                        Have questions? Reach out directly:
                    </p>
                    <a
                        href="mailto:real.re.render@gmail.com"
                        style={{
                            display: 'inline-block',
                            marginTop: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            color: 'var(--color-text)',
                            textDecoration: 'underline',
                        }}
                    >
                        real.re.render@gmail.com
                    </a>
                </div>
            </div>
        </section>
    );
};

export default SubmitPrompt;
