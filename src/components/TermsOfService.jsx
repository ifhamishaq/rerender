import React from 'react';

const TermsOfService = () => {
    return (
        <div style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-mono)' }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase' }}>Terms of Service</h1>

            <p style={{ marginBottom: '1rem' }}>Last updated: February 16, 2026</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>01. LICENSE</h2>
                <p>Products are for personal and commercial use. You may not redistribute, resell, or claim them as your own.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>02. REFUNDS</h2>
                <p>Due to the digital nature of our assets, all sales are final. Contact support if you have issues.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>03. DISCLAIMER</h2>
                <p>RE-RENDER assets are provided "as is". We are not responsible for any system glitches, data loss, or reality shifts.</p>
            </section>

            <a href="/" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>&larr; BACK TO REALITY</a>
        </div>
    );
};

export default TermsOfService;
