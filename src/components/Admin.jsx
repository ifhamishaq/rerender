import React, { useState, useEffect } from 'react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('products');

    // --- Products State ---
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', price: '', color: '#000000', category: 'LUTS', link: '', desc: '', image: '', type: 'PAID'
    });

    // --- Prompts State ---
    const [prompts, setPrompts] = useState([]);
    const [editingPromptId, setEditingPromptId] = useState(null);
    const [promptForm, setPromptForm] = useState({
        title: '', prompt: '', category: 'PORTRAIT', image: ''
    });

    // --- Blog State ---
    const [blogPosts, setBlogPosts] = useState([]);
    const [editingBlogId, setEditingBlogId] = useState(null);
    const [blogForm, setBlogForm] = useState({
        title: '', slug: '', excerpt: '', date: new Date().toISOString().split('T')[0],
        author: 'ADMIN', category: 'NEWS', image: '', content: ''
    });

    // --- Careers State ---
    const [careers, setCareers] = useState([]);
    const [editingCareerId, setEditingCareerId] = useState(null);
    const [careerForm, setCareerForm] = useState({
        sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '',
        serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium'
    });

    // --- Services State ---
    const [services, setServices] = useState([]);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        title: '', desc: '', tags: '', gif: ''
    });

    const [status, setStatus] = useState('');

    useEffect(() => {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            window.location.href = '/';
            return;
        }
        fetchProducts();
        fetchPrompts();
        fetchBlog();
        fetchCareers();
        fetchServices();
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
                if (target === 'product') setFormData(prev => ({ ...prev, image: result.url }));
                else if (target === 'prompt') setPromptForm(prev => ({ ...prev, image: result.url }));
                else if (target === 'blog') setBlogForm(prev => ({ ...prev, image: result.url }));
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

    // --- Blog CRUD ---
    const fetchBlog = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/blog');
            const data = await res.json();
            setBlogPosts(data);
        } catch (err) { setStatus('Error fetching blog.'); }
    };

    const handleSaveBlog = async () => {
        const postToSave = { ...blogForm, id: editingBlogId || Date.now() };
        let updated = editingBlogId ? blogPosts.map(p => p.id === editingBlogId ? postToSave : p) : [...blogPosts, postToSave];
        try {
            await fetch('http://localhost:3001/api/blog', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            setBlogPosts(updated); setStatus('Blog saved!'); setEditingBlogId(null);
            setBlogForm({ title: '', slug: '', excerpt: '', date: new Date().toISOString().split('T')[0], author: 'ADMIN', category: 'NEWS', image: '', content: '' });
        } catch (err) { setStatus('Error saving blog.'); }
    };

    const handleDeleteBlog = async (id) => {
        const updated = blogPosts.filter(p => p.id !== id);
        try {
            await fetch('http://localhost:3001/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
            setBlogPosts(updated); setStatus('Post deleted!');
        } catch (err) { setStatus('Error deleting post.'); }
    };

    // --- Careers CRUD ---
    const fetchCareers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/careers');
            const data = await res.json();
            setCareers(data);
        } catch (err) { setStatus('Error fetching careers.'); }
    };

    const handleSaveCareer = async () => {
        const careerToSave = { 
            ...careerForm, 
            id: editingCareerId || Date.now(),
            specs: typeof careerForm.specs === 'string' ? careerForm.specs.split('\n').filter(s => s.trim()) : careerForm.specs
        };
        let updated = editingCareerId ? careers.map(c => c.id === editingCareerId ? careerToSave : c) : [...careers, careerToSave];
        try {
            await fetch('http://localhost:3001/api/careers', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            setCareers(updated); setStatus('Career saved!'); setEditingCareerId(null);
            setCareerForm({ sidemark: '', type: 'INTERNSHIP', status: 'AVAILABLE', title: '', serifTitle: 'The', description: '', specs: '', link: '', buttonLabel: 'APPLY_NOW', style: 'premium' });
        } catch (err) { setStatus('Error saving career.'); }
    };

    const handleDeleteCareer = async (id) => {
        const updated = careers.filter(c => c.id !== id);
        try {
            await fetch('http://localhost:3001/api/careers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
            setCareers(updated); setStatus('Career deleted!');
        } catch (err) { setStatus('Error deleting career.'); }
    };

    // --- Services CRUD ---
    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/services');
            const data = await res.json();
            setServices(data);
        } catch (err) { setStatus('Error fetching services.'); }
    };

    const handleSaveService = async () => {
        const serviceToSave = { 
            ...serviceForm, 
            id: editingServiceId || Date.now(),
            tags: typeof serviceForm.tags === 'string' ? serviceForm.tags.split(',').map(t => t.trim()).filter(t => t) : serviceForm.tags
        };
        let updated = editingServiceId ? services.map(s => s.id === editingServiceId ? serviceToSave : s) : [...services, serviceToSave];
        try {
            await fetch('http://localhost:3001/api/services', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            setServices(updated); setStatus('Service saved!'); setEditingServiceId(null);
            setServiceForm({ title: '', desc: '', tags: '', gif: '' });
        } catch (err) { setStatus('Error saving service.'); }
    };

    const handleDeleteService = async (id) => {
        const updated = services.filter(s => s.id !== id);
        try {
            await fetch('http://localhost:3001/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
            setServices(updated); setStatus('Service deleted!');
        } catch (err) { setStatus('Error deleting service.'); }
    };

    // --- Tab Style ---
    const tabStyle = (tab) => ({
        padding: '1rem 1.5rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: '900',
        fontSize: '0.8rem',
        border: '1px solid var(--color-border)',
        backgroundColor: activeTab === tab ? 'var(--color-accent)' : '#111',
        color: activeTab === tab ? '#000' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        textTransform: 'uppercase',
        flex: 1,
        textAlign: 'center'
    });

    const inputStyle = { 
        padding: '0.85rem', 
        fontFamily: 'var(--font-mono)', 
        border: '1px solid var(--color-border)', 
        backgroundColor: '#1a1a1a', 
        color: '#fff',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none'
    };

    const sectionBox = {
        padding: '2rem',
        backgroundColor: '#0a0a0a',
        border: '1px solid var(--color-border)',
        marginBottom: '2rem'
    };

    const buttonStyle = {
        padding: '1rem',
        backgroundColor: 'var(--color-accent)',
        color: '#000',
        border: 'none',
        fontFamily: 'var(--font-mono)',
        fontWeight: '900',
        cursor: 'pointer',
        textTransform: 'uppercase'
    };

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
            <div style={{ padding: '8rem 2rem 4rem', fontFamily: 'var(--font-mono)', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>ADMIN_CMS</h1>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)' }}>[SYSTEM_CONNECTED] [MODE: PORTAL]</div>
                </div>

                {status && (
                    <div style={{ 
                        padding: '1rem', 
                        backgroundColor: status.includes('Error') ? 'rgba(255,0,0,0.1)' : 'rgba(57, 255, 20, 0.1)', 
                        border: `1px solid ${status.includes('Error') ? 'red' : 'var(--color-accent)'}`,
                        color: status.includes('Error') ? 'red' : 'var(--color-accent)',
                        marginBottom: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}>
                        {status}
                    </div>
                )}

                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-border)' }}>
                    <button onClick={() => setActiveTab('products')} style={tabStyle('products')}>SHOP</button>
                    <button onClick={() => setActiveTab('services')} style={tabStyle('services')}>SERVICES</button>
                    <button onClick={() => setActiveTab('blog')} style={tabStyle('blog')}>BLOG</button>
                    <button onClick={() => setActiveTab('careers')} style={tabStyle('careers')}>CAREERS</button>
                    <button onClick={() => setActiveTab('prompts')} style={tabStyle('prompts')}>PROMPTS</button>
                </div>

                {/* ===== PRODUCTS TAB ===== */}
                {activeTab === 'products' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editingId ? 'EDIT_PRODUCT' : 'NEW_PRODUCT'}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ border: '1px dashed var(--color-border)', padding: '1rem' }}>
                                    <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>IMAGE_UPLOAD</label>
                                    <input type="file" onChange={(e) => handleUpload(e, 'product')} />
                                    {formData.image && <img src={formData.image} alt="Preview" style={{ width: '80px', marginTop: '1rem' }} />}
                                </div>
                                <input placeholder="TITLE" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select value={formData.type} onChange={handleTypeChange} style={inputStyle}>
                                        <option value="PAID">PAID</option><option value="FREE">FREE</option>
                                    </select>
                                    <input placeholder="PRICE" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inputStyle} disabled={formData.type === 'FREE'} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                                        <option value="LUTS">LUTS</option><option value="PACKS">PACKS</option><option value="TEXTURES">TEXTURES</option>
                                    </select>
                                    <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ ...inputStyle, padding: '2px', height: '40px' }} />
                                </div>
                                <textarea placeholder="DESCRIPTION" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} style={{ ...inputStyle, minHeight: '80px' }} />
                                <button onClick={handleSave} style={buttonStyle}>{editingId ? 'UPDATE' : 'DEPLOY'}</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {products.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--color-border)', padding: '1.5rem', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
                                    <div><strong style={{ fontSize: '1.1rem' }}>{p.title}</strong><br/><small style={{ color: 'var(--color-text-secondary)' }}>{p.category} | {p.price}</small></div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>[EDIT]</button>
                                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>[DEL]</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== BLOG TAB ===== */}
                {activeTab === 'blog' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>{editingBlogId ? 'EDIT_POST' : 'WRITE_POST'}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE" value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input placeholder="SLUG" value={blogForm.slug} onChange={e => setBlogForm({...blogForm, slug: e.target.value})} style={inputStyle} />
                                    <input placeholder="CATEGORY" value={blogForm.category} onChange={e => setBlogForm({...blogForm, category: e.target.value})} style={inputStyle} />
                                </div>
                                <textarea placeholder="EXCERPT" value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})} style={{...inputStyle, minHeight: '60px'}} />
                                <textarea placeholder="CONTENT (HTML)" value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})} style={{...inputStyle, minHeight: '200px', fontSize: '0.8rem'}} />
                                <button onClick={handleSaveBlog} style={buttonStyle}>PUBLISH</button>
                            </div>
                        </div>
                        {blogPosts.map(post => (
                            <div key={post.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                <strong>{post.title}</strong>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => { setEditingBlogId(post.id); setBlogForm(post); }} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                    <button onClick={() => handleDeleteBlog(post.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* ===== CAREERS TAB ===== */}
                {activeTab === 'careers' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>MANAGE_OPENINGS</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE (e.g. INTERNSHIP)" value={careerForm.title} onChange={e => setCareerForm({...careerForm, title: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <input placeholder="SIDEMARK (001/INT)" value={careerForm.sidemark} onChange={e => setCareerForm({...careerForm, sidemark: e.target.value})} style={inputStyle} />
                                    <select value={careerForm.status} onChange={e => setCareerForm({...careerForm, status: e.target.value})} style={inputStyle}>
                                        <option value="AVAILABLE">AVAILABLE</option><option value="SCOUTING">SCOUTING</option><option value="COMING_SOON">COMING_SOON</option>
                                    </select>
                                    <select value={careerForm.style} onChange={e => setCareerForm({...careerForm, style: e.target.value})} style={inputStyle}>
                                        <option value="premium">PREMIUM</option><option value="inverted">INVERTED</option><option value="accent">ACCENT</option>
                                    </select>
                                </div>
                                <textarea placeholder="DESCRIPTION" value={careerForm.description} onChange={e => setCareerForm({...careerForm, description: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                                <textarea placeholder="SPECS (One per line)" value={Array.isArray(careerForm.specs) ? careerForm.specs.join('\n') : careerForm.specs} onChange={e => setCareerForm({...careerForm, specs: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                                <button onClick={handleSaveCareer} style={buttonStyle}>SAVE_LISTING</button>
                            </div>
                        </div>
                        {careers.map(c => (
                            <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                <strong>{c.title}</strong> [{c.status}]
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => { setEditingCareerId(c.id); setCareerForm(c); }} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                    <button onClick={() => handleDeleteCareer(c.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* ===== PROMPTS TAB ===== */}
                {activeTab === 'prompts' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>PROMPT_ENGINE</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE" value={promptForm.title} onChange={e => setPromptForm({ ...promptForm, title: e.target.value })} style={inputStyle} />
                                <textarea placeholder="PROMPT_TEXT" value={promptForm.prompt} onChange={e => setPromptForm({ ...promptForm, prompt: e.target.value })} style={{ ...inputStyle, minHeight: '120px' }} />
                                <button onClick={handleSavePrompt} style={buttonStyle}>SAVE_PROMPT</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {prompts.map(p => (
                                <div key={p.id} style={{ border: '1px solid var(--color-border)', padding: '1rem' }}>
                                    <strong>{p.title}</strong>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleEditPrompt(p)} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                        <button onClick={() => handleDeletePrompt(p.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== SERVICES TAB ===== */}
                {activeTab === 'services' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem' }}>MANAGE_SERVICES</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input placeholder="TITLE" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} style={inputStyle} />
                                <input placeholder="GIF URL / PATH" value={serviceForm.gif} onChange={e => setServiceForm({...serviceForm, gif: e.target.value})} style={inputStyle} />
                                <textarea placeholder="DESCRIPTION" value={serviceForm.desc} onChange={e => setServiceForm({...serviceForm, desc: e.target.value})} style={{...inputStyle, minHeight: '80px'}} />
                                <input placeholder="TAGS (comma separated)" value={Array.isArray(serviceForm.tags) ? serviceForm.tags.join(', ') : serviceForm.tags} onChange={e => setServiceForm({...serviceForm, tags: e.target.value})} style={inputStyle} />
                                <button onClick={handleSaveService} style={buttonStyle}>SAVE_SERVICE</button>
                            </div>
                        </div>
                        {services.map(s => (
                            <div key={s.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                <strong>{s.title}</strong>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => { setEditingServiceId(s.id); setServiceForm(s); }} style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>[EDIT]</button>
                                    <button onClick={() => handleDeleteService(s.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>[DEL]</button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Admin;

