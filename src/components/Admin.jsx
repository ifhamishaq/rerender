import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const { user, profile, loading: authLoading } = useAuth(); // Get profile for role check
    const [activeTab, setActiveTab] = useState('products');
    const [adminPin, setAdminPin] = useState('');
    const [isPinAuthorized, setIsPinAuthorized] = useState(() => {
        return sessionStorage.getItem('ADMIN_AUTH_L5') === 'granted';
    });

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
 
    // --- Credit Requests State ---
    const [topupRequests, setTopupRequests] = useState([]);
 
    // --- Phase 6: All Users State ---
    const [allUsers, setAllUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
 
    // --- Phase 6: Moderation State ---
    const [allThreads, setAllThreads] = useState([]);
 
    // --- Phase 6: Metrics State ---
    const [metrics, setMetrics] = useState({ users: 0, threads: 0, totalCredits: 0 });
 
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (authLoading) return; // Wait for auth to settle

        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isOwner = profile?.role === 'admin';

        if (!isLocal && !isOwner) {
            console.log('--- ADMIN_ACCESS_DENIED ---');
            console.log('Current UID:', user?.id);
            console.log('Current Role:', profile?.role || 'user');
            console.log('To promote, run: UPDATE profiles SET role = "admin" WHERE id = "' + user?.id + '";');
            window.location.href = '/';
            return;
        }
        
        fetchProducts();
        fetchPrompts();
        fetchBlog();
        fetchCareers();
        fetchServices();
        fetchTopupRequests();
        fetchAllUsers();
        fetchAllThreads();
        fetchMetrics();
    }, [user, authLoading]);

    // --- Products CRUD ---
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/products');
            if (!res.ok) throw new Error('OFFLINE');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.log('Local CMS server is offline. (Safe to ignore on Production)');
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
            if (res.ok) {
                const data = await res.json();
                setPrompts(data);
            }
        } catch (err) {}
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
            if (res.ok) {
                const data = await res.json();
                setBlogPosts(data);
            }
        } catch (err) {}
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
            if (res.ok) {
                const data = await res.json();
                setCareers(data);
            }
        } catch (err) {}
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
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (err) {}
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
 
    // --- Credit Management CRUD ---
    const fetchTopupRequests = async () => {
        const { data, error } = await supabase
            .from('topup_requests')
            .select(`
                *,
                profiles:user_id ( full_name, credits )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        
        if (error) console.error('Error fetching topups:', error);
        else setTopupRequests(data);
    };
 
    const handleApproveTopup = async (reqId) => {
        setStatus('Processing Approval...');
        const { error } = await supabase.rpc('approve_topup', { req_id: reqId });
        
        if (error) {
            setStatus('Error: ' + error.message);
        } else {
            setStatus('Credit Top-up Approved!');
            fetchTopupRequests();
        }
    };
 
    const handleRejectTopup = async (reqId) => {
        setStatus('Processing Rejection...');
        const { error } = await supabase.rpc('reject_topup', { req_id: reqId });
        
        if (error) {
            setStatus('Error: ' + error.message);
        } else {
            setStatus('Request Rejected.');
            fetchTopupRequests();
        }
    };
 
    // --- Phase 6: God Mode CRUD ---
    const fetchAllUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('credits', { ascending: false });
        if (data) setAllUsers(data);
    };
 
    const fetchAllThreads = async () => {
        const { data, error } = await supabase
            .from('community_archive')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setAllThreads(data);
    };
 
    const fetchMetrics = async () => {
        const { count: userCount } = await supabase.from('profiles', { count: 'exact', head: true }).select('*');
        const { count: threadCount } = await supabase.from('community_archive', { count: 'exact', head: true }).select('*');
        const { data: creditData } = await supabase.from('profiles').select('credits');
        const totalCredits = creditData?.reduce((acc, curr) => acc + (curr.credits || 0), 0) || 0;
        
        setMetrics({ users: userCount, threads: threadCount, totalCredits });
    };
 
    const handleAdjustCredits = async (userId, amount, reason) => {
        const { error } = await supabase.rpc('admin_adjust_credits', { 
            target_user_id: userId, 
            adjustment_amount: amount,
            adj_reason: reason
        });
        if (!error) {
            setStatus(`Adjusted balance for user.`);
            fetchAllUsers();
            fetchMetrics();
        } else {
            setStatus('Credit Adjustment Failed: ' + error.message);
        }
    };
 
    const handleTogglePro = async (userId, proStatus) => {
        const { error } = await supabase.rpc('admin_toggle_pro', { 
            target_user_id: userId, 
            pro_status: proStatus 
        });
        if (!error) {
            setStatus(`User Pro-status updated.`);
            fetchAllUsers();
        }
    };
 
    const handleAdminDeleteThread = async (id) => {
        if (!window.confirm('GOD_MODE_DELETE: Permanent termination?')) return;
        const { error } = await supabase.from('community_archive').delete().eq('id', id);
        if (!error) {
            setStatus('Thread Terminated.');
            fetchAllThreads();
            fetchMetrics();
        }
    };
 
    const handlePinVerify = async (e) => {
        e.preventDefault();
        setStatus('VERIFYING_PROTOCOL...');
        
        const { data: isValid, error } = await supabase.rpc('verify_admin_pin', { 
            input_pin: adminPin 
        });

        if (error) {
            setStatus('ACCESS_DENIED: Protocol Error (' + error.message + ')');
        } else if (isValid) {
            setIsPinAuthorized(true);
            sessionStorage.setItem('ADMIN_AUTH_L5', 'granted');
            setStatus('Level 5 Clearance Granted.');
        } else {
            setStatus('ACCESS_DENIED: Invalid PIN Syntax.');
            setAdminPin('');
        }
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
                    <button onClick={() => setActiveTab('credits')} style={tabStyle('credits')}>CREDITS</button>
                    <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>USERS</button>
                    <button onClick={() => setActiveTab('moderation')} style={tabStyle('moderation')}>MOD</button>
                    <button onClick={() => setActiveTab('metrics')} style={tabStyle('metrics')}>STATS</button>
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
 
                {/* ===== CREDITS TAB ===== */}
                {activeTab === 'credits' && (
                    <>
                        <div style={sectionBox}>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                PENDING_TOPUP_REQUESTS
                                <button onClick={fetchTopupRequests} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.7rem' }}>[REFRESH]</button>
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {topupRequests.length > 0 ? topupRequests.map(req => (
                                    <div key={req.id} style={{ 
                                        padding: '1.5rem', 
                                        border: '1px solid var(--color-border)', 
                                        backgroundColor: '#111', 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 900, marginBottom: '0.3rem' }}>
                                                {req.profiles?.full_name || 'USER_ID: ' + req.user_id.slice(0, 8)} 
                                                <span style={{ color: 'var(--color-accent)', marginLeft: '1rem' }}>+{req.amount} CR</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                TX_ID: <span style={{ color: '#fff' }}>{req.transaction_id}</span> | 
                                                DATE: {new Date(req.created_at).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.3rem' }}>
                                                CURRENT_BALANCE: {req.profiles?.credits || 0} CR
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleApproveTopup(req.id)}
                                                style={{ ...buttonStyle, padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                                            >
                                                APPROVE
                                            </button>
                                            <button 
                                                onClick={() => handleRejectTopup(req.id)}
                                                style={{ ...buttonStyle, backgroundColor: '#333', color: '#ff4444', padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.3 }}>NO_PENDING_REQUESTS</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
 
                {/* ===== USERS TAB (PHASE 6) ===== */}
                {activeTab === 'users' && (
                    <div style={sectionBox}>
                        <h2 style={{ marginBottom: '1.5rem' }}>USER_CONTROL_HUB</h2>
                        <input 
                            placeholder="SEARCH_BY_EMAIL_OR_NAME" 
                            value={userSearch} 
                            onChange={e => setUserSearch(e.target.value)} 
                            style={{ ...inputStyle, marginBottom: '1.5rem' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {allUsers
                                .filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()))
                                .map(u => (
                                <div key={u.id} style={{ padding: '1.5rem', border: '1px solid var(--color-border)', backgroundColor: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, marginBottom: '0.2rem' }}>
                                            {u.full_name || 'NO_NAME'} {u.is_pro && <span style={{ color: 'var(--color-accent)', fontSize: '0.6rem' }}>[PRO]</span>}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{u.email}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.5rem' }}>BALANCE: {u.credits || 0} CR</div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end', maxWidth: '300px' }}>
                                        <button onClick={() => handleAdjustCredits(u.id, 50, 'ADMIN_GRANT')} style={{ ...buttonStyle, padding: '0.5rem', fontSize: '0.6rem' }}>+50 CR</button>
                                        <button onClick={() => handleAdjustCredits(u.id, -50, 'ADMIN_REVOKE')} style={{ ...buttonStyle, backgroundColor: '#333', color: '#fff', padding: '0.5rem', fontSize: '0.6rem' }}>-50 CR</button>
                                        <button onClick={() => handleTogglePro(u.id, !u.is_pro)} style={{ ...buttonStyle, backgroundColor: u.is_pro ? '#ff4444' : 'var(--color-accent)', padding: '0.5rem', fontSize: '0.6rem' }}>
                                            {u.is_pro ? 'STRIP_PRO' : 'GRANT_PRO'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
 
                {/* ===== MODERATION TAB (PHASE 6) ===== */}
                {activeTab === 'moderation' && (
                    <div style={sectionBox}>
                        <h2 style={{ marginBottom: '1.5rem' }}>GLOBAL_MODERATION</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {allThreads.map(thread => (
                                <div key={thread.id} style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{thread.title}</div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>BY: {thread.user_name} | {new Date(thread.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleAdminDeleteThread(thread.id)}
                                        style={{ ...buttonStyle, backgroundColor: '#333', color: '#ff4444', padding: '0.5rem 1rem', fontSize: '0.65rem' }}
                                    >
                                        GOD_DELETE
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
 
                {/* ===== METRICS TAB (PHASE 6) ===== */}
                {activeTab === 'metrics' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={sectionBox}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>USER_BASE_SYNC</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{metrics.users}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>TOTAL_REGISTERED_OPERATIVES</div>
                        </div>
                        <div style={sectionBox}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>INTELLIGENCE_VOLUME</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{metrics.threads}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>TOTAL_COMMUNITY_THREADS</div>
                        </div>
                        <div style={sectionBox}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>CREDIT_CIRCULATION</div>
                            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{metrics.totalCredits}</div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>TOTAL_ACTIVE_COMPUTE_POWER</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;

