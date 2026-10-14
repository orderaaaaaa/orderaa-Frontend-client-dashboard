export const webhookSteps = [
  'قم بتسجيل الدخول إلى حسابك في منصة Easy Orders من خلال موقعهم الرسمي.',
  'انتقل إلى الاعدادات (Settings).',
  'اختر قسم Webhooks.',
  'اضغط على "Create Webhook" أو "إنشاء ربط جديد".',
  'اختر الحدث: "Order Created" (عند إنشاء طلب جديد).',
  'انسخ رابط الـ Webhook من الحقل أدناه وألصقه في حقل Webhook URL في Easy Orders.',
  'قم بإنشاء مفتاح سرية (Secret) قوي (10 أحرف على الأقل) وألصقه في Easy Orders وفي حقل Webhook Secret أدناه.',
  'احفظ الإعدادات في Easy Orders، ثم اضغط "تحديث الربط" أو "إنشاء الربط" في هذه الصفحة.',
];

export const integrationSteps = [
  'اختار قسم public api',
  'اضغط على "Create" أو "إنشاء',
  'اختر الحدث: "Product Accessed" (الوصول الي المنتجات)',
  'انسخ المفتاح السري API Key',
  'أدخل مفتاح الـ API في الحقل أدناه لإتمام الربط التلقائي للمخزون والطلبات.',
  'الصق المفتاح السري ادناه في المكان المخصص له.',
];

export const shopifyWebhookSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم Shopify الخاصة بمتجرك.',
  'انتقل إلى الإعدادات (Settings) من القائمة الجانبية السفلية.',
  'اختر قسم الإشعارات (Notifications).',
  'مرر لأسفل حتى تصل إلى قسم Webhooks واضغط على "Create webhook".',
  'من قائمة Event اختر الحدث "Order creation".',
  'من قائمة Format اختر "JSON".',
  'انسخ رابط الـ Webhook من الحقل أدناه وألصقه في حقل URL.',
  'اختر أحدث إصدار من Webhook API version.',
  'اضغط "Save" لحفظ الـ Webhook في Shopify.',
  'ستجد مفتاح الـ Signing secret أسفل قائمة الـ Webhooks في Shopify — انسخه وألصقه في حقل Webhook Secret أدناه.',
  'اضغط "التالي" لإتمام إعداد الـ Webhook.',
];

export const shopifyIntegrationSteps = [
  'من لوحة تحكم Shopify، انتقل إلى الإعدادات (Settings) ثم التطبيقات وقنوات البيع (Apps and sales channels).',
  'اضغط على "Develop apps" في أعلى الصفحة (إذا لم يكن مفعّلاً، اضغط "Allow custom app development" أولاً).',
  'اضغط على "Create an app" وأدخل اسم التطبيق ثم اضغط "Create app".',
  'اضغط على "Configure Admin API scopes" وفعّل الصلاحيات المطلوبة (read_orders, write_orders, read_products) ثم اضغط "Save".',
  'اضغط على "Install app" في أعلى الصفحة ثم أكّد بالضغط على "Install".',
  'سيظهر لك مفتاح الـ Admin API access token مرة واحدة فقط — انسخه فوراً واحفظه في مكان آمن.',
  'الصق المفتاح في الحقل أدناه لإتمام الربط.',
];

export const lightfunnelsWebhookSteps = [
  'قم بتسجيل الدخول إلى لوحة تحكم Lightfunnels.',
  'انتقل إلى الإعدادات (Settings) ثم اختر Webhooks.',
  'اضغط على "Add new Webhook" واختر نوع الحدث "order/created".',
  'انسخ الرابط أدناه (يحتوي على رمز الحماية) وألصقه في حقل URL ثم احفظ الـ Webhook.',
  'أضف Webhook ثانياً بنوع الحدث "order/confirmed" وبنفس الرابط ثم احفظه.',
  'اضغط "حفظ" هنا لإتمام الربط.',
];

export const lightfunnelsApiSteps = [
  'سجّل الدخول إلى partners.lightfunnels.com وافتح صفحة Apps ثم اضغط زر «Create a new app» أعلى اليمين لفتح نافذة إنشاء التطبيق',
  'في النافذة املأ App Name وApp URL، والصق رابط إعادة التوجيه (Redirect URI) من الأسفل في حقل Redirect URIs، وأدخل App Cookies Prefix (حتى ٥ أحرف مثل ord)، وفعّل خيار External app، ثم اضغط «Create app»',
  'ادخل إلى التطبيق الذي أنشأته ثم انتقل إلى تبويب Configurations',
  'انسخ Client ID وClient secret من قسم App Credentials (أيقونة النسخ) والصقهما في الحقول أدناه',
  'اضغط «ربط Lightfunnels» — ستُحوَّل إلى شاشة تثبيت التطبيق في Lightfunnels وستجد صلاحيتي products وorders محددتين مسبقاً، اضغط «Install app» دون تغيير أي شيء',
];

export const lightfunnelsAutomaticSteps = [
  'اختر «تلقائي» في خطوة إعدادات Webhook ثم اضغط «التالي»',
  'سجّل الدخول إلى partners.lightfunnels.com وأنشئ تطبيقاً من النافذة المنبثقة كما في خطوات ربط الـ API',
  'انسخ Client ID وClient secret من تبويب Configurations داخل تطبيقك وأدخلهما في الخطوة التالية، ثم في شاشة التثبيت اضغط «Install app» دون تغيير أي شيء (صلاحيتا products وorders محددتان مسبقاً)',
  'بعد التثبيت نسجّل الـ Webhooks في Lightfunnels تلقائياً، ولا تحتاج إلى نسخ أي رابط',
];
