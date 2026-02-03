/**
 * Favorites management module
 * Handles localStorage persistence of favorite words
 */

const FAVORITES_KEY = 'llc-favorites';

/**
 * Get all favorites from localStorage
 * @returns {Array<Object>} Array of favorite word objects
 */
export function getFavorites() {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Save a word to favorites
 * @param {Object} wordData - Word object with word, definition, phonetic, etc.
 * @returns {boolean} True if saved, false if already exists
 */
export function addFavorite(wordData) {
    const favorites = getFavorites();

    // Check if word already exists
    if (favorites.some((fav) => fav.word?.toLowerCase() === wordData.word?.toLowerCase())) {
        return false;
    }

    favorites.unshift({
        ...wordData,
        savedAt: new Date().toISOString(),
    });

    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    } catch {
        return false;
    }
}

/**
 * Remove a word from favorites
 * @param {string} word - Word to remove
 * @returns {boolean} True if removed
 */
export function removeFavorite(word) {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.word?.toLowerCase() !== word?.toLowerCase());

    if (filtered.length === favorites.length) {
        return false; // Word wasn't found
    }

    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if a word is in favorites
 * @param {string} word - Word to check
 * @returns {boolean} True if in favorites
 */
export function isFavorite(word) {
    const favorites = getFavorites();
    return favorites.some((fav) => fav.word?.toLowerCase() === word?.toLowerCase());
}

/**
 * Clear all favorites
 * @returns {boolean} True if cleared
 */
export function clearFavorites() {
    try {
        localStorage.removeItem(FAVORITES_KEY);
        return true;
    } catch {
        return false;
    }
}
