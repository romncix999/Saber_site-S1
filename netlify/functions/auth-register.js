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

        const { username, email, password } = JSON.parse(event.body);

        // التحقق من البيانات
        if (!username || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'جميع الحقول مطلوبة' })
            };
        }

        // التحقق إذا كان المستخدم موجود
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`)
            .single();

        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'البريد أو اسم المستخدم مستخدم مسبقاً' })
            };
        }

        // تشفير كلمة المرور (في الواقع الحقيقي استخدم bcrypt)
        const passwordHash = Buffer.from(password).toString('base64');

        // إنشاء المستخدم
        const { data: user, error } = await supabase
            .from('users')
            .insert([
                {
                    username,
                    email,
                    password_hash: passwordHash,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // إنشاء جلسة لمدة شهر
        const sessionToken = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

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
                message: 'تم إنشاء الحساب بنجاح',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            })
        };

    } catch (error) {
        console.error('Register error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'حدث خطأ في الخادم' })
        };
    }
};