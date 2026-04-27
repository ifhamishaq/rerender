/**
 * AI Utility for RE-RENDER
 * Handles multi-key rotation, exponential backoff, and 429 error resilience.
 */

export const AI_COSTS = {
    ORACLE: 0,
    ANALYSER: 5,
    CAPTION: 1,
    GEN_IMAGE: 10
};

const getApiKeys = () => {
    // Collect all potential key sources
    const pluralKeys = import.meta.env.VITE_OPENROUTER_API_KEYS || '';
    const singularKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    
    // Split comma-separated lists and merge
    let keys = [
        ...pluralKeys.split(','),
        ...singularKey.split(',')
    ].map(k => k.trim()).filter(Boolean);

    // Add suffixed keys for individual account stacking
    const suffixed = [
        import.meta.env.VITE_OPENROUTER_API_KEY_1,
        import.meta.env.VITE_OPENROUTER_API_KEY_2,
        import.meta.env.VITE_OPENROUTER_API_KEY_3,
        import.meta.env.VITE_OPENROUTER_API_KEY_4
    ].filter(Boolean);

    return [...new Set([...keys, ...suffixed])];
};

let currentKeyIndex = 0;

/**
 * Robust JSON extraction from AI strings.
 */
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

export const fetchOpenRouter = async (body, options = {}, retries = 5, delay = 2000) => {
    const keys = getApiKeys();
    
    if (keys.length === 0) {
        console.error("AI_ERROR: No OpenRouter keys found in environment variables.");
        throw new Error('MISSING_API_KEYS');
    }

    // Pick key based on rotation index
    const key = keys[currentKeyIndex % keys.length];
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': 'https://re-render.netlify.app', 
                'X-Title': options.title || 'RE-RENDER AI Suite',
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(body)
        });

        // Handle Rate Limiting (429) - ROTATE KEY
        if (response.status === 429) {
            console.warn(`[AI_ROTATE] Key ${currentKeyIndex % keys.length} limited. Trying next...`);
            currentKeyIndex++; 
            
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delay * 2));
                return fetchOpenRouter(body, options, retries - 1, delay * 2);
            }
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errorMsg = errData.error?.message || `HTTP_${response.status}`;
            
            // Handle model congestion
            if (errorMsg.includes('overloaded') || errorMsg.includes('congested')) {
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return fetchOpenRouter(body, options, retries - 1, delay * 2);
                }
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (err) {
        if (retries > 0 && err.message !== 'MISSING_API_KEYS') {
            await new Promise(res => setTimeout(res, delay));
            return fetchOpenRouter(body, options, retries - 1, delay * 2);
        }
        throw err;
    }
};
