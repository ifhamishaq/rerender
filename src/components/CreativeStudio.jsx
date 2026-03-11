import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

const RED = '#E8111A';

/* ─── Error Boundary — prevents black screen on render errors ─ */
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
    componentDidCatch(e) { console.error('[CreativeStudio]', e); }
    render() {
        if (this.state.hasError) return (
            <div style={{
                padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                color: RED, border: `1px solid ${RED}`, margin: '0.5rem'
            }}>
                ⚠ RENDER ERROR — {String(this.state.error?.message || 'unknown')}<br />
                <button onClick={() => this.setState({ hasError: false, error: null })}
                    style={{
                        marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                        color: RED, background: 'transparent', border: `1px solid ${RED}`, cursor: 'pointer', padding: '0.25rem 0.75rem'
                    }}>
                    RETRY
                </button>
            </div>
        );
        return this.props.children;
    }
}

const ELEMENT_TYPES = [
    { type: 'button-primary', label: 'Primary Button', icon: '▣', defaultProps: { text: 'HIRE US →', bgColor: RED, textColor: '#fff', fontSize: 14, width: 140, height: 44 } },
    { type: 'button-outline', label: 'Outline Button', icon: '□', defaultProps: { text: 'VIEW WORK', bgColor: 'transparent', textColor: '#0E0E0E', borderColor: '#0E0E0E', fontSize: 14, width: 140, height: 44 } },
    { type: 'section-label', label: 'Section Label', icon: '—', defaultProps: { number: '01', text: 'SECTION NAME', accentColor: RED, fontSize: 11, width: 280, height: 24 } },
    { type: 'heading', label: 'Heading', icon: 'H', defaultProps: { text: 'EDITORIAL\nHEADING', textColor: '#0E0E0E', accentColor: RED, fontSize: 48, width: 440 } },
    { type: 'mono-text', label: 'Body Text', icon: 'T', defaultProps: { text: 'A high quality creative studio\nfor post-internet brands.', textColor: '#555', fontSize: 13, width: 280 } },
    { type: 'card', label: 'Product Card', icon: '⊡', defaultProps: { title: 'CINEMATIC LUT PACK', tag: 'FREE', tagColor: RED, bgColor: '#fff', borderColor: '#ddd', desc: 'High quality cinematic grade', width: 200, height: 240 } },
    { type: 'stat-block', label: 'Stat Block', icon: '#', defaultProps: { number: '120+', label: 'PROJECTS DELIVERED', textColor: '#0E0E0E', accentColor: RED, fontSize: 42, width: 200 } },
    { type: 'badge', label: 'Badge', icon: '●', defaultProps: { text: 'FREE', bgColor: RED, textColor: '#fff', fontSize: 11, width: 60, height: 26 } },
    { type: 'accent-line', label: 'Accent Line', icon: '─', defaultProps: { color: RED, thickness: 3, width: 300 } },
    { type: 'image-placeholder', label: 'Image Block', icon: '⬜', defaultProps: { bgColor: '#EFEDE8', borderColor: '#ccc', imgLabel: 'IMAGE', width: 240, height: 180 } },
    { type: 'navbar-strip', label: 'Navbar Strip', icon: '≡', defaultProps: { bgColor: '#0E0E0E', textColor: '#fff', accentColor: RED, width: 500, height: 52 } },
    { type: 'quote', label: 'Quote', icon: '"', defaultProps: { text: 'We render ideas into reality.', accentColor: RED, textColor: '#0E0E0E', fontSize: 22, width: 360 } },
];

