import React, { useState, useEffect } from 'react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('products');

    // --- Products State ---
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        color: '#000000',
        category: 'LUTS',
        link: '',
        desc: '',
        image: '',
        type: 'PAID'
    });

    // --- Prompts State ---
    const [prompts, setPrompts] = useState([]);
    const [editingPromptId, setEditingPromptId] = useState(null);
    const [promptForm, setPromptForm] = useState({
        title: '',
        prompt: '',
        category: 'PORTRAIT',
        image: ''
    });

    const [status, setStatus] = useState('');

    useEffect(() => {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            window.location.href = '/';
            return;
        }
        fetchProducts();
        fetchPrompts();
    }, []);

    // --- Products CRUD ---
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setStatus('Error fetching products. Is the admin-server running?');
        }
    };

    const handleUpload = async (e, target = 'product') => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (result.url) {
                if (target === 'product') {
                    setFormData(prev => ({ ...prev, image: result.url }));
                } else {
                    setPromptForm(prev => ({ ...prev, image: result.url }));
                }
                setStatus('Image uploaded successfully');
            }
        } catch (err) {
            console.error(err);
            setStatus('Image upload failed');
        }
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setFormData(prev => ({
            ...prev,
            type,
            price: type === 'FREE' ? 'FREE' : prev.price
        }));
    };

    const handleSave = async () => {
        const productToSave = {
            ...formData,
            id: editingId || Date.now()
        };

        if (productToSave.type === 'FREE') {
            productToSave.price = 'FREE';
        }

        let updatedProducts;
        if (editingId) {
            updatedProducts = products.map(p => p.id === editingId ? productToSave : p);
        } else {
            updatedProducts = [...products, productToSave];
        }

        try {
            await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProducts)
            });
            setProducts(updatedProducts);
            setStatus('Saved successfully!');
            setEditingId(null);
            setFormData({ title: '', price: '', color: '#000000', category: 'LUTS', link: '', desc: '', image: '', type: 'PAID' });
        } catch (err) {
            setStatus('Error saving data.');
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({ ...product, type: product.price === 'FREE' ? 'FREE' : 'PAID' });
    };

    const handleDelete = async (id) => {
        const updatedProducts = products.filter(p => p.id !== id);
        try {
            await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProducts)
            });
            setProducts(updatedProducts);
            setStatus('Deleted successfully!');
        } catch (err) {
            setStatus('Error deleting.');
        }
    };

    // --- Prompts CRUD ---
    const fetchPrompts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/prompts');
            const data = await res.json();
            setPrompts(data);
        } catch (err) {
            setStatus('Error fetching prompts. Is the admin-server running?');
        }
    };

    const handleSavePrompt = async () => {
        const promptToSave = {
            ...promptForm,
            id: editingPromptId || Date.now()
        };

        let updatedPrompts;
        if (editingPromptId) {
            updatedPrompts = prompts.map(p => p.id === editingPromptId ? promptToSave : p);
        } else {
            updatedPrompts = [...prompts, promptToSave];
        }

        try {
            await fetch('http://localhost:3001/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPrompts)
            });
            setPrompts(updatedPrompts);
            setStatus('Prompt saved successfully!');
            setEditingPromptId(null);
            setPromptForm({ title: '', prompt: '', category: 'PORTRAIT', image: '' });
        } catch (err) {
            setStatus('Error saving prompt.');
        }
    };

    const handleEditPrompt = (prompt) => {
        setEditingPromptId(prompt.id);
        setPromptForm({ ...prompt });
    };

    const handleDeletePrompt = async (id) => {
        const updatedPrompts = prompts.filter(p => p.id !== id);
        try {
            await fetch('http://localhost:3001/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPrompts)
            });
            setPrompts(updatedPrompts);
            setStatus('Prompt deleted!');
        } catch (err) {
            setStatus('Error deleting prompt.');
        }
    };

    // --- Tab Style ---
    const tabStyle = (tab) => ({
        padding: '0.75rem 2rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        border: '2px solid var(--color-text)',
        backgroundColor: activeTab === tab ? 'var(--color-text)' : 'transparent',
        color: activeTab === tab ? '#fff' : 'var(--color-text)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
    });

    const inputStyle = { padding: '0.5rem', fontFamily: 'var(--font-mono)', border: '1px solid #ccc', width: '100%' };

    return (
        <div style={{ padding: '6rem 2rem 4rem', fontFamily: 'var(--font-mono)', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>ADMIN_PANEL</h1>
            {status && <p style={{ color: status.includes('Error') || status.includes('failed') ? 'red' : 'var(--color-accent)', marginBottom: '1rem', fontWeight: 'bold' }}>{status}</p>}

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }}>
                <button onClick={() => setActiveTab('products')} style={tabStyle('products')}>PRODUCTS</button>
                <button onClick={() => setActiveTab('prompts')} style={tabStyle('prompts')}>PROMPTS</button>
            </div>

            {/* ===== PRODUCTS TAB ===== */}
            {activeTab === 'products' && (
                <>
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid var(--color-text)' }}>
                        <h2 style={{ marginBottom: '1rem' }}>{editingId ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div style={{ border: '1px dashed #999', padding: '1rem' }}>
                                <label>Cover Image:</label>
                                <input type="file" onChange={(e) => handleUpload(e, 'product')} style={{ marginTop: '0.5rem' }} />
                                {formData.image && <img src={formData.image} alt="Preview" style={{ width: '100px', marginTop: '1rem', display: 'block' }} />}
                            </div>

                            <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />

                            <select value={formData.type} onChange={handleTypeChange} style={inputStyle}>
                                <option value="PAID">PAID</option>
                                <option value="FREE">FREE</option>
                            </select>

                            <input placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inputStyle} disabled={formData.type === 'FREE'} />
                            <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ ...inputStyle, height: '40px' }} />

                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                                <option value="LUTS">LUTS</option>
                                <option value="GRADES">GRADES</option>
                                <option value="PRESETS">PRESETS</option>
                                <option value="EFFECTS">EFFECTS</option>
                                <option value="PACKS">PACKS</option>
                                <option value="TEXTURES">TEXTURES</option>
                            </select>

                            <input placeholder="Download Link / URL" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} style={inputStyle} />
                            <textarea placeholder="Description" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />

                            <button onClick={handleSave} style={{ padding: '0.75rem', backgroundColor: 'var(--color-text)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', border: 'none', fontSize: '0.9rem' }}>
                                {editingId ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
                            </button>
                            {editingId && (
                                <button onClick={() => { setEditingId(null); setFormData({ title: '', price: '', color: '#000000', category: 'LUTS', link: '', desc: '', image: '', type: 'PAID' }); }} style={{ padding: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {products.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #ddd', padding: '1rem', alignItems: 'center' }}>
                                <div>
                                    <strong>{p.title}</strong> ({p.price})
                                    <br />
                                    <small style={{ color: '#666' }}>{p.desc}</small>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(p)} style={{ fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(p.id)} style={{ color: 'red', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ===== PROMPTS TAB ===== */}
            {activeTab === 'prompts' && (
                <>
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid var(--color-text)' }}>
                        <h2 style={{ marginBottom: '1rem' }}>{editingPromptId ? 'EDIT PROMPT' : 'ADD PROMPT'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div style={{ border: '1px dashed #999', padding: '1rem' }}>
                                <label>Reference Image:</label>
                                <input type="file" onChange={(e) => handleUpload(e, 'prompt')} style={{ marginTop: '0.5rem' }} />
                                {promptForm.image && <img src={promptForm.image} alt="Preview" style={{ width: '100px', marginTop: '1rem', display: 'block' }} />}
                            </div>

                            <input placeholder="Prompt Title" value={promptForm.title} onChange={e => setPromptForm({ ...promptForm, title: e.target.value })} style={inputStyle} />

                            <select value={promptForm.category} onChange={e => setPromptForm({ ...promptForm, category: e.target.value })} style={inputStyle}>
                                <option value="PORTRAIT">PORTRAIT</option>
                                <option value="LANDSCAPE">LANDSCAPE</option>
                                <option value="PRODUCT">PRODUCT</option>
                                <option value="ABSTRACT">ABSTRACT</option>
                                <option value="CINEMATIC">CINEMATIC</option>
                                <option value="ANIME">ANIME</option>
                                <option value="3D">3D</option>
                                <option value="OTHER">OTHER</option>
                            </select>

                            <textarea
                                placeholder="Enter the full prompt text here..."
                                value={promptForm.prompt}
                                onChange={e => setPromptForm({ ...promptForm, prompt: e.target.value })}
                                style={{ ...inputStyle, minHeight: '120px' }}
                            />

                            <button onClick={handleSavePrompt} style={{ padding: '0.75rem', backgroundColor: 'var(--color-text)', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', border: 'none', fontSize: '0.9rem' }}>
                                {editingPromptId ? 'UPDATE PROMPT' : 'ADD PROMPT'}
                            </button>
                            {editingPromptId && (
                                <button onClick={() => { setEditingPromptId(null); setPromptForm({ title: '', prompt: '', category: 'PORTRAIT', image: '' }); }} style={{ padding: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {prompts.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #ddd', padding: '1rem', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <strong>{p.title}</strong> <span style={{ color: '#999', fontSize: '0.8rem' }}>({p.category})</span>
                                    <br />
                                    <small style={{ color: '#666', wordBreak: 'break-word' }}>{p.prompt.substring(0, 80)}...</small>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <button onClick={() => handleEditPrompt(p)} style={{ fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDeletePrompt(p.id)} style={{ color: 'red', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Admin;

