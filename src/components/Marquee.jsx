import React from 'react';

const Marquee = () => {
    return (
        <div style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            padding: '1rem 0',
            borderBottom: '1px solid var(--color-text)',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="marquee-content" style={{
                display: 'inline-block',
                animation: 'marquee 20s linear infinite',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                textTransform: 'uppercase'
            }}>
                <span style={{ margin: '0 2rem' }}>USED BY TOP CREATORS</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>FEATURED IN HYPEBEAST</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>5000+ DOWNLOADS</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>RATED 5/5 STARS</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>NEW PACKS MONTHLY</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                {/* Duplicate for seamless loop */}
                <span style={{ margin: '0 2rem' }}>USED BY TOP CREATORS</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>FEATURED IN HYPEBEAST</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>5000+ DOWNLOADS</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>RATED 5/5 STARS</span>
                <span style={{ margin: '0 2rem' }}>///</span>
                <span style={{ margin: '0 2rem' }}>NEW PACKS MONTHLY</span>
                <span style={{ margin: '0 2rem' }}>///</span>
            </div>
        </div>
    );
};

export default Marquee;
