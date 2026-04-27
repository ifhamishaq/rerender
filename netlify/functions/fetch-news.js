exports.handler = async function (event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const topic = event.queryStringParameters?.topic || '';
        
        // Collect all FreeNews keys (_1, _2, _3 fallback logic)
        const freeNewsKeys = [
            process.env.VITE_FREENEWS_API_KEY || process.env.FREENEWS_API_KEY,
            process.env.VITE_FREENEWS_API_KEY_1 || process.env.FREENEWS_API_KEY_1,
            process.env.VITE_FREENEWS_API_KEY_2 || process.env.FREENEWS_API_KEY_2,
            process.env.VITE_FREENEWS_API_KEY_3 || process.env.FREENEWS_API_KEY_3
        ].filter(Boolean);

        const gnewsKey = process.env.VITE_GNEWS_API_KEY || process.env.GNEWS_API_KEY;

        // 1. Try FreeNews keys in sequence
        for (const key of freeNewsKeys) {
            try {
                let url = `https://api.freenewsapi.io/v1/news?language=en&country=us`;
                if (topic && topic !== 'all') url += `&category=${encodeURIComponent(topic)}`;

                const response = await fetch(url, { headers: { 'x-api-key': key } });
                
                if (response.ok) {
                    const data = await response.json();
                    return {
                        statusCode: 200,
                        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    };
                } else if (response.status === 429 || response.status === 401) {
                    console.warn(`Key failed with status ${response.status}. Trying next key...`);
                    continue; // Try next key
                }
            } catch (e) {
                console.error("FreeNews key attempt failed:", e);
            }
        }

        // 2. Final Fallback: GNews
        if (gnewsKey) {
            try {
                let url = `https://gnews.io/api/v4/top-headlines?lang=en&country=us&token=${gnewsKey}`;
                if (topic && topic !== 'all') url += `&topic=${encodeURIComponent(topic)}`;

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    return {
                        statusCode: 200,
                        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articles: data.articles })
                    };
                }
            } catch (e) {
                console.error("GNews fallback failed:", e);
            }
        }

        return {
            statusCode: 503,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'All news sources exhausted or unavailable.' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Server Error', details: error.message })
        };
    }
};
