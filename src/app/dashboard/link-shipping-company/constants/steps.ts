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
  'اضغط علي زر "انشاء مفتاح API"',
  'اضغط علي زر "انشاء"',
  'انسخ كود الربط الذي يحتوي على "مفتاح API" من ايقونه النسخ',
  'ألصق الكود في الحقل أدناه.',
  'اضغط على "تفعيل الربط" للحفظ.',
];

export const getStepsByProvider = (providerId: string): string[] => {
  const provider = providerId.toLowerCase();

  switch (provider) {
    case 'bosta':
      return bostaSteps;
    case 'turbo':
      return turboSteps;
    default:
      return turboSteps;
  }
};
