import { API_KEYS, API_ENDPOINTS } from './config.mjs';

/**
 * Translate text using DeepL API.
 * @param {object} opts
 * @param {string} opts.text - Text to translate
 * @param {string} opts.source - Source language code (e.g., 'EN', 'ES', 'FR') or 'auto' for auto-detect
 * @param {string} opts.target - Target language code (e.g., 'EN', 'ES', 'FR')
 */
export async function translateText({ text, source, target }) {
    const q = (text || "").trim();
    if (!q) return "";

    // DeepL uses uppercase language codes
    const sourceLang = source.toUpperCase();
    const targetLang = target.toUpperCase();

    // Build query parameters
    const params = new URLSearchParams({
        auth_key: API_KEYS.DEEPL,
        text: q,
        target_lang: targetLang,
    });

    // Only add source_lang if not auto-detect
    if (sourceLang !== 'AUTO') {
        params.append('source_lang', sourceLang);
    }

    try {
        const res = await fetch(`${API_ENDPOINTS.DEEPL}?${params}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!res.ok) {
            const msg = await safeErrorMessage(res);
            throw new Error(msg || `Translate failed (${res.status})`);
        }

        const data = await res.json();
        return data?.translations?.[0]?.text ?? "";
    } catch (err) {
        throw new Error(`DeepL translation failed: ${err.message}`);
    }
}

async function safeErrorMessage(res) {
    try {
        const data = await res.json();
        return data?.message || "";
    } catch {
        return "";
    }
}
