import React, { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, Wifi, BatteryFull, Command, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MacTopBar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, profile, signOut, setIsAuthModalOpen } = useAuth();
    const [time, setTime] = useState(new Date());
    const [isPlaying, setIsPlaying] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sync with global audio
    useEffect(() => {
        const audio = document.getElementById('bg-audio');
        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            setIsPlaying(!audio.paused);
            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, []);

    const toggleAudio = () => {
        const audio = document.getElementById('bg-audio');
        if (audio) {
            if (isPlaying) audio.pause();
            else audio.play().catch(() => {});
        }
    };

    // Format time like macOS: "Tue Oct 24 9:41 AM"
    const formattedTime = time.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }) + '  ' + time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const menuItems = ["RE-RENDER", "Company", "Services", "Portfolio", "Contact"];

    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '48px',
            backgroundColor: isDarkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '100px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 8px 0 24px', // More padding on left for logo
            color: 'var(--color-text)',
            zIndex: 10000,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            width: 'fit-content',
            minWidth: 'min(95vw, 600px)',
            userSelect: 'none'
        }}>
            {/* Logo Link */}
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', paddingRight: '12px' }}>
                <Command size={16} className="mobile-only" strokeWidth={2.5} />
                <span className="desktop-only" style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '-0.03em', marginRight: '20px' }}>RE-RENDER</span>
            </Link>

            {/* Right Group: Auth + Controls + Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%' }}>
                
                {/* Auth Pill */}
                <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <Link to="/profile" style={{ 
                            textDecoration: 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '0 12px 0 4px',
                            height: '100%',
                            backgroundColor: 'rgba(57, 255, 20, 0.1)',
                            borderRadius: '20px',
                            border: '1px solid rgba(57, 255, 20, 0.2)',
                            color: 'var(--color-text)'
                        }}>
                            <div style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--color-accent)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#000'
                            }}>
                                <User size={15} strokeWidth={2.5} />
                            </div>
                            <span className="hide-mobile" style={{ fontSize: '10px', fontWeight: 800 }}>{profile?.full_name?.split(' ')[0].toUpperCase()}</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={() => setIsAuthModalOpen(true)}
                            style={{ 
                                background: 'var(--color-accent)',
                                color: '#000',
                                border: 'none',
                                padding: '0 16px',
                                borderRadius: '20px',
                                height: '100%',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <User size={13} strokeWidth={3} />
                            <span className="hide-mobile">LOGIN</span>
                        </button>
                    )}
                </div>

                {/* System Controls */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '0 12px',
                    borderLeft: '1px solid var(--color-border)',
                    opacity: 0.7
                }}>
                    <div onClick={toggleAudio} style={{ cursor: 'pointer', display: 'flex' }}>
                        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </div>
                    <div onClick={toggleTheme} style={{ cursor: 'pointer', display: 'flex' }}>
                        {isDarkMode ? <Moon size={15} /> : <Sun size={15} />}
                    </div>
                </div>

                {/* Clock Pill */}
                <div style={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    padding: '0 16px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums'
                }} className="hide-tablet">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default MacTopBar;
