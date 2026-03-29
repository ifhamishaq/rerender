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
/**
 * Robust JSON extraction from AI strings.
 * Handles markdown blocks, trailing commas, and common AI comments.
 */
export const safeParseJSON = (text) => {
    if (!text) return null;
    
    // 1. Clean markdown code blocks
    let cleaned = text.replace(/```json|```/g, '').trim();
    
    // 2. Extract first logical JSON structure { ... } or [ ... ]
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    cleaned = jsonMatch[0];

    try {
        // Attempt standard parse
        return JSON.parse(cleaned);
    } catch (e) {
        // 3. Robust fix: Remove trailing commas
        cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
        
        // 4. Robust fix: Attempt to remove C-style comments
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        
        try {
            return JSON.parse(cleaned);
        } catch (innerErr) {
            console.error('[AI_JSON_PARSE_FATAL]:', innerErr, 'Text:', cleaned);
            throw innerErr;
        }
    }
};

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
                // Slower exponential backoff: 3s, 6s, 12s... for free models
                const backoffDelay = delay * (keys.length > 1 ? 1.5 : 3);
                await new Promise(res => setTimeout(res, backoffDelay));
                return fetchOpenRouter(body, options, retries - 1, backoffDelay);
            }
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errorMsg = errData.error?.message || `HTTP_${response.status}`;
            
            // Handle common OpenRouter errors
            if (errorMsg.includes('overloaded') || errorMsg.includes('congested')) {
                if (retries > 0) {
                    console.warn(`[AI_RETRY] Model congested. Waiting ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                    return fetchOpenRouter(body, options, retries - 1, delay * 2);
                }
            }
            
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (err) {
        if (retries > 0 && !err.message.includes('MISSING_API_KEYS')) {
            console.warn(`[AI_RETRY] Attempt failed: ${err.message}. Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return fetchOpenRouter(body, options, retries - 1, delay * 2);
        }
        throw err;
    }
};
