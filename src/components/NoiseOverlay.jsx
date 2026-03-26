import React from 'react';

const NoiseOverlay = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9997,
            opacity: 0.04,
            /* High-performance noise texture */
            backgroundImage: `url("https://res.cloudinary.com/dn7v9rvda/image/upload/v1708034503/noise_v2_f8f6f1.png")`,
            backgroundRepeat: 'repeat',
            mixBlendMode: 'multiply',
            willChange: 'transform'
        }}></div>
    );
};

export default NoiseOverlay;
