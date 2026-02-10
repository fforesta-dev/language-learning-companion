/**
 * Serverless function to proxy Merriam-Webster Dictionary API
 * Keeps API key secret on the server
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { word } = req.query;

    if (!word) {
        return res.status(400).json({ error: 'Word parameter is required' });
    }

    const API_KEY = process.env.MERRIAM_WEBSTER_DICTIONARY_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({
                error: `Dictionary API error (${response.status}): ${text.slice(0, 100)}`,
            });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
