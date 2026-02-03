// Theme management module
const THEME_STORAGE_KEY = 'llc-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

export function initTheme() {
    // Check localStorage for saved preference, otherwise check system preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? THEME_DARK : THEME_LIGHT);
    
    setTheme(initialTheme);
}

export function setTheme(theme) {
    if (theme === THEME_DARK) {
        document.documentElement.setAttribute('data-theme', THEME_DARK);
        localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(THEME_STORAGE_KEY, THEME_LIGHT);
    }
}

export function toggleTheme() {
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || THEME_LIGHT;
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(newTheme);
    return newTheme;
}

export function getCurrentTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || THEME_LIGHT;
}
