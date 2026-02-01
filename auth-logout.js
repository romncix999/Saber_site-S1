exports.handler = async function(event, context) {
    // حذف جلسة المستخدم من قاعدة البيانات
    const cookies = event.headers.cookie || '';
    const tokenMatch = cookies.match(/session_token=([^;]+)/);
    
    if (tokenMatch) {
        // هنا يمكنك حذف الجلسة من قاعدة البيانات
        console.log('Logging out session:', tokenMatch[1]);
    }
    
    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': 'session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: true, message: 'تم تسجيل الخروج' })
    };
};