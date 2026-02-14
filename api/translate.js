// backend proxy for the translate API

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
    }

    const { text, source_lang, target_lang } = body;

    if (!text || !target_lang) {
        return res.status(400).json({ error: 'text and target_lang are required' });
    }

    const API_KEY = process.env.DEEPL_API_KEY;
    if (!API_KEY) {
        console.error('DEEPL_API_KEY environment variable is not set');
        return res.status(500).json({ error: 'Server configuration error: API key not configured' });
    }

    try {
        let body = {
            text: [text],
            target_lang: target_lang.toUpperCase(),
        };

        if (source_lang && source_lang !== 'auto') {
            body.source_lang = source_lang.toUpperCase();
        }

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: await response.text() };
            }
            console.error(`DeepL API error (${response.status}):`, errorData);
            return res.status(response.status).json({
                error: `DeepL API error (${response.status}): ${errorData.message || JSON.stringify(errorData)}`,
            });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Translation error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ error: error.message || 'Translation failed' });
    }
}
