const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://language-learning-companion-snowy.vercel.app/api';

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

export async function getThesaurusData(word) {
    const url = `${BACKEND_URL}/thesaurus?word=${encodeURIComponent(word.trim())}`;
    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Thesaurus request failed (${res.status}): ${text.slice(0, 120)}`);
    }

    const json = await res.json();
    return normalizeThesaurusResult(json);
}

export function normalizeThesaurusResult(apiJson) {
    const entry = safeArray(apiJson)[0] || {};

    if (typeof entry === 'string') {
        throw new Error(`Word not found. Did you mean: ${apiJson.slice(0, 5).join(', ')}?`);
    }

    const word = entry.meta?.id?.split(':')[0] || entry.hwi?.hw?.replace(/\*/g, '') || "";
    const partOfSpeech = entry.fl || "";

    const synonyms = new Set();
    const antonyms = new Set();

    if (entry.meta?.syns) {
        for (const synList of entry.meta.syns) {
            for (const syn of synList) {
                synonyms.add(syn);
            }
        }
    }

    if (entry.meta?.ants) {
        for (const antList of entry.meta.ants) {
            for (const ant of antList) {
                antonyms.add(ant);
            }
        }
    }

    const definition = entry.shortdef?.[0] || "";

    return {
        word,
        partOfSpeech,
        definition,
        synonyms: Array.from(synonyms).slice(0, 10),
        antonyms: Array.from(antonyms).slice(0, 10),
        fetchedAt: new Date().toISOString(),
    };
}
