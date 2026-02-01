// netlify/functions/auth-login.js - النسخة المبسطة والصحيحة

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    // التحقق من الطريقة
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                success: false,
                error: 'الطريقة غير مسموحة' 
            })
        };
    }

    try {
        // استخراج البيانات
        const { emailOrUsername, password } = JSON.parse(event.body || '{}');
        
        // التحقق من البيانات
        if (!emailOrUsername || !password) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    success: false,
                    error: 'جميع الحقول مطلوبة' 
                })
            };
        }

        // إرجاع نجاح (للاختبار المؤقت)
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'تم تسجيل الدخول بنجاح (وضع الاختبار)',
                user: {
                    id: 'test-user-' + Date.now(),
                    username: emailOrUsername.split('@')[0] || 'مستخدم',
                    email: emailOrUsername.includes('@') ? emailOrUsername : 'test@example.com',
                    vip_status: false,
                    vip_expiry: null
                }
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                success: false,
                error: 'حدث خطأ في الخادم: ' + error.message 
            })
        };
    }
};