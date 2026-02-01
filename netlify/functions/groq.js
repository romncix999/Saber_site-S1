// ملف: netlify/functions/groq.js

// هنا ستضع مفتاح API الحقيقي من Groq
// استبدل السطر في groq.js:
//const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";

// بـ:
const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.handler = async function(event, context) {
    // التحقق من أن الطريقة POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'الطريقة غير مسموحة' })
        };
    }

    try {
        // استخراج الرسالة من الجسم
        const { message, userId } = JSON.parse(event.body);
        
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'الرسالة مطلوبة' })
            };
        }

        // إعداد النظام للذكاء الاصطناعي
        const systemPrompt = `أنت مساعد ذكي عربي حصري لموقع SABER • 55.
أنت مبرمج لتقديم المساعدة فيما يخص:
1. تطبيقات الذكاء الاصطناعي
2. تحميل البرامج
3. شرح ميزات الموقع
4. تفعيل اشتراكات VIP
5. حل المشاكل التقنية

تحدث دائمًا باللغة العربية الفصحى أو العامية حسب طلب المستخدم.
كن مفيدًا ودقيقًا في إجاباتك.`;

        // إرسال الطلب إلى Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 800,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`خطأ في API: ${response.status}`);
        }

        const data = await response.json();
        
        // استخراج الرد
        const reply = data.choices?.[0]?.message?.content || 
                     "عذراً، لم أستطع توليد رد في الوقت الحالي.";

        // تسجيل الطلب (اختياري)
        console.log(`تم معالجة طلب من: ${userId || 'غير معروف'}`);

        // إعادة الرد
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                reply: reply,
                timestamp: new Date().toISOString(),
                model: data.model || 'llama-3.3-70b-versatile'
            })
        };

    } catch (error) {
        console.error('خطأ في دالة Groq:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'حدث خطأ في الخادم',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
