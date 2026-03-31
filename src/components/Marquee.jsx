import React from 'react';

const MarqueeRow = ({ items, direction = 'left', speed = 25 }) => {
    const content = items.join(' /// ');
    const doubled = `${content} /// ${content} /// ${content} /// `;
    
    return (
        <div style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div style={{
                display: 'inline-block',
                animation: `marquee ${speed}s linear infinite`,
                animationDirection: direction === 'right' ? 'reverse' : 'normal',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                {doubled}
            </div>
        </div>
    );
};

const Marquee = () => {
    const row1 = [
        'TRUSTED BY 50+ BRANDS',
        '100% CLIENT SATISFACTION',
        'BOOKED 3 MONTHS OUT',
        '0% REFUND RATE',
        'PREMIUM CREATIVE STUDIO'
    ];
    
    const row2 = [
        'WEBSITES THAT CONVERT',
        'CINEMATIC VIDEO PRODUCTION',
        '3D EXPERIENCES',
        'BRAND STRATEGY',
        'TOP-TIER DESIGN SYSTEMS'
    ];

    return (
        <div style={{
            backgroundColor: 'var(--color-accent)',
            color: '#000',
            overflow: 'hidden',
            padding: '0.6rem 0',
            borderBottom: '1px solid var(--color-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
        }}>
            <MarqueeRow items={row1} direction="left" speed={30} />
            <MarqueeRow items={row2} direction="right" speed={35} />
        </div>
    );
};

export default Marquee;
