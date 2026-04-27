exports.handler = async function (event, context) {
    // Only allow GET requests for this proxy
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const apiKey = process.env.VITE_FREENEWS_API_KEY || process.env.FREENEWS_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: "Missing FreeNews API Key in Environment Variables" })
            };
        }

        const topic = event.queryStringParameters?.topic || '';
        let url = `https://api.freenewsapi.io/v1/news?language=en&country=us`;
        if (topic && topic !== 'all') {
            url += `&category=${encodeURIComponent(topic)}`;
        }

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error("FreeNewsAPI Error Response:", errText);
            return {
                statusCode: response.status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: `API Error: ${response.status} ${response.statusText}`, details: errText })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("FreeNewsAPI Proxy Error:", error.message || error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Failed to fetch news from API.', details: error.message || String(error) })
        };
    }
};
