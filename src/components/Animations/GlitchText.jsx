import React, { useState, useEffect } from 'react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const GlitchText = ({ text, speed = 40, delay = 0 }) => {
    const [displayValue, setDisplayValue] = useState(text);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!isHovered) {
             setDisplayValue(text);
             return;
        }

        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayValue(prev => 
                text.split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 4; // Slower iteration for better performance
        }, 60); // Reduced frequency from 40 to 60 for better framerates

        return () => clearInterval(interval);
    }, [isHovered, text, speed]);

    return (
        <span 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'default' }}
        >
            {displayValue}
        </span>
    );
};

export default GlitchText;
