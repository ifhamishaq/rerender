import React from 'react';

const LicenseAgreement = () => {
    return (
        <div style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-mono)' }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase' }}>License Agreement</h1>

            <p style={{ marginBottom: '1rem' }}>Last updated: February 16, 2026</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>01. GRANT OF LICENSE</h2>
                <p>RE-RENDER grants you a non-exclusive, non-transferable license to use the purchased assets for personal and commercial projects.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>02. RESTRICTIONS</h2>
                <p>You may not resell, redistribute, or repackage the assets as standalone products. They must be incorporated into a larger work (e.g., video, design, game).</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>03. OWNERSHIP</h2>
                <p>RE-RENDER retains all ownership and intellectual property rights to the assets.</p>
            </section>

            <a href="/" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>&larr; BACK TO REALITY</a>
        </div>
    );
};

export default LicenseAgreement;
