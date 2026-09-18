const FALLBACK_ARTICLES = [
    {
        title: "AI Breakthrough: Open-Source Models Rival State-of-the-Art Production Suites",
        description: "A new generation of open multimodal models is transforming how video creators and digital artists produce viral content.",
        source: { name: "Tech Pulse" },
        url: "https://re-render.netlify.app"
    },
    {
        title: "The Creator Economy Hits $250 Billion as Filmmakers Adopt AI Pre-Visualization",
        description: "Studio directors and solo creators are replacing multi-week storyboard sessions with real-time AI directorial engines.",
        source: { name: "Creator Insider" },
        url: "https://re-render.netlify.app"
    },
    {
        title: "Why Thumbnails Are 80% of YouTube Success: Viral Case Study",
        description: "New CTR analysis reveals how contrast, visual focal points, and facial emotion determine viral trajectory.",
        source: { name: "Digital Media Review" },
        url: "https://re-render.netlify.app"
    },
    {
        title: "Cinematic Storyboarding Reimagined: The Shift to Neural Pitch Decks",
        description: "How indie directors are securing funding using instant visual scene breakdowns generated directly from scripts.",
        source: { name: "Indie Cinema News" },
        url: "https://re-render.netlify.app"
    }
];

export const handler = async function (event, context) {
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

        // 3. Resilient Fallback (Never crash with 503 if external news is unavailable)
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ articles: FALLBACK_ARTICLES, source: 'curated_fallback' })
        };
    } catch (error) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ articles: FALLBACK_ARTICLES, error: error.message })
        };
    }
};

// CommonJS compatibility for traditional Netlify lambda runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handler };
}