/* ─── Single element renderer (no position/left/top — handled by wrapper) ── */
const RenderElement = ({ el, selected, onPointerDown }) => {
    const { type, props: p } = el;

    const border = selected
        ? `2px solid ${RED}`
        : '2px solid transparent';

    const stop = (e) => e.stopPropagation();

    switch (type) {
        case 'button-primary':
        case 'button-outline':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        width: p.width, height: p.height, outline: border, outlineOffset: 2,
                        backgroundColor: p.bgColor, border: p.borderColor ? `2px solid ${p.borderColor}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"JetBrains Mono", monospace', fontSize: p.fontSize, fontWeight: 700,
                        letterSpacing: '0.08em', color: p.textColor, whiteSpace: 'nowrap', cursor: 'move',
                        userSelect: 'none', boxSizing: 'border-box',
                    }}>{p.text}</div>
            );

        case 'section-label':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2, width: p.width, height: p.height,
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'move', userSelect: 'none',
                        fontFamily: '"JetBrains Mono", monospace', fontSize: p.fontSize,
                        letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', whiteSpace: 'nowrap',
                    }}>
                    <span style={{ color: p.accentColor, fontWeight: 700 }}>{p.number}</span>
                    <span>— {p.text}</span>
                </div>
            );

        case 'heading':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{ outline: border, outlineOffset: 2, width: p.width, cursor: 'move', userSelect: 'none' }}>
                    <div style={{
                        fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900,
                        fontSize: p.fontSize, lineHeight: 0.92, color: p.textColor,
                        whiteSpace: 'pre-line', letterSpacing: '-0.02em', textTransform: 'uppercase'
                    }}>
                        {(p.text || '').split('\n').map((line, i, arr) => (
                            <div key={i}>
                                {i === arr.length - 1
                                    ? <span style={{ color: p.accentColor }}>{line}</span>
                                    : line}
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'mono-text':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2, width: p.width, cursor: 'move', userSelect: 'none',
                        fontFamily: '"JetBrains Mono", monospace', fontSize: p.fontSize,
                        color: p.textColor, lineHeight: 1.7, whiteSpace: 'pre-line'
                    }}>
                    {p.text}
                </div>
            );

        case 'card':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2,
                        width: p.width, height: p.height, backgroundColor: p.bgColor,
                        border: `1px solid ${p.borderColor}`, display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', cursor: 'move', userSelect: 'none', flexShrink: 0,
                    }}>
                    <div style={{
                        flex: 1, backgroundColor: '#EFEDE8', borderBottom: `1px solid ${p.borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#bbb', letterSpacing: '0.15em'
                    }}>
                        IMAGE
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#999', letterSpacing: '0.12em' }}>LUTS</span>
                            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: p.tagColor }}>{p.tag}</span>
                        </div>
                        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 12, color: '#0E0E0E', marginBottom: '0.15rem' }}>{p.title}</div>
                        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#888' }}>{p.desc}</div>
                    </div>
                </div>
            );

        case 'stat-block':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{ outline: border, outlineOffset: 2, width: p.width, cursor: 'move', userSelect: 'none' }}>
                    <div style={{
                        fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900,
                        fontSize: p.fontSize, lineHeight: 1, color: p.textColor
                    }}>
                        {String(p.number || '').split('').map((c, i) =>
                            isNaN(c) ? <span key={i} style={{ color: p.accentColor }}>{c}</span> : c
                        )}
                    </div>
                    <div style={{
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
                        letterSpacing: '0.15em', color: '#888', marginTop: '0.25rem', textTransform: 'uppercase'
                    }}>
                        {p.label}
                    </div>
                </div>
            );

        case 'badge':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2,
                        width: p.width, height: p.height, backgroundColor: p.bgColor, color: p.textColor,
                        fontFamily: '"JetBrains Mono", monospace', fontSize: p.fontSize, fontWeight: 700,
                        letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'move', userSelect: 'none',
                    }}>
                    {p.text}
                </div>
            );

        case 'accent-line':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2,
                        width: p.width, height: p.thickness + 4, backgroundColor: p.color,
                        cursor: 'move', userSelect: 'none',
                    }} />
            );

        case 'image-placeholder':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2,
                        width: p.width, height: p.height, backgroundColor: p.bgColor,
                        border: `1px solid ${p.borderColor}`, position: 'relative', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'move', userSelect: 'none',
                    }}>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke={p.borderColor} strokeWidth="1" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke={p.borderColor} strokeWidth="1" />
                    </svg>
                    <span style={{
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                        color: '#bbb', letterSpacing: '0.2em', position: 'relative'
                    }}>
                        {p.imgLabel}
                    </span>
                </div>
            );

        case 'navbar-strip':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2,
                        width: p.width, height: p.height, backgroundColor: p.bgColor,
                        display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '2rem',
                        cursor: 'move', userSelect: 'none',
                    }}>
                    <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: 15, color: p.textColor }}>
                        RE<span style={{ color: p.accentColor }}>-</span>RENDER
                    </span>
                    {['SERVICES', 'SHOP', 'ARCADE'].map(lbl => (
                        <span key={lbl} style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em'
                        }}>{lbl}</span>
                    ))}
                </div>
            );

        case 'quote':
            return (
                <div onPointerDown={onPointerDown} onClick={stop}
                    style={{
                        outline: border, outlineOffset: 2,
                        width: p.width, borderLeft: `3px solid ${p.accentColor}`, paddingLeft: '1rem',
                        cursor: 'move', userSelect: 'none',
                    }}>
                    <div style={{
                        fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700,
                        fontSize: p.fontSize, color: p.textColor, lineHeight: 1.3, fontStyle: 'italic'
                    }}>
                        "{p.text}"
                    </div>
                </div>
            );

        default: return null;
    }
};

