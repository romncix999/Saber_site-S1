const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { emailOrUsername, password } = JSON.parse(event.body);

        // البحث عن المستخدم بالبريد أو اسم المستخدم
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
            .single();

        if (error || !user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
            };
        }

        // التحقق من كلمة المرور
        const passwordHash = Buffer.from(password).toString('base64');
        if (passwordHash !== user.password_hash) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
            };
        }

        // تحديث آخر تسجيل دخول
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // إنشاء جلسة جديدة لمدة شهر
        const sessionToken = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // حذف الجلسات القديمة
        await supabase
            .from('sessions')
            .delete()
            .eq('user_id', user.id);

        // إنشاء جلسة جديدة
        await supabase
            .from('sessions')
            .insert([
                {
                    user_id: user.id,
                    session_token: sessionToken,
                    expires_at: expiresAt.toISOString()
                }
            ]);

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
            },
            body: JSON.stringify({
                success: true,
                message: 'تم تسجيل الدخول بنجاح',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    vip_status: user.vip_status,
                    vip_expiry: user.vip_expiry
                }
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'حدث خطأ في الخادم' })
        };
    }
};