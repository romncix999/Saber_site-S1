// netlify/functions/test-connection.js
exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
            status: 'online',
            message: 'الخادم يعمل بشكل طبيعي',
            timestamp: new Date().toISOString()
        })
    };
};