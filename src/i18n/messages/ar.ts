/**
 * The Arabic catalogue — the reference language, and the source of the key set.
 *
 * `as const` is load-bearing: it turns the keys into a literal union that
 * `TranslationKey` derives from and that `en.ts` is typed against, so the two
 * catalogues cannot drift without failing `tsc`.
 *
 * Copy is lifted from the components verbatim. Where JSX had wrapped a sentence
 * across source lines, the entry is the joined single-space form React actually
 * rendered — the rendered bytes are unchanged.
 *
 * Only the six stock/availability components are converted so far; this is the
 * pattern the remaining screens follow, not a finished migration.
 */
const ar = {
  'common.language': 'اللغة',
  'common.loading': 'جارٍ التحميل…',
  // Fires only when a 403 arrives with no body message; the backend normally
  // sends its own copy in whatever `Accept-Language` asked for.
  'common.errors.forbidden': 'ليس لديك صلاحية للقيام بهذا الإجراء',

  'stockRules.scope.label': 'نطاق القواعد',
  'stockRules.scope.global': 'كل المنتجات',
  'stockRules.scope.product': 'منتج محدد',
  'stockRules.scope.variant': 'متغير محدد',
  'stockRules.scope.productLabel': 'المنتج',
  'stockRules.scope.productPlaceholder': 'اختر المنتج',
  'stockRules.scope.variantLabel': 'المتغير',
  'stockRules.scope.variantPlaceholder': 'اختر المتغير',
  'stockRules.scope.variantNeedsProduct': 'اختر المنتج أولًا',
  'stockRules.scope.globalHint':
    'القواعد العامة تُطبق على كل منتج ليس له قواعد خاصة به.',
  'stockRules.scope.overrideHint':
    'بمجرد إضافة قاعدة واحدة لهذا النطاق، لن تُطبق القواعد الأعلى منه على الإطلاق — حتى التحويلات التي لا تغطيها قواعد هذا النطاق.',

  'stockRules.coverage.header':
    'هذا النطاق ({scope}) له قواعده الخاصة، لذلك لا تُطبق عليه القواعد العامة إطلاقًا.',
  'stockRules.coverage.noCreationRule':
    'لا توجد قاعدة «عند إنشاء الطلب» في هذا النطاق — لن يخرج المخزون عند إنشاء طلب يحتوي عليه، حتى لو كانت هناك قاعدة إنشاء عامة.',
  'stockRules.coverage.gapsIntro':
    'التحويلات التالية (رجوع الطلب من التغليف إلى خدمة العملاء)',
  'stockRules.coverage.gapsEmphasis': 'لا تحرّك أي مخزون',
  'stockRules.coverage.gapsIntroTail': 'في هذا النطاق:',
  // The arrow is copy, not decoration: it points along the reading direction,
  // so it has to flip with the locale rather than be hardcoded in JSX.
  'stockRules.coverage.gapLine': '{from} ← {targets}',
  'stockRules.coverage.gapTargetSeparator': '، ',
  'stockRules.coverage.addRestockRule':
    'أضف قاعدة إرجاع لهذا النطاق إذا كنت تريد إعادة المخزون في هذه الحالات.',

  // T29 — the typed status-selection rule builder (event type + per-side
  // ANY/RANGE/SPECIFIC). Additive only for now: nothing renders these keys
  // yet, they land ahead of the StockWorkflowsTab wire-shape flip.
  'stockRules.intro':
    'حدد حركة المخزون التلقائية عند إنشاء الطلب أو عند انتقاله بين الحالات. القواعد غير المعرفة لا تحرك المخزون.',
  'stockRules.event.label': 'نوع الحدث',
  'stockRules.event.creation': 'عند إنشاء الطلب',
  'stockRules.event.transition': 'انتقال بين الحالات',
  'stockRules.side.from': 'من الحالة',
  'stockRules.side.to': 'إلى الحالة',
  'stockRules.selection.any': 'كل الحالات',
  'stockRules.selection.range': 'نطاق',
  'stockRules.selection.specific': 'حالات محددة',
  'stockRules.selection.anyFromHint':
    'تنطبق القاعدة على أي حالة مصدر — لا حاجة لاختيار حالات.',
  'stockRules.selection.anyToHint':
    'تنطبق القاعدة على أي حالة هدف — لا حاجة لاختيار حالات.',
  'stockRules.range.start': 'بداية النطاق',
  'stockRules.range.end': 'نهاية النطاق',
  'stockRules.range.previewLabel': 'الحالات المشمولة ({count})',
  // The dynamic-range note: a status added later between the endpoints joins
  // automatically — spelled out because it is not obvious from the picker.
  'stockRules.range.futureNote':
    'النطاق ديناميكي: أي حالة تُضاف مستقبلًا بين البداية والنهاية تدخل ضمن هذه القاعدة تلقائيًا.',
  'stockRules.errors.fromSpecificEmpty': 'اختر حالات المصدر',
  'stockRules.errors.toSpecificEmpty': 'اختر حالات الهدف',
  'stockRules.errors.rangeIncomplete': 'اختر بداية ونهاية النطاق',
  'stockRules.errors.rangeInverted':
    'يجب أن تسبق حالة البداية حالة النهاية في ترتيب الحالات',
  'stockRules.errors.sameStatusBothSides':
    'لا يمكن أن تظهر نفس الحالة في الجانبين',
  'stockRules.errors.warehousesRequired': 'اختر المخزنين',
  'stockRules.errors.sameWarehouse':
    'يجب أن يختلف مخزن المصدر عن مخزن الوجهة',
  'stockRules.errors.duplicateRule': 'قاعدة مكررة لنفس التحويل',
  'stockRules.errors.creationTargetRequired': 'اختر حالة الهدف عند إنشاء الطلب',
  'stockRules.saveSuccess': 'تم حفظ القاعدة بنجاح',
  'stockRules.saveFailed': 'تعذر حفظ القاعدة',

  'products.confirmOutOfStock.inherit': 'اتبع المتجر ({value})',
  'products.confirmOutOfStock.allow': 'مسموح',
  'products.confirmOutOfStock.forbid': 'ممنوع',
  'products.confirmOutOfStock.placeholder': 'تأكيد بدون مخزون',
  'products.confirmOutOfStock.saved': 'تم حفظ إعداد التأكيد',
  'products.confirmOutOfStock.saveFailed': 'تعذر حفظ الإعداد',

  'orderDetails.stock.available': 'المتاح: {count}',
  'orderDetails.stock.availableWithRequired':
    'المتاح: {available} (المطلوب: {required})',
  'orderDetails.stock.unavailable':
    'غير متوفر بالمخزون — المتاح {available} والمطلوب {required}',
  'orderDetails.stock.blocked': 'لا يمكن تأكيد الطلب بهذا المنتج — اختر منتجًا آخر',

  'orderDetails.variants.title': 'المتاح بالمخزون',
  'orderDetails.variants.blockedSelection':
    'هذا الاختيار غير متوفر بالمخزون وإعدادات المنتج تمنع إضافته — اختر حاجة تانية',

  'storeSettings.confirmOutOfStock.title':
    'السماح بتأكيد الطلبات غير المتوفرة بالمخزون',
  'storeSettings.confirmOutOfStock.allowedDescription':
    'يمكن لموظف خدمة العملاء تأكيد الطلب حتى لو كان المنتج غير متوفر. يمكن منع ذلك لمنتج بعينه من صفحة المنتجات.',
  'storeSettings.confirmOutOfStock.blockedDescription':
    'لن يتمكن الموظف من تأكيد طلب يحتوي على منتج غير متوفر — سيُطلب منه اختيار منتج آخر. يمكن استثناء منتج بعينه من صفحة المنتجات.',
} as const;

export default ar;
