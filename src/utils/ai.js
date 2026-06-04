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
 * Verified high-performance free models on OpenRouter (Updated May 2026)
 * Ordered by reliability (token volume) — general-purpose models preferred.
 */
const FREE_MODEL_POOL = [
    "nvidia/nemotron-3-super-120b-a12b:free", // 629B tokens — #1 most used free model
    "deepseek/deepseek-v4-flash:free",        // 62B tokens — fast, 1M context, strong reasoning
    "openai/gpt-oss-120b:free",               // 138B tokens — high reasoning, tool use
    "z-ai/glm-4.5-air:free",                  // 82B tokens — good general purpose
    "minimax/minimax-m2.5:free",              // 44B tokens — proven stable
    "arcee-ai/trinity-large-thinking:free",   // 40B tokens — strong reasoning
    "openai/gpt-oss-20b:free",               // 31B tokens — lightweight fast fallback
    "nvidia/nemotron-3-nano-30b-a3b:free"    // 34B tokens — efficient last-resort
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
            console.error('[AI] JSON parse failed');
            throw innerErr;
        }
    }
};

/**
 * Intelligent fetch for OpenRouter with automatic Model and Key rotation.
 * options.onStatus(msg) — optional callback for status updates
 */
export const fetchOpenRouter = async (body, options = {}, retries = 8) => {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error('No API keys configured.');

    const key = keys[currentKeyIndex % keys.length];
    
    const isFreeModel = body.model?.endsWith(':free') || body.model === 'openrouter/free';
    const modelToUse = isFreeModel ? 'openrouter/free' : body.model;

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
            currentKeyIndex++;
            if (isFreeModel) currentModelIndex++;

            if (retries > 0) {
                if (options.onStatus) options.onStatus('Finding the best AI model...');
                const backoff = isFreeModel ? 1200 : 2500; 
                await new Promise(r => setTimeout(r, backoff));
                return fetchOpenRouter(body, options, retries - 1);
            }
        }

        // Handle Bad Request (400) or Not Found (404) - invalid/deprecated Model ID
        if (response.status === 400 || response.status === 404) {
            const data = await response.json().catch(() => ({}));
            const msg = data.error?.message || '';
            if (msg.includes('not a valid model ID') || msg.includes('does not exist') || msg.includes('No endpoints found')) {
                if (isFreeModel && retries > 0) {
                    currentModelIndex++; 
                    if (options.onStatus) options.onStatus('Switching AI model...');
                    return fetchOpenRouter(body, options, retries - 1);
                }
            }
            throw new Error(msg || `Error ${response.status}`);
        }

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMsg = data.error?.message || `API Error ${response.status}`;
            
            if (errorMsg.includes('overloaded') || errorMsg.includes('congested')) {
                if (isFreeModel) currentModelIndex++;
                if (retries > 0) {
                    if (options.onStatus) options.onStatus('Almost there...');
                    await new Promise(r => setTimeout(r, 1500));
                    return fetchOpenRouter(body, options, retries - 1);
                }
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (err) {
        if (retries > 0 && err.message !== 'No API keys configured.') {
            currentKeyIndex++;
            if (options.onStatus) options.onStatus('Retrying...');
            await new Promise(r => setTimeout(r, 1800));
            return fetchOpenRouter(body, options, retries - 1);
        }
        throw err;
    }
};
