import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import OracleCore from './OracleCore';

const GlobalOracle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    if (location.pathname === '/lab/ai-agent') return null;

    const getContext = () => {
        const p = location.pathname.substring(1);
        return p ? p.split('/').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Home';
    };

    return (
        <>
            {/* FAB */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            position: 'fixed', bottom: 20, right: 20,
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'var(--color-text)', color: 'var(--color-bg)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                            zIndex: 9999
                        }}
                    >
                        <MessageCircle size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setIsOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 9999 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.97 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'fixed',
                                bottom: 20, right: 20,
                                width: 'min(380px, calc(100vw - 32px))',
                                height: 'min(560px, calc(100vh - 80px))',
                                borderRadius: 20,
                                overflow: 'hidden',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                                zIndex: 10000,
                                display: 'flex', flexDirection: 'column'
                            }}
                        >
                            <OracleCore mode="global" context={getContext()} onClose={() => setIsOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalOracle;
