import React from 'react';
import Shop from '../components/Shop';

const ShopPage = () => {
    return (
        <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--color-text)' }}>
                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
                    margin: 0, 
                    lineHeight: 1,
                    textTransform: 'uppercase'
                }}>
                    DIGITAL <span style={{color: 'var(--color-accent)'}}>ASSETS</span>
                </h1>
                <p style={{ 
                    fontFamily: 'var(--font-mono)', 
                    color: '#666', 
                    marginTop: '1rem',
                    fontSize: '1rem'
                }}>
                    Premium tools for the modern creator.
                </p>
            </div>
            {/* The Shop component already has its own padding and layout, but we might need to hide its native h2 if we want this h1 to lead. For now, rendering it as is. */}
            <Shop />
        </main>
    );
};

export default ShopPage;
