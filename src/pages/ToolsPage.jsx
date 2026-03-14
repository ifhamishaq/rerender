import React, { useEffect } from 'react';
import ToolsSection from '../components/ToolsSection';

const ToolsPage = () => {
    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingTop: 'var(--nav-height)' }}>
            <ToolsSection />
        </main>
    );
};

export default ToolsPage;
