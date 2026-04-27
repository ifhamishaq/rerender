exports.handler = async function (event, context) {
    // Only allow GET requests for this proxy
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const apiKey = process.env.VITE_FREENEWS_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Missing FreeNews API Key in Environment Variables" })
            };
        }

        const url = `https://api.freenewsapi.com/v1/top-headlines?lang=en&key=${apiKey}`;

        const response = await fetch(url);
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
        console.error("FreeNewsAPI Proxy Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch news from API.' })
        };
    }
};
