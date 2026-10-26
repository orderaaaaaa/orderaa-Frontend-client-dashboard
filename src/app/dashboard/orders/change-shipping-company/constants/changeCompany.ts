import {
  BULK_COMPANY_SWITCH_OUTCOME,
  BULK_COMPANY_SWITCH_REASON,
  type BulkCompanySwitchReason,
  type BulkCompanySwitchResponse,
} from '../types/bulkCompanySwitch';

export const CHANGE_COMPANY_TEXT = {
  title: 'تغيير شركة الشحن بالجملة',
  subtitle: 'امسح الطلبات، ثم اختر الشركة الجديدة والمحافظة والمدينة لكل طلب',
  backToPackaging: 'رجوع إلى قسم التغليف',
  noPermission: 'لا تملك صلاحية تغيير شركة الشحن بالجملة',
  companiesFailed: 'تعذر تحميل شركات الشحن',
  targetLabel: 'الشركة الجديدة',
  save: 'حفظ',
  clear: 'مسح',
  clearConfirmBody: 'سيتم حذف قائمة الإلغاء لدى الشركة القديمة من هذه الصفحة. هل تريد المتابعة؟',
  clearConfirmYes: 'مسح',
  clearConfirmNo: 'إلغاء',
  saveDialogTitle: 'حفظ التغييرات',
  saveDialogBody: 'سيتم تغيير شركة الشحن لـ {sendable} طلب، وسيتم تخطي {skipped} طلب',
  saveOnly: 'حفظ فقط',
  saveAndPrint: 'حفظ وطباعة',
  noPrintPermission: 'لا تملك صلاحية الطباعة',
  colCode: 'الكود',
  colStatus: 'الحالة',
  colAddress: 'العنوان',
  colCurrentCompany: 'شركة الشحن الحالية',
  colGovernorate: 'المحافظة',
  colCity: 'المدينة',
  colResult: 'النتيجة',
  noCompany: 'بدون شركة',
  pickRequired: 'اختر المحافظة والمدينة',
  sending: 'جاري الإرسال...',
  emptyRows: 'امسح طلباً لبدء تغيير شركة الشحن',
  duplicateScan: 'هذا الطلب تم مسحه مسبقاً',
  notFound: 'هذا الطلب غير موجود',
  scanFailed: 'تعذر تحميل الطلب',
  errorRequest: 'تعذر إرسال الطلب، راجع الرسالة',
  fetchForPrintFailed: 'تعذر تحميل الطلب للطباعة',
  printNothing: 'لا توجد طلبات متاحة للطباعة',
  printSkipped: 'تعذر طباعة هذا الطلب',
  resultSwitched: 'تم التغيير',
  resultCancelOld: 'يلزم الإلغاء يدويًا لدى الشركة القديمة',
  resultOldIdMissing: 'رقم الشحنة القديم غير مسجل، راجع الطلب',
  resultNotSwitched: 'لم يتم التغيير',
  resultSkipped: 'متخطاة',
  openOrder: 'فتح الطلب',
  skippedStateChanged: 'تم تخطي هذا الطلب لأنه تغيّر منذ تحميل الصفحة، ولم يتغير شيء.',
  carrierRejectedNoPrevious:
    'لم يتم التحويل: رفضت {newCarrier} الشحنة، ولا توجد شركة شحن سابقة للطلب.',
  preStatusNotAllowed: 'الحالة لا تسمح بتغيير شركة الشحن',
  prePhoneMissing: 'لا يوجد رقم هاتف للعميل',
  preShadowed: 'الطلب موقوف بسبب الرصيد',
  preParked: 'الطلب مركون',
  preLockedByOther: 'الطلب مقفل لدى موظف آخر',
  preTargetNotActive: 'شركة الشحن غير متاحة',
  preLocationMissing: 'اختر المحافظة والمدينة',
} as const;

