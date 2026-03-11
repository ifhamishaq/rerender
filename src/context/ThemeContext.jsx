import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        // Also check OS preference as a fallback
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = saved === 'dark' || (!saved && prefersDark);

        if (shouldBeDark) {
            document.body.classList.add('dark-mode');
            setIsDarkMode(true);
        } else {
            document.body.classList.remove('dark-mode');
            setIsDarkMode(false);
        }
    }, []);

    const toggleTheme = () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        document.body.classList.toggle('dark-mode', newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
