// ملف: netlify/functions/check-vip.js
// دالة للتحقق من صحة أكواد VIP

// قاعدة بيانات افتراضية للأكواد (في الواقع الحقيقي، استخدم قاعدة بيانات)
const vipCodesDatabase = {
    "SABER55VIP": {
        active: true,
        usedBy: null,
        expires: null,
        maxUses: 1,
        usedCount: 0,
        createdAt: "2024-01-01"
    },
    "20262026": {
        active: true,
        usedBy: null,
        expires: null,
        maxUses: 1,
        usedCount: 0,
        createdAt: "2024-01-01"
    },
    "VIP202455": {
        active: true,
        usedBy: null,
        expires: null,
        maxUses: 1,
        usedCount: 0,
        createdAt: "2024-01-01"
    },
    "TESTCODE55": {
        active: true,
        usedBy: null,
        expires: null,
        maxUses: 1,
        usedCount: 0,
        createdAt: "2024-01-01"
    }
};

exports.handler = async function(event, context) {
    // التحقق من أن الطريقة POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ 
                error: 'الطريقة غير مسموحة',
                allowedMethods: ['POST']
            })
        };
    }

    // معالجة طلبات OPTIONS لـ CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }

    try {
        // استخراج البيانات من الجسم
        const { code, userId, username } = JSON.parse(event.body || '{}');
        
        if (!code) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false,
                    error: 'كود VIP مطلوب' 
                })
            };
        }

        const codeUpper = code.trim().toUpperCase();
        
        // التحقق من وجود الكود في قاعدة البيانات
        const vipCode = vipCodesDatabase[codeUpper];
        
        if (!vipCode) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false,
                    error: 'كود VIP غير صحيح' 
                })
            };
        }

        // التحقق من حالة الكود
        if (!vipCode.active) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false,
                    error: 'كود VIP غير مفعل' 
                })
            };
        }

        // التحقق من عدد مرات الاستخدام
        if (vipCode.usedCount >= vipCode.maxUses) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false,
                    error: 'كود VIP مستخدم بالكامل' 
                })
            };
        }

        // التحقق إذا كان الكود مستخدم من قبل مستخدم آخر
        if (vipCode.usedBy && vipCode.usedBy !== userId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false,
                    error: 'كود VIP مستخدم من قبل شخص آخر' 
                })
            };
        }

        // حساب تاريخ الانتهاء (شهر واحد من الآن)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        // تحديث قاعدة البيانات (في الواقع الحقيقي، احفظ في قاعدة بيانات)
        vipCode.usedBy = userId || username || 'مستخدم جديد';
        vipCode.usedCount += 1;
        vipCode.activatedAt = new Date().toISOString();
        vipCode.expires = expiryDate.getTime();
        
        // تسجيل النشاط
        console.log(`تم تفعيل VIP: ${codeUpper} للمستخدم: ${userId}`);
        
        // إعداد بيانات الرد
        const responseData = {
            success: true,
            message: 'تم تفعيل الـ VIP بنجاح!',
            code: codeUpper,
            userId: userId,
            username: username || 'مستخدم',
            expiryDate: expiryDate.toISOString(),
            expiryTimestamp: vipCode.expires,
            daysValid: 30,
            features: [
                'علامة VIP ذهبية',
                'تحميل فائق السرعة',
                'محتوى حصري',
                'دعم فوري',
                'ميزات جديدة قريباً'
            ]
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('خطأ في دالة check-vip:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: 'حدث خطأ في الخادم',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};