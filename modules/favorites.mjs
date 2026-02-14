const FAVORITES_KEY = 'llc-favorites';

export function getFavorites() {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addFavorite(wordData) {
    const favorites = getFavorites();

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

export function removeFavorite(word) {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.word?.toLowerCase() !== word?.toLowerCase());

    if (filtered.length === favorites.length) {
        return false;
    }

    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
        return true;
    } catch {
        return false;
    }
}

export function isFavorite(word) {
    const favorites = getFavorites();
    return favorites.some((fav) => fav.word?.toLowerCase() === word?.toLowerCase());
}

export function clearFavorites() {
    try {
        localStorage.removeItem(FAVORITES_KEY);
        return true;
    } catch {
        return false;
    }
}
