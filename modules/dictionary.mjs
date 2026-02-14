// Use backend proxy instead of direct API calls
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://language-learning-companion-snowy.vercel.app/api';

function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

function cleanText(text) {
    if (!text) return "";
    return String(text)
        .replace(/{[^}]*}/g, '') // Remove all {code} markup
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
}

export function normalizeDictionaryResult(apiJson) {
    console.log('[Dictionary] Raw API response:', JSON.stringify(apiJson).substring(0, 500));
    
    const entry = safeArray(apiJson)[0] || {};

    if (typeof entry === 'string') {
        throw new Error(`Word not found. Did you mean: ${apiJson.slice(0, 5).join(', ')}?`);
    }

    const word = entry.meta?.id?.split(':')[0] || entry.hwi?.hw?.replace(/\*/g, '') || "";

    const phonetic = entry.hwi?.prs?.[0]?.mw || entry.hwi?.prs?.[0]?.ipa || "";

    const audioData = entry.hwi?.prs?.[0]?.sound?.audio;
    let audioUrl = "";
    if (audioData) {
        const subdir = audioData.startsWith('bix') ? 'bix' :
            audioData.startsWith('gg') ? 'gg' :
                audioData.match(/^[0-9]/) ? 'number' :
                    audioData[0];
        audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioData}.mp3`;
    }

    const allDefinitions = entry.shortdef || [];
    const partOfSpeech = entry.fl || "";
    const rawEtymology = entry.et?.[0]?.[1] || "";
    const rawDate = entry.date || "";
    const labels = entry.lbs || [];
    const variants = entry.vrs?.map(v => cleanText(v.va || v.vl)).filter(Boolean) || [];

    const examples = [];
    // Collect examples from all definition sections and all senses
    const allDefs = safeArray(entry.def);
    console.log(`[Dictionary] Found ${allDefs.length} definition sections for "${word}"`);
    
    for (const defSection of allDefs) {
        if (defSection.sseq) {
            for (const sense of defSection.sseq) {
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
    }

    console.log(`[Dictionary] Found ${examples.length} examples in main entry for "${word}"`);

    // Also check other entries for the same word
    const allEntries = safeArray(apiJson);
    for (let i = 1; i < allEntries.length; i++) {
        const otherEntry = allEntries[i];
        if (typeof otherEntry === 'string') continue;

        const otherWord = otherEntry.meta?.id?.split(':')[0] || otherEntry.hwi?.hw?.replace(/\*/g, '') || "";
        if (otherWord.toLowerCase() === word.toLowerCase()) {
            const otherDefs = safeArray(otherEntry.def);
            for (const defSection of otherDefs) {
                if (defSection.sseq) {
                    for (const sense of defSection.sseq) {
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
            }
        }
    }

    console.log(`[Dictionary] Total examples found for "${word}": ${examples.length}`);

    const usageNotes = [];
    // Collect usage notes from all definition sections (reuse allDefs from above)
    for (const defSection of allDefs) {
        if (defSection.sseq) {
            for (const sense of defSection.sseq) {
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
        examples: examples.slice(0, 12),
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