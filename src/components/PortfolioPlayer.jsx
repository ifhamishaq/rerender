import React, { useState } from 'react';

const PortfolioPlayer = ({ videoId, videoUrl, title, client, id, minimal = false, aspectRatio = "16/9" }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // YouTube Handling
    const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1` : null;

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            backgroundColor: '#000', 
            aspectRatio: aspectRatio,
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease'
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
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.2s ease'
                    }}
                    title={title}
                    onLoad={() => setIsLoaded(true)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : null}
            
            {/* Minimal Source Label */}
            <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                padding: '2px 6px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                zIndex: 10,
                border: '1px solid var(--color-border)',
                pointerEvents: 'none'
            }}>
                ID_{id?.toUpperCase() || 'REF'}
            </div>

            <style>{`
                @keyframes spin_simple { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PortfolioPlayer;
