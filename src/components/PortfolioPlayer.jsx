import React, { useState } from 'react';

const PortfolioPlayer = ({ videoId, videoUrl, title, client, id, minimal = false, aspectRatio = "16/9", onClose }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // YouTube Handling
    const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1` : null;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Mac Title Bar */}
            <div style={{
                height: '32px', // standard mac height
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                borderBottom: '1px solid var(--color-border)',
                gap: '8px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Traffic Lights */}
                <div 
                    onClick={onClose}
                    style={{ 
                        width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5F56', 
                        cursor: onClose ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} 
                />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                
                {/* Optional Domain / Title */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    pointerEvents: 'none',
                    opacity: 0.8
                }}>
                    {title || 're-render.agency'}
                </div>
            </div>

            {/* Video Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#000',
                aspectRatio: aspectRatio,
            }}>
            {/* Loading Spinner */}
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                    zIndex: 5
                }}>
                    <div style={{
                        width: '30px',
                        height: '30px',
                        border: '2px solid var(--color-accent)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin_simple 1s linear infinite'
                    }} />
                </div>
            )}

            {/* Direct Video (MP4) Support */}
            {videoUrl ? (
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsLoaded(true)}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        opacity: 1,
                        transition: 'opacity 0.3s ease',
                        willChange: 'transform',
                        transform: 'translateZ(0)'
                    }}
                />
            ) : embedUrl ? (
                /* YouTube Support */
                <iframe
                    src={embedUrl}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        border: 'none',
                        zIndex: 1,
                        opacity: 1,
                        transition: 'opacity 0.2s ease'
                    }}
                    title={title}
                    onLoad={() => setIsLoaded(true)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : null}
            
            </div>

            <style>{`
                @keyframes spin_simple { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PortfolioPlayer;
