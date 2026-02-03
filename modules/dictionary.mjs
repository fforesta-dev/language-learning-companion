// Use backend proxy instead of direct API calls
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://language-learning-companion-snowy.vercel.app/api';

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

// Clean Merriam-Webster markup codes
function cleanText(text) {
    if (!text) return "";
    return String(text)
        .replace(/{[^}]*}/g, '') // Remove all {code} markup
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
}

export function normalizeDictionaryResult(apiJson) {
    // apiJson is an array from Merriam-Webster
    const entry = safeArray(apiJson)[0] || {};

    // Handle case where API returns suggestions instead of definitions
    if (typeof entry === 'string') {
        throw new Error(`Word not found. Did you mean: ${apiJson.slice(0, 5).join(', ')}?`);
    }

    const word = entry.meta?.id?.split(':')[0] || entry.hwi?.hw?.replace(/\*/g, '') || "";

    // Get phonetic pronunciation
    const phonetic = entry.hwi?.prs?.[0]?.mw || entry.hwi?.prs?.[0]?.ipa || "";

    // Get audio file
    const audioData = entry.hwi?.prs?.[0]?.sound?.audio;
    let audioUrl = "";
    if (audioData) {
        // Merriam-Webster audio URL construction
        const subdir = audioData.startsWith('bix') ? 'bix' :
            audioData.startsWith('gg') ? 'gg' :
                audioData.match(/^[0-9]/) ? 'number' :
                    audioData[0];
        audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioData}.mp3`;
    }

    // Get ALL definitions
    const allDefinitions = entry.shortdef || [];
    const partOfSpeech = entry.fl || "";

    // Get etymology (word origin)
    const rawEtymology = entry.et?.[0]?.[1] || "";

    // Get date first used
    const rawDate = entry.date || "";

    // Get offensive/usage labels
    const labels = entry.lbs || [];

    // Get variant spellings
    const variants = entry.vrs?.map(v => cleanText(v.va || v.vl)).filter(Boolean) || [];

    // Get examples from definition text
    const examples = [];
    if (entry.def?.[0]?.sseq) {
        for (const sense of entry.def[0].sseq) {
            for (const item of sense) {
                if (item[0] === 'sense' && item[1]?.dt) {
                    for (const dtItem of item[1].dt) {
                        if (dtItem[0] === 'vis') {
                            for (const vis of dtItem[1]) {
                                if (vis.t) {
                                    examples.push(cleanText(vis.t));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Get usage notes and verbal illustrations
    const usageNotes = [];
    if (entry.def?.[0]?.sseq) {
        for (const sense of entry.def[0].sseq) {
            for (const item of sense) {
                if (item[0] === 'sense' && item[1]?.dt) {
                    for (const dtItem of item[1].dt) {
                        if (dtItem[0] === 'un' && Array.isArray(dtItem[1])) {
                            for (const un of dtItem[1]) {
                                if (un.text) {
                                    usageNotes.push(cleanText(un.text));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return {
        word,
        language: "en",
        phonetic,
        partOfSpeech,
        definition: allDefinitions[0] || "",
        allDefinitions,
        etymology: cleanText(rawEtymology),
        dateFirstUsed: cleanText(rawDate),
        labels,
        variants,
        examples: examples.slice(0, 8), // Show more examples
        usageNotes,
        audioUrl,
        fetchedAt: new Date().toISOString(),
    };
}

export async function getWordData(word) {
    const url = `${BACKEND_URL}/dictionary?word=${encodeURIComponent(word.trim())}`;
    const res = await fetch(url);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Dictionary request failed (${res.status}): ${text.slice(0, 120)}`);
    }

    const json = await res.json();
    return normalizeDictionaryResult(json);
}