/* ─── Property editor ───────────────────────────────── */
const PropEditor = ({ el, onChange, onDelete }) => {
    if (!el) return (
        <div style={{
            padding: '1.5rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: 'var(--color-text-secondary)', letterSpacing: '0.1em', textAlign: 'center', lineHeight: 2
        }}>
            CLICK AN ELEMENT<br />TO EDIT PROPERTIES
        </div>
    );

    const p = el.props;
    const field = (label, key, type = 'text', min, max) => (
        <div key={key} style={{ marginBottom: '0.65rem' }}>
            <label style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em',
                color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem',
                textTransform: 'uppercase'
            }}>{label}</label>
            {type === 'color'
                ? <input type="color" value={p[key] || '#000000'} onChange={e => onChange(key, e.target.value)}
                    style={{ width: '100%', height: '30px', border: '1px solid var(--color-border)', cursor: 'pointer' }} />
                : type === 'range'
                    ? <>
                        <input type="range" value={p[key]} min={min} max={max}
                            onChange={e => onChange(key, Number(e.target.value))}
                            style={{ width: '100%', accentColor: RED }} />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>{p[key]}</div>
                    </>
                    : <input type="text" value={p[key] ?? ''} onChange={e => onChange(key, e.target.value)}
                        style={{
                            width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                            padding: '0.35rem 0.5rem', border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none',
                            boxSizing: 'border-box'
                        }} />
            }
        </div>
    );

    return (
        <div style={{ padding: '0.75rem 1rem', overflowY: 'auto' }}>
            <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: RED,
                letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem'
            }}>
                {el.type.replace(/-/g, ' ').toUpperCase()}
            </div>

            {'text' in p && field('Text', 'text')}
            {'number' in p && field('Number', 'number')}
            {'label' in p && el.type === 'stat-block' && field('Label', 'label')}
            {'imgLabel' in p && field('Image Label', 'imgLabel')}
            {'desc' in p && field('Description', 'desc')}
            {'title' in p && field('Title', 'title')}
            {'tag' in p && field('Tag Text', 'tag')}

            {'textColor' in p && field('Text Color', 'textColor', 'color')}
            {'bgColor' in p && field('Background', 'bgColor', 'color')}
            {'accentColor' in p && field('Accent Color', 'accentColor', 'color')}
            {'borderColor' in p && field('Border Color', 'borderColor', 'color')}
            {'tagColor' in p && field('Tag Color', 'tagColor', 'color')}
            {'color' in p && el.type === 'accent-line' && field('Line Color', 'color', 'color')}

            {'fontSize' in p && field('Font Size', 'fontSize', 'range', 8, 80)}
            {'width' in p && field('Width', 'width', 'range', 40, 800)}
            {'height' in p && el.type !== 'heading' && el.type !== 'mono-text' && el.type !== 'stat-block' && el.type !== 'quote' && field('Height', 'height', 'range', 20, 500)}
            {'thickness' in p && field('Thickness', 'thickness', 'range', 1, 20)}

            <button onClick={onDelete}
                style={{
                    marginTop: '0.5rem', width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    fontWeight: 700, padding: '0.5rem', backgroundColor: 'transparent',
                    border: `1px solid ${RED}`, color: RED, cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = RED; }}>
                DELETE
            </button>
        </div>
    );
};

