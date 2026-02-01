const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { code, userId } = JSON.parse(event.body);
        
        if (!code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    success: false,
                    error: 'كود VIP مطلوب' 
                })
            };
        }

        // استخدام الدالة المخزنة في PostgreSQL
        const { data, error } = await supabase.rpc('activate_vip_code', {
            input_code: code,
            user_uuid: userId,
            user_ip: event.headers['x-forwarded-for'] || 'unknown'
        });

        if (error) {
            console.error('Supabase RPC error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    success: false,
                    error: 'خطأ في الخادم' 
                })
            };
        }

        const result = data;
        
        if (result.success) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: result.message,
                    expiryDate: result.expiry_date,
                    expiryTimestamp: new Date(result.expiry_date).getTime()
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    success: false,
                    error: result.message 
                })
            };
        }

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                error: 'حدث خطأ في الخادم' 
            })
        };
    }
};