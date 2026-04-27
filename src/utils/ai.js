/**
 * AI Utility for RE-RENDER
 * Handles multi-model and multi-key rotation for maximum resilience.
 */

export const AI_COSTS = {
    ORACLE: 0,
    ANALYSER: 5,
    CAPTION: 1,
    GEN_IMAGE: 10
};

/**
 * Verified high-performance free models on OpenRouter (Updated April 2026)
 * Optimized order: Most reliable/high-RPM models first to minimize retry delays.
 */
const FREE_MODEL_POOL = [
    "google/gemini-flash-1.5-8b:free",       // Extremely High RPM, near-instant
    "nvidia/nemotron-3-super-120b-a12b:free", // Flagship Quality
    "google/gemma-4-31b-it:free",            // SOTA Instruct
    "openai/gpt-oss-120b:free",              // High Reasoning
    "tencent/hy3-preview:free",
    "minimax/minimax-m2.5:free"
];

const getApiKeys = () => {
    const keysStr = import.meta.env.VITE_OPENROUTER_API_KEYS || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    return keysStr.split(',').map(k => k.trim()).filter(Boolean);
};

let currentKeyIndex = 0;
let currentModelIndex = 0;

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

/**
 * Intelligent fetch for OpenRouter with automatic Model and Key rotation
 */
export const fetchOpenRouter = async (body, options = {}, retries = 5) => {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error('MISSING_API_KEYS');

    // Use current rotation indices
    const key = keys[currentKeyIndex % keys.length];
    
    // If the requested model is a 'free' model, we rotate through the pool
    const isFreeModel = body.model?.endsWith(':free');
    const modelToUse = isFreeModel ? FREE_MODEL_POOL[currentModelIndex % FREE_MODEL_POOL.length] : body.model;

    const requestBody = { ...body, model: modelToUse };

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': 'https://re-render.netlify.app', 
                'X-Title': 'RE-RENDER',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Handle Rate Limiting (429) or Congestion (503)
        if (response.status === 429 || response.status === 503) {
            console.warn(`[AI_ROTATE] Model/Key limited. Switching...`);
            
            // Advance indices immediately for the next try
            currentKeyIndex++;
            if (isFreeModel) currentModelIndex++;

            if (retries > 0) {
                // Shortened backoff for free models to improve UX speed
                const backoff = isFreeModel ? 800 : 2000; 
                await new Promise(r => setTimeout(r, backoff));
                return fetchOpenRouter(body, options, retries - 1);
            }
        }

        // Handle Bad Request (400) - Likely invalid Model ID
        if (response.status === 400) {
            const data = await response.json().catch(() => ({}));
            const msg = data.error?.message || '';
            if (msg.includes('not a valid model ID') || msg.includes('does not exist')) {
                console.error(`[AI_INVALID_MODEL] ${modelToUse} failed. Moving to next...`);
                if (isFreeModel && retries > 0) {
                    currentModelIndex++; 
                    return fetchOpenRouter(body, options, retries - 1);
                }
            }
            throw new Error(msg || 'Bad Request');
        }

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMsg = data.error?.message || `API Error ${response.status}`;
            
            if (errorMsg.includes('overloaded') || errorMsg.includes('congested')) {
                if (isFreeModel) currentModelIndex++;
                if (retries > 0) {
                    await new Promise(r => setTimeout(r, 1000));
                    return fetchOpenRouter(body, options, retries - 1);
                }
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (err) {
        if (retries > 0 && err.message !== 'MISSING_API_KEYS') {
            currentKeyIndex++;
            await new Promise(r => setTimeout(r, 1500));
            return fetchOpenRouter(body, options, retries - 1);
        }
        throw err;
    }
};
