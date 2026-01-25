const BASE = "https://api.dictionaryapi.dev/api/v2/entries/en/";

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

export function normalizeDictionaryResult(apiJson) {
    // apiJson is an array
    const entry = safeArray(apiJson)[0] || {};
    const word = entry.word || "";

    const phonetic =
        entry.phonetic ||
        safeArray(entry.phonetics).find((p) => p?.text)?.text ||
        "";

    const audioUrl =
        safeArray(entry.phonetics).find((p) => p?.audio)?.audio || "";

    const meaning = safeArray(entry.meanings)[0] || {};
    const partOfSpeech = meaning.partOfSpeech || "";

    const defs = safeArray(meaning.definitions);
    const definition = defs[0]?.definition || "";
    const examples = defs
        .map((d) => d?.example)
        .filter(Boolean)
        .slice(0, 3);

    return {
        word,
        language: "en",
        phonetic,
        partOfSpeech,
        definition,
        examples,
        audioUrl,
        fetchedAt: new Date().toISOString(),
    };
}

export async function getWordData(word) {
    const url = `${BASE}${encodeURIComponent(word.trim())}`;
    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Dictionary request failed (${res.status}): ${text.slice(0, 120)}`);
    }

    const json = await res.json();
    return normalizeDictionaryResult(json);
}