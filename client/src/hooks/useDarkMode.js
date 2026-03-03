import { useEffect, useState } from 'react';

export default function useDarkMode() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                return storedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme];
}
