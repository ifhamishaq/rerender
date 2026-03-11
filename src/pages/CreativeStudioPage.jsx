import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CreativeStudio from '../components/CreativeStudio';

const RED = '#E8111A';

const CreativeStudioPage = () => {
    const arcadeAudioRef = useRef(null);

    useEffect(() => {
        // Pause main site music
        const bgAudio = document.getElementById('bg-audio');
        const wasPlaying = bgAudio && !bgAudio.paused;
        if (bgAudio) bgAudio.pause();

        // Play arcade music
        const arcadeAudio = new Audio('/game.mp3');
        arcadeAudio.loop = true;
        arcadeAudio.volume = 0.4;
        arcadeAudio.play().catch(() => { });
        arcadeAudioRef.current = arcadeAudio;

        return () => {
            arcadeAudio.pause();
            arcadeAudio.src = '';
            // Only resume if going back to a non-arcade page, but App.jsx audio handles it or Navbar routing...
            // Actually, if we go back to Arcade, ArcadePage will start its own track, so pausing this one is fine.
            if (bgAudio && wasPlaying) bgAudio.play().catch(() => { });
        };
    }, []);

    return (
        <main style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2rem' }}>
                <Link to="/arcade" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.1em', color: RED, textDecoration: 'none',
                    textTransform: 'uppercase', marginBottom: '1rem',
                    transition: 'opacity 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                    ← BACK TO ARCADE
                </Link>
            </div>

            <CreativeStudio />
        </main>
    );
};

export default CreativeStudioPage;
