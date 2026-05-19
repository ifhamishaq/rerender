import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import OracleCore from './OracleCore';

const GlobalOracle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    
    // Hide on the main AI Agent page
    const isMainOraclePage = location.pathname === '/lab/ai-agent';
    
    const getPageContext = () => {
        const path = location.pathname.substring(1);
        if (!path) return 'Home';
        return path.split('/').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (isMainOraclePage) return null;

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                        width: '52px', height: '52px', borderRadius: '50%',
                        backgroundColor: 'var(--color-accent)', color: '#000',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 9999, border: 'none'
                    }}
                >
                    <Sparkles size={22} />
                </motion.button>
            )}

            {/* Chat Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed', inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                zIndex: 9999
                            }}
                        />
                        {/* Panel */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                position: 'fixed', 
                                bottom: '1.5rem', right: '1.5rem',
                                width: 'min(400px, calc(100vw - 2rem))', 
                                height: 'min(600px, calc(100vh - 6rem))',
                                backgroundColor: 'var(--color-bg)', 
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                                zIndex: 10000, 
                                overflow: 'hidden', 
                                display: 'flex', flexDirection: 'column'
                            }}
                        >
                            <OracleCore 
                                mode="global" 
                                context={getPageContext()} 
                                onClose={() => setIsOpen(false)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalOracle;
