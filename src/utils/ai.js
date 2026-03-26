/**
 * AI Utility for RE-RENDER
 * Handles multi-key rotation, exponential backoff, and 429 error resilience.
 */

const getApiKeys = () => {
    const keysStr = import.meta.env.VITE_OPENROUTER_API_KEYS || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    return keysStr.split(',').map(k => k.trim()).filter(Boolean);
};

let currentKeyIndex = 0;

/**
 * Robust fetch wrapper for OpenRouter API
 * @param {Object} options - Standard fetch options + custom ones
 * @param {number} retries - Number of retries allowed
 * @param {number} delay - Initial delay for backoff (ms)
 */
export const fetchOpenRouter = async (body, options = {}, retries = 3, delay = 1000) => {
    const keys = getApiKeys();
    if (keys.length === 0) {
        throw new Error('MISSING_API_KEYS: Configure VITE_OPENROUTER_API_KEYS in environment.');
    }

    const key = keys[currentKeyIndex % keys.length];
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': 'https://re-render.netlify.app', // Update with actual domain
                'X-Title': options.title || 'RE-RENDER AI Suite',
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(body)
        });

        // Handle Rate Limiting (429)
        if (response.status === 429) {
            console.warn(`[AI_ROTATE] Key ${currentKeyIndex % keys.length} rate limited. Rotating...`);
            currentKeyIndex++; // Rotate key
            
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delay));
                return fetchOpenRouter(body, options, retries - 1, delay * 2);
            }
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP_${response.status}`);
        }

        return await response.json();
    } catch (err) {
        if (retries > 0) {
            console.warn(`[AI_RETRY] Attempt failed: ${err.message}. Retrying...`);
            return fetchOpenRouter(body, options, retries - 1, delay * 2);
        }
        throw err;
    }
};
