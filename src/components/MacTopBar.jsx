import React, { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, Wifi, BatteryFull, Command } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MacTopBar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, signOut, setIsAuthModalOpen } = useAuth();
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
            top: 0,
            left: 0,
            right: 0,
            height: '28px', // macOS standard topbar height
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text)',
            zIndex: 9999,
            userSelect: 'none'
        }}>
            {/* Left Box: Logo + Menus */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                    <Command size={14} strokeWidth={2.5} />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', fontWeight: 600 }}>
                    {menuItems.map((item, idx) => (
                        <span key={item} style={{ 
                            cursor: 'default', 
                            opacity: 0.9,
                            fontWeight: idx === 0 ? 800 : 500 
                        }}>
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right Box: Status Icons + Auth + Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
                
                {/* Studio Status Badge */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    color: 'var(--color-accent)', 
                    backgroundColor: 'rgba(57, 255, 20, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(57, 255, 20, 0.1)'
                }} className="hide-mobile">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', animation: 'pulse 2s infinite' }}></span>
                    STUDIO_ONLINE
                </div>

                {/* Auth Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.9, fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                                {profile?.full_name?.split(' ')[0].toUpperCase() || 'PROFILE'}
                            </Link>
                            <div style={{ width: '1px', height: '12px', backgroundColor: 'var(--color-border)' }}></div>
                            <span 
                                onClick={signOut}
                                style={{ cursor: 'pointer', opacity: 0.4, fontSize: '10px', fontWeight: 600 }}
                            >
                                LOGOUT
                            </span>
                        </div>
                    ) : (
                        <span 
                            onClick={() => setIsAuthModalOpen(true)}
                            style={{ 
                                cursor: 'pointer', 
                                opacity: 0.9, 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                color: 'var(--color-accent)',
                                letterSpacing: '0.05em'
                            }}
                        >
                            LOGIN
                        </span>
                    )}
                </div>

                {/* Audio Toggle */}
                <div 
                    onClick={toggleAudio} 
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.7 }}
                    title={isPlaying ? "Pause Music" : "Play Music"}
                >
                    {isPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </div>

                {/* Theme Toggle */}
                <div 
                    onClick={toggleTheme} 
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.7 }}
                    title="Toggle Dark Mode"
                >
                    {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
                </div>

                {/* Wifi / Battery (Aesthetic) */}
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.6 }} className="hide-mobile">
                    <Wifi size={13} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }} className="hide-mobile">
                    <BatteryFull size={15} color="#34C759" />
                </div>

                {/* Clock */}
                <div style={{ 
                    cursor: 'default', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    marginLeft: '4px'
                }}>
                    {formattedTime}
                </div>
            </div>
        </div>
    );
};

export default MacTopBar;
