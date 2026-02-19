import React, { useState, useEffect } from 'react';

const Admin = () => {
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
        type: 'PAID' // 'FREE' or 'PAID'
    });
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Security Check: Only allow on localhost
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            window.location.href = '/'; // Redirect to home if not local
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setStatus('Error fetching products. Is the admin-server running?');
        }
    };

    const handleUpload = async (e) => {
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
                setFormData(prev => ({ ...prev, image: result.url }));
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

        // If switching to free, force price to FREE
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
        setFormData({ ...product, type: product.price === 'FREE' ? 'FREE' : 'PAID' }); // Infer type if missing
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

    return (
        <div style={{ padding: '4rem 2rem', fontFamily: 'var(--font-mono)' }}>
            <h1>Admin Panel</h1>
            <p style={{ color: 'red' }}>{status}</p>

            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
                <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>

                    {/* Image Upload */}
                    <div style={{ border: '1px dashed #ccc', padding: '1rem' }}>
                        <label>Cover Image:</label>
                        <input type="file" onChange={handleUpload} style={{ marginTop: '0.5rem' }} />
                        {formData.image && <img src={formData.image} alt="Preview" style={{ width: '100px', marginTop: '1rem', display: 'block' }} />}
                    </div>

                    <input
                        placeholder="Title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ padding: '0.5rem' }}
                    />

                    {/* Type Selector */}
                    <select
                        value={formData.type}
                        onChange={handleTypeChange}
                        style={{ padding: '0.5rem' }}
                    >
                        <option value="PAID">PAID</option>
                        <option value="FREE">FREE</option>
                    </select>

                    <input
                        placeholder="Price"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        style={{ padding: '0.5rem' }}
                        disabled={formData.type === 'FREE'}
                    />
                    <input
                        type="color"
                        value={formData.color}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                        style={{ padding: '0.5rem', height: '40px' }}
                    />
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        style={{ padding: '0.5rem' }}
                    >
                        <option value="LUTS">LUTS</option>
                        <option value="GRADES">GRADES</option>
                        <option value="PRESETS">PRESETS</option>
                        <option value="EFFECTS">EFFECTS</option>
                        <option value="PACKS">PACKS</option>
                        <option value="TEXTURES">TEXTURES</option>
                    </select>
                    <input
                        placeholder="Download Link / URL"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        style={{ padding: '0.5rem' }}
                    />
                    <textarea
                        placeholder="Description"
                        value={formData.desc}
                        onChange={e => setFormData({ ...formData, desc: e.target.value })}
                        style={{ padding: '0.5rem' }}
                    />
                    <button
                        onClick={handleSave}
                        style={{ padding: '0.5rem', backgroundColor: 'var(--color-text)', color: 'white', cursor: 'pointer' }}
                    >
                        {editingId ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ title: '', price: '', color: '#000000', category: 'LUTS', link: '', desc: '', image: '', type: 'PAID' });
                            }}
                            style={{ padding: '0.5rem', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {products.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #eee', padding: '1rem' }}>
                        <div>
                            <strong>{p.title}</strong> ({p.price})
                            <br />
                            <small>{p.desc}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEdit(p)}>Edit</button>
                            <button onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;
