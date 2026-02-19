import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <div style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-mono)' }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase' }}>Privacy Policy</h1>

            <p style={{ marginBottom: '1rem' }}>Last updated: February 16, 2026</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>01. DATA COLLECTION</h2>
                <p>We collect minimal data necessary to process transactions. Purchases are handled securely via Gumroad.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>02. USAGE</h2>
                <p>Your data is used solely for product delivery and critical updates. We do not sell your data into the void.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>03. COOKIES</h2>
                <p>We use essential cookies to ensure the shop functions correctly. No creepy tracking pixels.</p>
            </section>

            <a href="/" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>&larr; BACK TO REALITY</a>
        </div>
    );
};

export default PrivacyPolicy;
