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

    const { username, email, password } = JSON.parse(event.body || '{}');

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'جميع الحقول مطلوبة' })
      };
    }

    // تأكد أن المستخدم ما موجودش
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existingUser) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'البريد أو اسم المستخدم مستخدم مسبقاً' })
      };
    }

    // تشفير بسيط (للأمثلة فقط — فالإنتاج استعمل bcrypt)
    const passwordHash = Buffer.from(password).toString('base64');

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ username, email, password_hash: passwordHash }])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'خطأ في الخادم' })
    };
  }
};