/* ─── Main ──────────────────────────────────────────── */
const CreativeStudio = () => {
    const [elements, setElements] = useState([]);
    const [selected, setSelected] = useState(null);
    const [userName, setUserName] = useState('');
    const [bgColor, setBgColor] = useState('#F8F6F1');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const canvasRef = useRef(null);
    const dragRef = useRef(null); // { id, offsetX, offsetY }

    /* Global pointer move/up for dragging */
    useEffect(() => {
        const onMove = (e) => {
            const drag = dragRef.current; // capture early — onUp may null it before setElements runs
            if (!drag) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const cRect = canvas.getBoundingClientRect();
            const wrapper = document.getElementById(`el-wrap-${drag.id}`);
            const elW = wrapper ? wrapper.offsetWidth : 0;
            const elH = wrapper ? wrapper.offsetHeight : 0;
            const x = Math.min(
                Math.max(0, e.clientX - cRect.left - drag.offsetX),
                cRect.width - elW
            );
            const y = Math.min(
                Math.max(0, e.clientY - cRect.top - drag.offsetY),
                cRect.height - elH
            );
            setElements(prev => prev.map(el =>
                el.id === drag.id ? { ...el, x, y } : el
            ));
        };
        const onUp = () => { dragRef.current = null; };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, []);

    const handlePointerDown = useCallback((e, id) => {
        e.stopPropagation(); // ← prevents canvas onClick from clearing selection
        e.preventDefault();
        setSelected(id);
        const wrapper = document.getElementById(`el-wrap-${id}`);
        if (!wrapper) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const wRect = wrapper.getBoundingClientRect();
        const cRect = canvas.getBoundingClientRect();
        dragRef.current = {
            id,
            offsetX: e.clientX - wRect.left,
            offsetY: e.clientY - wRect.top,
        };
    }, []);

    const addElement = (typeDef) => {
        const id = Date.now();
        setElements(prev => [...prev, {
            id, type: typeDef.type,
            x: 80 + Math.random() * 120,
            y: 60 + Math.random() * 80,
            props: { ...typeDef.defaultProps },
        }]);
        setSelected(id);
    };

    const updateProp = (key, value) => {
        setElements(prev => prev.map(el =>
            el.id === selected ? { ...el, props: { ...el.props, [key]: value } } : el
        ));
    };

    const deleteSelected = () => {
        setElements(prev => prev.filter(el => el.id !== selected));
        setSelected(null);
    };

    const saveImage = async () => {
        setSaving(true);
        try {
            const canvas = await html2canvas(canvasRef.current, {
                scale: 2, useCORS: true, backgroundColor: bgColor, logging: false,
            });
            const W = canvas.width, H = canvas.height, barH = 60;
            const out = document.createElement('canvas');
            out.width = W; out.height = H + barH;
            const ctx = out.getContext('2d');
            ctx.drawImage(canvas, 0, 0);
            ctx.fillStyle = '#0E0E0E';
            ctx.fillRect(0, H, W, barH);
            ctx.fillStyle = RED;
            ctx.fillRect(0, H, 5, barH);
            ctx.fillStyle = '#fff';
            ctx.font = '700 15px "Space Grotesk", sans-serif';
            ctx.fillText('RE-RENDER', 22, H + 24);
            ctx.fillStyle = RED;
            ctx.fillText(' ×', 22 + ctx.measureText('RE-RENDER').width, H + 24);
            const name = (userName.trim() || 'ARTIST').toUpperCase();
            ctx.fillStyle = '#fff';
            ctx.font = '700 15px "JetBrains Mono", monospace';
            ctx.fillText(name, 22 + ctx.measureText('RE-RENDER ×').width + 10, H + 24);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '400 11px "JetBrains Mono", monospace';
            ctx.fillText(`CREATIVE STUDIO — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 22, H + 46);
            const link = document.createElement('a');
            link.download = `re-render-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = out.toDataURL('image/png');
            link.click();
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const selectedEl = elements.find(el => el.id === selected) ?? null;

    return (
        <section style={{ padding: '8rem 2rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '2rem'
                }}>
                    <span style={{ color: RED, fontWeight: 700 }}>02</span>
                    <span>— CREATIVE STUDIO</span>
                    <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 0.9, margin: '0 0 1rem',
                        textTransform: 'uppercase', letterSpacing: '-0.02em'
                    }}>
                        DESIGN WITH<br /><span style={{ color: RED }}>OUR ELEMENTS</span>
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                        color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '500px'
                    }}>
                        Add RE-RENDER UI components, drag them around, customize properties, then save with your name on the image.
                    </p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: '190px 1fr 210px', gap: '1px',
                    border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border)', overflow: 'hidden'
                }}>

                    {/* Left — library */}
                    <div style={{ backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                            letterSpacing: '0.2em', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)',
                            textTransform: 'uppercase', flexShrink: 0
                        }}>
                            ELEMENTS
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {ELEMENT_TYPES.map(t => (
                                <button key={t.type} onClick={() => addElement(t)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.55rem 1rem',
                                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.04em',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        backgroundColor: 'transparent', border: 'none',
                                        borderBottom: '1px solid var(--color-border)',
                                        color: 'var(--color-text)', cursor: 'pointer', transition: 'background 0.12s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <span style={{ color: RED, fontWeight: 700, minWidth: '16px' }}>{t.icon}</span>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)' }}>
                                <div style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em',
                                    color: 'var(--color-text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase'
                                }}>
                                    Canvas BG
                                </div>
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                                    style={{ width: '100%', height: '28px', border: '1px solid var(--color-border)', cursor: 'pointer' }} />
                            </div>
                        </div>
                    </div>

                    {/* Center — canvas */}
                    <div
                        ref={canvasRef}
                        onPointerDown={() => setSelected(null)}  /* deselect only on bare canvas click */
                        style={{
                            position: 'relative', width: '100%', height: '560px',
                            backgroundColor: bgColor, overflow: 'hidden'
                        }}
                    >
                        {elements.length === 0 && (
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.12em',
                                color: 'rgba(0,0,0,0.18)', pointerEvents: 'none', textTransform: 'uppercase'
                            }}>
                                <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>←</span>
                                <span>Click an element to add</span>
                            </div>
                        )}
                        {elements.map(el => (
                            <ErrorBoundary key={el.id}>
                                <div
                                    id={`el-wrap-${el.id}`}
                                    style={{ position: 'absolute', left: el.x, top: el.y }}
                                >
                                    <RenderElement
                                        el={el}
                                        selected={selected === el.id}
                                        onPointerDown={(e) => handlePointerDown(e, el.id)}
                                    />
                                </div>
                            </ErrorBoundary>
                        ))}
                    </div>

                    {/* Right — props */}
                    <div style={{ backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', maxHeight: '560px' }}>
                        <div style={{
                            padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                            letterSpacing: '0.2em', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)',
                            textTransform: 'uppercase', flexShrink: 0
                        }}>
                            PROPERTIES
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <PropEditor el={selectedEl} onChange={updateProp} onDelete={deleteSelected} />
                        </div>
                    </div>

                </div>

                {/* Save */}
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input value={userName} onChange={e => setUserName(e.target.value)}
                        placeholder="YOUR NAME" maxLength={32}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
                            letterSpacing: '0.1em', padding: '0.65rem 1rem', textTransform: 'uppercase',
                            border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)', outline: 'none', width: '220px'
                        }} />
                    <motion.button whileTap={{ scale: 0.97 }} onClick={saveImage} disabled={saving}
                        style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
                            letterSpacing: '0.1em', padding: '0.65rem 2rem',
                            backgroundColor: saved ? '#22AA55' : RED, color: '#fff', border: 'none',
                            cursor: 'pointer', textTransform: 'uppercase', transition: 'background-color 0.3s',
                            opacity: saving ? 0.7 : 1
                        }}>
                        {saving ? '⏳ SAVING...' : saved ? '✓ SAVED!' : '↓ SAVE IMAGE'}
                    </motion.button>
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                        color: 'var(--color-text-secondary)', letterSpacing: '0.08em'
                    }}>
                        Exports with RE-RENDER × your name & date
                    </span>
                </div>
            </div>
        </section>
    );
};

export default CreativeStudio;
