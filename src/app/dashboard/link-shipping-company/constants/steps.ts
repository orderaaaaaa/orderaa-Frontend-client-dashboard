const turboSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم تيربو (Turbo).',
  'اضغط علي صورة الشخص اعلي الشمال',
  'انتقل إلى اعدادات الحساب.',
  'قسم ربط API',
  'اختار الاضافه',
  'اضغط علي كود ال API',
  'انسخ كود الربط الذي يحتوي على authentication_key و main_client_code. من ايقونه النسخ',
  'ألصق الكود في الحقل أدناه.',
  'اضغط على "تفعيل الربط" للحفظ.',
];

const bostaSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم بوسطه (Bosta).',
  'اضغط علي زر "الإعدادات" في القائمة العلوية.',
  'انتقل إلى ربط التطبيقات',
  'اضغط علي زر "طلب OTP"',
  'ادخل رمز التحقق الذي وصلك على هاتفك.',
  'اضغط علي زر "انشاء Client Keys"',
  'اضغط علي زر "انشاء"',
  'انسخ كود الربط الذي يحتوي على "Client Keys" من ايقونه النسخ',
  'ألصق الكود في الحقل أدناه.',
  'اضغط على "تفعيل الربط" للحفظ.',
];

const redSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم Red.',
  'انتقل إلى إعدادات الحساب.',
  'انتقل إلى قسم ربط API.',
  'انسخ مفتاح المصادقة (Authentication Key).',
  'ألصق الكود في الحقل أدناه.',
  'اضغط على "تفعيل الربط" للحفظ.',
];

const hashtagSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم Hashtag.',
  'انتقل إلى إعدادات الحساب.',
  'انتقل إلى قسم ربط API.',
  'انسخ مفتاح المصادقة (Authentication Key).',
  'ألصق الكود في الحقل أدناه.',
  'اضغط على "تفعيل الربط" للحفظ.',
];

const quickConnectSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم Quick Connect.',
  'انتقل إلى إعدادات الحساب.',
  'انتقل إلى قسم ربط API.',
  'انسخ اسم المستخدم وكلمة المرور الخاصة بالربط.',
  'ألصق البيانات في الحقول أدناه.',
  'اضغط على "تفعيل الربط" للحفظ.',
];

export const getStepsByProvider = (providerId: string): string[] => {
  const provider = providerId.toLowerCase();

  switch (provider) {
    case 'bosta':
      return bostaSteps;
    case 'turbo':
      return turboSteps;
    case 'red':
      return redSteps;
    case 'hashtag':
      return hashtagSteps;
    case 'quick_connect':
      return quickConnectSteps;
    default:
      return turboSteps;
  }
};
