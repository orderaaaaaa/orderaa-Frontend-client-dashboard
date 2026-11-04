import type { FollowupActionEventSource, FollowupNotePartyValue } from '@/lib/api/followup';

export const FOLLOWUP_NOTE_MAX_LENGTH = 2000;

export const FOLLOWUP_NOTE_PARTY_ORDER: readonly FollowupNotePartyValue[] = [
  'CUSTOMER',
  'SHIPPING_COMPANY',
  'COURIER',
];

export const FOLLOWUP_NOTE_PARTY_LABELS: Record<FollowupNotePartyValue, string> = {
  CUSTOMER: 'العميل',
  SHIPPING_COMPANY: 'الشركة',
  COURIER: 'المندوب',
};

export const FOLLOWUP_NOTE_PARTY_TONES: Record<FollowupNotePartyValue, string> = {
  CUSTOMER: 'border-primary/40 bg-primary/20',
  SHIPPING_COMPANY: 'border-warning/50 bg-warning/25',
  COURIER: 'border-success/40 bg-success/20',
};

export const FOLLOWUP_NOTE_PARTY_HEADING_TONES: Record<FollowupNotePartyValue, string> = {
  CUSTOMER: 'bg-primary/15 text-primary-text',
  SHIPPING_COMPANY: 'bg-warning/20 text-foreground',
  COURIER: 'bg-success/15 text-foreground',
};

export const FOLLOWUP_NOTES_TITLE = 'ملاحظات المتابعة';
export const FOLLOWUP_NOTES_LOADING = 'جاري تحميل الملاحظات...';
export const FOLLOWUP_NOTES_LOAD_ERROR = 'تعذر تحميل الملاحظات';
export const FOLLOWUP_NOTES_EMPTY_DAY = 'لا توجد ملاحظات في هذا اليوم';
export const FOLLOWUP_NOTES_RETRY_LABEL = 'إعادة المحاولة';
export const FOLLOWUP_NOTE_ADD_PLACEHOLDER = 'اكتب ملاحظة...';
export const FOLLOWUP_NOTE_ADD_LABEL = 'إضافة ملاحظة';
export const FOLLOWUP_NOTE_EDIT_LABEL = 'تعديل';
export const FOLLOWUP_NOTE_SAVE_LABEL = 'حفظ';
export const FOLLOWUP_NOTE_CANCEL_LABEL = 'إلغاء';
export const FOLLOWUP_NOTE_DELETE_LABEL = 'حذف';
export const FOLLOWUP_NOTE_DELETE_CONFIRM_LABEL = 'تأكيد الحذف';
export const FOLLOWUP_NOTE_EDITED_TAG = 'معدّلة';
export const FOLLOWUP_NOTE_NO_WRITER = '—';
export const FOLLOWUP_TODAY_LABEL = 'اليوم';
export const FOLLOWUP_LEGACY_TAG = 'سابق';
export const FOLLOWUP_CARRIER_TEXTS_LABEL = 'حالات جهة الشحن';
export const FOLLOWUP_CARRIER_CONTACTS_LABEL = 'بيانات المندوب';
export const FOLLOWUP_CARRIER_REPEAT_PREFIX = '×';

export const FOLLOWUP_LEGACY_NAME_LABELS: Partial<Record<string, string>> = {
  ATTEMPTED: 'متابعة',
  POSTPONED: 'تأجيل',
  OVERDUE: 'متأخر',
};

export const FOLLOWUP_NOTES_BUTTON_LABEL = 'الملاحظات';
export const FOLLOWUP_ACTION_LOG_BUTTON_LABEL = 'سجل الإجراءات';
export const FOLLOWUP_COURIER_COLUMN_LABEL = 'المندوب';
export const FOLLOWUP_ACTIONS_COLUMN_LABEL = 'المتابعة';

export const ACTION_LOG_TITLE = 'سجل الإجراءات';
export const ACTION_LOG_EMPTY = 'لا توجد إجراءات مسجلة لهذا الطلب';
export const ACTION_LOG_HISTORY_FORBIDDEN_NOTICE =
  'سجل تعديلات الطلب غير متاح لصلاحياتك، ويظهر سجل الإجراءات فقط';
export const ACTION_LOG_HISTORY_ERROR_NOTICE = 'تعذر تحميل سجل تعديلات الطلب، ويظهر سجل الإجراءات فقط';
export const ACTION_LOG_EVENTS_ERROR = 'تعذر تحميل سجل الإجراءات';
export const ACTION_LOG_SYSTEM_ACTOR = 'النظام';

export const ACTION_EVENT_SOURCE_LABELS: Record<FollowupActionEventSource, string> = {
  ORDER_EVENT: 'إجراء متابعة',
  LATE_MARK: 'حالة التأخير',
  CARRIER_SEND_AUDIT: 'إجراء الشحن',
};

export { ACTION_EVENT_NAME_LABELS } from '@/constants/followupEventLabels';
