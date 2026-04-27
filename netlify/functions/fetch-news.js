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

        const url = `https://api.freenewsapi.io/v1/news?lang=en`;

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey // Some APIs prefer header, but let's pass it in query too just in case
            }
        });
        
        // If the fetch fails with a non-2xx status code
        if (!response.ok) {
            const errText = await response.text();
            console.error("FreeNewsAPI Error Response:", errText);
            return {
                statusCode: response.status,
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
            body: JSON.stringify({ error: 'Failed to fetch news from API.', details: error.message || String(error) })
        };
    }
};
