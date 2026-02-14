import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Load from local storage or default
    const [theme, setTheme] = useState(localStorage.getItem('holo-theme') || 'cyan');
    const [glassOpacity, setGlassOpacity] = useState(localStorage.getItem('holo-glass') || '0.1');
    const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('holo-motion') === 'true');

    // Theme Presets
    const themes = {
        cyan: { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee' },
        green: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
        red: { primary: '#ef4444', secondary: '#b91c1c', accent: '#f87171' },
        gold: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    };

    // Apply CSS Variables
    useEffect(() => {
        const root = document.documentElement;
        const colors = themes[theme] || themes.cyan;

        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--glass-opacity', glassOpacity);

        // Save to LS
        localStorage.setItem('holo-theme', theme);
        localStorage.setItem('holo-glass', glassOpacity);
        localStorage.setItem('holo-motion', reduceMotion);

    }, [theme, glassOpacity, reduceMotion]);

    return (
        <ThemeContext.Provider value={{
            theme, setTheme,
            glassOpacity, setGlassOpacity,
            reduceMotion, setReduceMotion,
            themes
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
