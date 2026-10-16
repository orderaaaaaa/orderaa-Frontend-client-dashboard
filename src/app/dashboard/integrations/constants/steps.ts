export type GuideSegment = string | { ui: string } | { value: string };
export type GuideStep = string | GuideSegment[];

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

export const lightfunnelsWebhookSteps: GuideStep[] = [
  [
    'سجّل الدخول إلى لوحة تحكم متجرك في Lightfunnels على ',
    { value: 'app.lightfunnels.com' },
    '.',
  ],
  [
    'افتح ',
    { ui: 'Settings' },
    ' ثم ',
    { ui: 'Webhooks' },
    ' واضغط ',
    { ui: 'Add new Webhook' },
    '.',
  ],
  [
    'اختر نوع الحدث ',
    { value: 'order/created' },
    '، ثم انسخ ',
    { ui: 'رابط الاستقبال (Webhook URL)' },
    ' من الأسفل (يتضمن رمز الحماية) والصقه في حقل ',
    { ui: 'URL' },
    ' واحفظ الـ Webhook.',
  ],
  [
    'أضف Webhook ثانياً بنوع الحدث ',
    { value: 'order/confirmed' },
    ' وبنفس الرابط ثم احفظه.',
  ],
  ['اضغط ', { ui: 'التالي' }, ' للانتقال إلى خطوة ربط الـ API وإتمام الربط.'],
];

export const lightfunnelsApiSteps: GuideStep[] = [
  [
    'سجّل الدخول إلى ',
    { value: 'partners.lightfunnels.com' },
    '، وافتح صفحة ',
    { ui: 'Apps' },
    ' من القائمة الجانبية، ثم اضغط ',
    { ui: 'Create a new app' },
    ' أعلى الصفحة.',
  ],
  [
    'في نافذة إنشاء التطبيق اكتب اسماً لتطبيقك في حقل ',
    { ui: 'App Name' },
    '، وأدخل ',
    { value: 'https://orderaa.com' },
    ' في حقل ',
    { ui: 'App URL' },
    '.',
  ],
  [
    'انسخ ',
    { ui: 'رابط إعادة التوجيه (Redirect URI)' },
    ' من الأسفل والصقه في حقل ',
    { ui: 'Redirect URIs' },
    '.',
  ],
  [
    'فعّل مفتاح ',
    { ui: 'External app' },
    '، واكتب في حقل ',
    { ui: 'App Cookies Prefix' },
    ' بادئة من حروف إنجليزية فقط بحد أقصى 5 أحرف (مثل ',
    { value: 'ord' },
    ')، ثم اضغط ',
    { ui: 'Create app' },
    '.',
  ],
  [
    'افتح التطبيق الذي أنشأته وانتقل إلى تبويب ',
    { ui: 'Configurations' },
    '، ومن قسم ',
    { ui: 'App Credentials' },
    ' انسخ ',
    { ui: 'Client ID' },
    ' و',
    { ui: 'Client secret' },
    ' بأيقونة النسخ بجانب كل منهما.',
  ],
  [
    'الصق ',
    { ui: 'Client ID' },
    ' في حقل ',
    { ui: 'معرّف التطبيق (Client ID)' },
    '، و',
    { ui: 'Client secret' },
    ' في حقل ',
    { ui: 'المفتاح السري للتطبيق (Client Secret)' },
    ' بالأسفل.',
  ],
  [
    'اضغط ',
    { ui: 'ربط Lightfunnels' },
    '، وستنتقل إلى شاشة التثبيت في Lightfunnels حيث تكون صلاحيتا ',
    { value: 'products' },
    ' و',
    { value: 'orders' },
    ' محددتين مسبقاً؛ اضغط ',
    { ui: 'Install app' },
    ' دون تغيير أي شيء.',
  ],
];

export const lightfunnelsAutomaticSteps: GuideStep[] = [
  [
    'اختر ',
    { ui: 'تلقائي' },
    ' في خطوة إعدادات الـ Webhook ثم اضغط ',
    { ui: 'التالي' },
    '.',
  ],
  [
    'أنشئ تطبيقاً في ',
    { value: 'partners.lightfunnels.com' },
    ' وانسخ ',
    { ui: 'Client ID' },
    ' و',
    { ui: 'Client secret' },
    ' من تبويب ',
    { ui: 'Configurations' },
    ' كما في خطوات ربط الـ API.',
  ],
  [
    'أدخلهما في الخطوة التالية واضغط ',
    { ui: 'ربط Lightfunnels' },
    '، ثم اضغط ',
    { ui: 'Install app' },
    ' في شاشة التثبيت دون تغيير الصلاحيات.',
  ],
  [
    'بعد التثبيت نسجّل Webhooks الطلبات (',
    { value: 'order/created' },
    ' و',
    { value: 'order/confirmed' },
    ') في Lightfunnels تلقائياً، ولا تحتاج إلى نسخ أي رابط.',
  ],
];
