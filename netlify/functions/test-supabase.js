const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'مفاتيح Supabase غير مضبوطة',
                    supabaseUrl: !!supabaseUrl,
                    supabaseKey: !!supabaseKey
                })
            };
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // محاولة الاتصال
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'خطأ في الاتصال بـ Supabase',
                    details: error.message
                })
            };
        }
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'الاتصال بـ Supabase ناجح',
                usersCount: data
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'حدث خطأ',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};