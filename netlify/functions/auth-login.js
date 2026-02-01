const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { emailOrUsername, password } = JSON.parse(event.body || '{}');

    if (!emailOrUsername || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'جميع الحقول مطلوبة' })
      };
    }

    // قلب على المستخدم بالإيميل أو اليوزر
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .maybeSingle();

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'المستخدم غير موجود' })
      };
    }

    // نفس التشفير البسيط المستعمل فـ register
    const passwordHash = Buffer.from(password).toString('base64');

    if (user.password_hash !== passwordHash) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'كلمة المرور غير صحيحة' })
      };
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'خطأ في الخادم' })
    };
  }
};