const BASE_URLS = [
    "https://translate.cutie.dating",
    // add another mirror later if needed
];

/**
 * Translate text using LibreTranslate.
 * @param {object} opts
 * @param {string} opts.text
 * @param {string} opts.source
 * @param {string} opts.target
 * @param {string} [opts.baseUrl]
 */
export async function translateText({ text, source, target, baseUrl }) {
    const q = (text || "").trim();
    if (!q) return "";

    const urlsToTry = baseUrl ? [baseUrl] : BASE_URLS;

    let lastErr;
    for (const url of urlsToTry) {
        try {
            const res = await fetch(`${url}/translate`, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ q, source, target, format: "text" }),
            });

            if (!res.ok) {
                const msg = await safeErrorMessage(res);
                throw new Error(msg || `Translate failed (${res.status})`);
            }

            const data = await res.json();
            return data?.translatedText ?? "";
        } catch (err) {
            lastErr = err;
        }
    }

    throw lastErr || new Error("Translate failed.");
}

async function safeErrorMessage(res) {
    try {
        const data = await res.json();
        return data?.error || data?.message || "";
    } catch {
        return "";
    }
}
