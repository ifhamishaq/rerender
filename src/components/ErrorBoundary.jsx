import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ERROR_BOUNDARY]:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    backgroundColor: '#0A0A0A',
                    color: '#EEEEEE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Space Grotesk", sans-serif'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{
                            fontSize: '0.7rem',
                            fontFamily: '"Space Mono", monospace',
                            color: '#E8111A',
                            letterSpacing: '0.3em',
                            marginBottom: '2rem',
                            fontWeight: 900
                        }}>
                            SYSTEM_FAULT_DETECTED
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 6vw, 4rem)',
                            fontWeight: 900,
                            margin: '0 0 1.5rem 0',
                            lineHeight: 0.9
                        }}>
                            RUNTIME<br />
                            <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 400, color: '#39FF14' }}>
                                ERROR
                            </span>
                        </h1>
                        <p style={{
                            fontSize: '0.85rem',
                            opacity: 0.5,
                            lineHeight: 1.6,
                            marginBottom: '3rem',
                            fontFamily: '"Space Mono", monospace'
                        }}>
                            A component crashed. This has been logged.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '1rem 2.5rem',
                                backgroundColor: '#EEEEEE',
                                color: '#0A0A0A',
                                border: 'none',
                                fontFamily: '"Space Mono", monospace',
                                fontSize: '0.8rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                letterSpacing: '0.1em'
                            }}
                        >
                            [ RELOAD_SYSTEM ]
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
