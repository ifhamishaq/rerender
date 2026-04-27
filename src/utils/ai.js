/**
 * AI Utility for RE-RENDER
 * Handles multi-key rotation and 429 error resilience.
 */

export const AI_COSTS = {
    ORACLE: 0,
    ANALYSER: 5,
    CAPTION: 1,
    GEN_IMAGE: 10
};

const getApiKeys = () => {
    const keysStr = import.meta.env.VITE_OPENROUTER_API_KEYS || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    return keysStr.split(',').map(k => k.trim()).filter(Boolean);
};

let currentKeyIndex = 0;

export const safeParseJSON = (text) => {
    if (!text) return null;
    let cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    cleaned = jsonMatch[0];
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        try {
            return JSON.parse(cleaned);
        } catch (innerErr) {
            console.error('[AI_JSON_PARSE_FATAL]:', innerErr);
            throw innerErr;
        }
    }
};

export const fetchOpenRouter = async (body, options = {}, retries = 5) => {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error('MISSING_API_KEYS');

    // Use current key
    const key = keys[currentKeyIndex % keys.length];
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': 'https://re-render.netlify.app', 
                'X-Title': 'RE-RENDER',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.status === 429) {
            console.warn("[AI] Rate limited. Rotating key...");
            currentKeyIndex++;
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 2000));
                return fetchOpenRouter(body, options, retries - 1);
            }
        }

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error?.message || `API Error ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        if (retries > 0 && err.message !== 'MISSING_API_KEYS') {
            await new Promise(r => setTimeout(r, 2000));
            return fetchOpenRouter(body, options, retries - 1);
        }
        throw err;
    }
};
