import React from 'react';
import { motion } from 'framer-motion';

import products from '../data/products.json';

import { useLocation } from 'react-router-dom';

const Shop = () => {
    const [filter, setFilter] = React.useState('ALL');
    const location = useLocation();

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filterParam = params.get('filter');
        if (filterParam) {
            setFilter(filterParam);
            // Force scroll to shop after a short delay to ensure rendering
            setTimeout(() => {
                const shopSection = document.getElementById('shop');
                if (shopSection) {
                    shopSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location]);

    const filteredProducts = filter === 'ALL'
        ? products
        : filter === 'FREE'
            ? products.filter(p => p.price === 'FREE')
            : filter === 'PAID'
                ? products.filter(p => p.price !== 'FREE')
                : products.filter(p => p.category === filter);

    // Get unique categories and add special filters
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    const categories = ['ALL', 'FREE', 'PAID', ...uniqueCategories];

    return (
        <section id="shop" style={{
            padding: '6rem 2rem',
            backgroundColor: '#f5f5f5',
        }}>
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
                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 6rem)',
                    textAlign: 'left',
                    margin: 0
                }}>
                    SHOP_ASSETS
                </h2>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.9rem',
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

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem',
            }}>
                {filteredProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}
                    >
                        {/* Product Image Placeholder */}
                        <motion.div
                            whileHover={{ scale: 0.98 }}
                            className="shop-item-image"
                            style={{
                                aspectRatio: '1',
                                backgroundColor: '#121212',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid var(--color-text)',
                                cursor: 'pointer',
                                // Filter handled via CSS class for better mobile support
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: product.image
                                    ? `url(${product.image})`
                                    : `linear-gradient(135deg, ${product.color} 25%, transparent 25%), linear-gradient(225deg, ${product.color} 25%, transparent 25%), linear-gradient(45deg, ${product.color} 25%, transparent 25%), linear-gradient(315deg, ${product.color} 25%, transparent 25%)`,
                                backgroundPosition: product.image ? 'center' : '10px 0, 10px 0, 0 0, 0 0',
                                backgroundSize: product.image ? 'cover' : '20px 20px',
                                backgroundRepeat: product.image ? 'no-repeat' : 'repeat',
                                opacity: product.image ? 1 : 0.2
                            }}></div>

                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-text)',
                                color: 'var(--color-bg)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {product.category}
                            </div>
                        </motion.div>

                        {/* Product Info */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-mono)',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{product.title}</h3>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{product.price}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{product.desc}</p>
                        </div>

                        {/* Buy Button */}
                        <motion.a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ backgroundPosition: '100% 0' }}
                            whileHover={{ backgroundPosition: '0 0' }}
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                padding: '1rem',
                                border: '1px solid var(--color-text)',
                                color: 'var(--color-text)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                background: `linear-gradient(to right, var(--color-accent) 50%, transparent 50%)`,
                                backgroundSize: '200% 100%',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 1 }}>{product.price === 'FREE' ? 'DOWNLOAD' : 'BUY NOW'}</span>
                        </motion.a>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Shop;
