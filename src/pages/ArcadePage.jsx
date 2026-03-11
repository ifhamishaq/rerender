import React, { useEffect, useRef } from 'react';
import TheArcade from '../components/TheArcade';
const ArcadePage = () => {
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
            if (bgAudio && wasPlaying) bgAudio.play().catch(() => { });
        };
    }, []);

    return (
        <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <TheArcade />
        </main>
    );
};

export default ArcadePage;
