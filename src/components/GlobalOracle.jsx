import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import OracleCore from './OracleCore';

const GlobalOracle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    
    // Hide Global Oracle on the main AI Agent page to avoid redundancy
    const isMainOraclePage = location.pathname === '/lab/ai-agent';
    
    // Get human-readable context from path
    const getPageContext = () => {
        const path = location.pathname.substring(1);
        if (!path) return 'Home';
        return path.split('/').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (isMainOraclePage) return null;

    return (
        <>
            {/* Floating FAB */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    width: '60px', height: '60px', borderRadius: '2px',
                    backgroundColor: 'var(--color-accent)', color: '#000',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 9999, border: 'none'
                }}
            >
                <Sparkles size={24} />
                
                {/* Visual Label (Tooltip style) */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    style={{
                        position: 'absolute', right: '70px', backgroundColor: '#000',
                        color: 'var(--color-accent)', padding: '0.5rem 1rem',
                        fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--color-accent)', whiteSpace: 'nowrap',
                        pointerEvents: 'none', fontWeight: 900, textTransform: 'uppercase'
                    }}
                >
                    Oracle Directive
                </motion.div>
            </motion.button>

            {/* AI Drawer Container */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            position: 'fixed', bottom: '2rem', right: '2rem',
                            width: 'clamp(320px, 25vw, 450px)', height: 'clamp(500px, 70vh, 750px)',
                            backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            zIndex: 10000, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                        }}
                    >
                        <OracleCore 
                            mode="global" 
                            context={getPageContext()} 
                            onClose={() => setIsOpen(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalOracle;