export const REASON_TEXT: Record<BulkCompanySwitchReason, string> = {
  STATUS_NOT_ALLOWED: 'حالة هذا الطلب لا تسمح بتغيير شركة الشحن من هذه الصفحة.',
  SHADOWED: 'هذا الطلب مخفي، لذلك لا يمكن تغيير شركة الشحن الخاصة به.',
  PARKED: 'هذا الطلب مؤجل، لذلك لا يمكن تغيير شركة الشحن الخاصة به.',
  LOCKED_BY_OTHER: 'هذا الطلب قيد التعديل من موظف آخر.',
  TARGET_NOT_ACTIVE: 'شركة الشحن المختارة غير مفعّلة.',
  LOCATION_MISSING: 'اختر المحافظة والمدينة للشركة الجديدة.',
  LOCATION_UNRESOLVED: 'تعذر تحديد المحافظة أو المدينة لدى الشركة الجديدة.',
  PHONE_MISSING: 'لا يوجد رقم هاتف للعميل، لذلك لا يمكن إنشاء الشحنة.',
  ADDRESS_MISSING: 'المحافظة أو المدينة غير مكتملة، لذلك لا يمكن إنشاء الشحنة.',
  OPEN_MARKER: 'يوجد إرسال مفتوح لهذا الطلب إلى شركة الشحن. أغلقه أولاً.',
  LEDGER_REFUSED: 'تم رفض إرسال شركة الشحن لهذا الطلب.',
  CLAIM_FAILED: 'تعذر بدء تغيير الشركة ولم يُرسل شيء. حاول مرة أخرى.',
  CODE_NOT_ISSUED: 'تعذر إصدار رقم شحن لهذا الطلب.',
  RETIRED_INTEGRATION: 'تكامل شركة الشحن متوقف. اختر شركة أخرى.',
  REPLACED_PARENT_NO_CARRIER_SYNC:
    'تم استبدال هذا الطلب، لذلك لا يمكن تغيير شحنة شركة الشحن الخاصة به من هنا.',
  CARRIER_ACCEPTED: 'تم التحويل. قبلت شركة الشحن الشحنة الجديدة.',
  LOCAL_SWITCH: 'تم التحويل إلى الشركة الجديدة.',
  LOCAL_SAME: 'تم تحديث المحافظة والمدينة',
  UPDATED_ON_CARRIER: 'تم تحديث العنوان لدى الشركة نفسها',
  CARRIER_REJECTED: 'لم يتم التحويل: رفضت {newCarrier} الشحنة، ويبقى الطلب على {oldCarrier}.',
  OUTCOME_UNKNOWN:
    'لم يتم التحويل: النتيجة غير معروفة. تحقق من {newCarrier} من وجود شحنة لهذا الطلب قبل الإرسال مرة أخرى.',
  STATE_CHANGED:
    'لم يتم التحويل: تغيّر الطلب. إجراء الإغلاق يسجل ما تُظهره شركة الشحن.',
  HELD_CHECK_REQUIRED: 'تم الحفظ ولم يُرسل. تحقق من الشحنة المعلّقة قبل الإرسال.',
  CAP_REACHED: 'تم الحفظ ولم يُرسل: وصل هذا الطلب إلى حد الإرسال. يُرسل بإجراء من موظف.',
  BUDGET_REACHED: 'تم الحفظ ولم يُرسل: انتهى الوقت المخصص لهذا الطلب. يُرسل بإجراء من موظف.',
};

export const LOCAL_REASON_TEXT: Partial<Record<BulkCompanySwitchReason, string>> = {
  STATUS_NOT_ALLOWED: CHANGE_COMPANY_TEXT.preStatusNotAllowed,
  PHONE_MISSING: CHANGE_COMPANY_TEXT.prePhoneMissing,
  LOCATION_MISSING: CHANGE_COMPANY_TEXT.preLocationMissing,
  SHADOWED: CHANGE_COMPANY_TEXT.preShadowed,
  PARKED: CHANGE_COMPANY_TEXT.preParked,
  LOCKED_BY_OTHER: CHANGE_COMPANY_TEXT.preLockedByOther,
  TARGET_NOT_ACTIVE: CHANGE_COMPANY_TEXT.preTargetNotActive,
};

export interface ChangeCompanyTextNames {
  newCarrier: string;
  oldCarrier: string;
}

export function fillChangeText(template: string, names: ChangeCompanyTextNames): string {
  return template
    .replace('{newCarrier}', names.newCarrier)
    .replace('{oldCarrier}', names.oldCarrier);
}

export function localReasonTextOf(reason: BulkCompanySwitchReason): string {
  return LOCAL_REASON_TEXT[reason] ?? REASON_TEXT[reason];
}

export function resultTextOf(
  response: BulkCompanySwitchResponse,
  names: ChangeCompanyTextNames
): string {
  if (
    response.outcome === BULK_COMPANY_SWITCH_OUTCOME.SKIPPED &&
    response.reason === BULK_COMPANY_SWITCH_REASON.STATE_CHANGED
  ) {
    return CHANGE_COMPANY_TEXT.skippedStateChanged;
  }
  if (
    response.reason === BULK_COMPANY_SWITCH_REASON.CARRIER_REJECTED &&
    response.previousCompany === null
  ) {
    return fillChangeText(CHANGE_COMPANY_TEXT.carrierRejectedNoPrevious, names);
  }
  const template = (REASON_TEXT as Partial<Record<string, string>>)[response.reason];
  return fillChangeText(template ?? response.message, names);
}

export function unknownResultTextOf(names: ChangeCompanyTextNames): string {
  return fillChangeText(REASON_TEXT.OUTCOME_UNKNOWN, names);
}
