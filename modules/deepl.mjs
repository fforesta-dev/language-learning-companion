const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://language-learning-companion-snowy.vercel.app/api';

export async function translateText({ text, source, target }) {
    const q = (text || "").trim();
    if (!q) return "";

    try {
        const res = await fetch(`${BACKEND_URL}/translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: q,
                source_lang: source,
                target_lang: target,
            }),
        });

        if (!res.ok) {
            const msg = await safeErrorMessage(res);
            throw new Error(msg || `Translate failed (${res.status})`);
        }

        const data = await res.json();
        return data?.translations?.[0]?.text ?? "";
    } catch (err) {
        throw new Error(`Translation failed: ${err.message}`);
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
