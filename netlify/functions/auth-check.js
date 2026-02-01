const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // استخراج token من الكوكيز
        const cookies = event.headers.cookie || '';
        const tokenMatch = cookies.match(/session_token=([^;]+)/);
        const sessionToken = tokenMatch ? tokenMatch[1] : null;

        if (!sessionToken) {
            return {
                statusCode: 401,
                body: JSON.stringify({ authenticated: false, error: 'No session token' })
            };
        }

        // البحث عن الجلسة
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('*, users(*)')
            .eq('session_token', sessionToken)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (sessionError || !session) {
            return {
                statusCode: 401,
                body: JSON.stringify({ authenticated: false, error: 'Session expired or invalid' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                authenticated: true,
                user: session.users
            })
        };

    } catch (error) {
        console.error('Auth check error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ authenticated: false, error: 'Server error' })
        };
    }
};