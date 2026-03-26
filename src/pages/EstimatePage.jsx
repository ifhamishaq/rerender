import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calculator, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import ProjectEstimator from '../components/ProjectEstimator';

const EstimatePage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
                
                {/* Back Nav */}
                <Link to="/tools" style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    color: 'var(--color-accent)', textDecoration: 'none', 
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', marginBottom: '3rem'
                }}>
                    <ArrowLeft size={16} />
                    <span>BACK_TO_LABS</span>
                </Link>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-accent)', marginBottom: '1rem' }}>
                            <Calculator size={20} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.3em', fontWeight: 900 }}>RE-RENDER_SYSTEMS // FIN_UNIT_03</span>
                        </div>
                        <h1 style={{ 
                            fontFamily: 'var(--font-display)', fontWeight: 900, 
                            fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.85, margin: 0,
                            textTransform: 'uppercase', letterSpacing: '-0.04em'
                        }}>
                            PROJECT<br />
                            <span style={{ color: 'var(--color-accent)' }}>ESTIMATOR.</span>
                        </h1>
                    </div>
                    <div style={{ maxWidth: '300px', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Calculate your investment in real-time. Select your service, style, and scale to get an instant projected quota. Lock it in to start your re-render.
                        </p>
                    </div>
                </div>

                {/* Estimator Interface */}
                <div style={{ marginBottom: '8rem' }}>
                    <ProjectEstimator />
                </div>

                {/* Features Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', marginBottom: '8rem', borderTop: '1px solid var(--color-border)', paddingTop: '4rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <ShieldCheck size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>PRECISE_CALCULATION</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>Our estimator uses historical project data to provide a realistic investment range based on your exact specifications.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <Zap size={24} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>INSTANT_LOCK-IN</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>Submitting the form locks in your estimated price for 14 days, ensuring transparency through the onboarding process.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default EstimatePage;
