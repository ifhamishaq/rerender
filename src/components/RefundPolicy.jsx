import React from 'react';

const RefundPolicy = () => {
    return (
        <div style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-mono)' }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase' }}>Refund Policy</h1>

            <p style={{ marginBottom: '1rem' }}>Last updated: February 16, 2026</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>01. NO REFUNDS</h2>
                <p>Due to the immediate access nature of digital downloads, we generally do not offer refunds once a purchase is completed.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>02. EXCEPTIONS</h2>
                <p>If a file is corrupted or proven defective, we will provide a replacement. Contact support with your order ID.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>03. CONTACT</h2>
                <p>For any issues, reach out to real.re.render@gmail.com.</p>
            </section>

            <a href="/" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>&larr; BACK TO REALITY</a>
        </div>
    );
};

export default RefundPolicy;
