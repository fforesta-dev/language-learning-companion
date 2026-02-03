/**
 * Serverless function to proxy DeepL Translation API
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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, source_lang, target_lang } = req.body;

    if (!text || !target_lang) {
        return res.status(400).json({ error: 'text and target_lang are required' });
    }

    const API_KEY = process.env.DEEPL_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const params = new URLSearchParams({
            auth_key: API_KEY,
            text,
            target_lang: target_lang.toUpperCase(),
        });

        if (source_lang && source_lang !== 'auto') {
            params.append('source_lang', source_lang.toUpperCase());
        }

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: errorData.message || `DeepL API error (${response.status})`,
            });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
