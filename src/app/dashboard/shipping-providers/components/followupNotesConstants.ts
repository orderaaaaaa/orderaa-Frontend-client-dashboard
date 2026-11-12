import type { FollowupActionEventSource, FollowupCarrierText, FollowupNotePartyValue } from '@/lib/api/followup';
import type { CarrierChatSendError } from '@/types/carrierChat';

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

export const FOLLOWUP_NOTES_LOADING = 'جاري تحميل الملاحظات...';
export const FOLLOWUP_NOTES_LOAD_ERROR = 'تعذر تحميل الملاحظات';
export const FOLLOWUP_NOTES_EMPTY_DAY = 'لا توجد ملاحظات في هذا اليوم';
export const FOLLOWUP_NOTES_RETRY_LABEL = 'إعادة المحاولة';
export const FOLLOWUP_NOTE_ADD_PLACEHOLDER = 'اكتب ملاحظة...';
export const FOLLOWUP_NOTE_ADD_LABEL = 'إضافة ملاحظة';
export const FOLLOWUP_NOTE_PARTY_GROUP_LABEL = 'لمن الملاحظة؟';
export const FOLLOWUP_NOTE_COUNTER_FROM = 1800;
export const FOLLOWUP_NOTE_MIN_ROWS = 2;
export const FOLLOWUP_NOTE_MAX_ROWS = 6;
export const FOLLOWUP_NOTE_SHORTCUT_HINT = 'Ctrl+Enter للإضافة';
export const FOLLOWUP_EXPAND_ALL_LABEL = 'فتح كل الأيام';
export const FOLLOWUP_COLLAPSE_ALL_LABEL = 'طي الكل';
export const FOLLOWUP_EXPAND_ALL_THRESHOLD = 3;
export const FOLLOWUP_EMPTY_PARTY_MARK = '—';
export const FOLLOWUP_DIALOG_TITLE = 'متابعة الطلب';
export const FOLLOWUP_NOTES_TAB_LABEL = 'الملاحظات';
export const FOLLOWUP_EVENTS_TAB_LABEL = 'الأحداث';
export const FOLLOWUP_TABS_LABEL = 'أقسام متابعة الطلب';
export const FOLLOWUP_DRAFT_PROMPT = 'تجاهل النص المكتوب؟';
export const FOLLOWUP_DRAFT_LEAVE_LABEL = 'تجاهل';
export const FOLLOWUP_DRAFT_STAY_LABEL = 'متابعة الكتابة';
export const FOLLOWUP_NOTE_EDIT_LABEL = 'تعديل';
export const FOLLOWUP_NOTE_SAVE_LABEL = 'حفظ';
export const FOLLOWUP_NOTE_CANCEL_LABEL = 'إلغاء';
export const FOLLOWUP_NOTE_DELETE_LABEL = 'حذف';
export const FOLLOWUP_NOTE_DELETE_CONFIRM_LABEL = 'تأكيد الحذف';
export const FOLLOWUP_NOTE_EDITED_TAG = 'معدّلة';
export const FOLLOWUP_NEW_LINE_TAG = 'جديد';
export const FOLLOWUP_NOTE_NO_WRITER = '—';
export const FOLLOWUP_TODAY_LABEL = 'اليوم';
export const FOLLOWUP_LEGACY_TAG = 'سابق';
export const FOLLOWUP_CARRIER_TEXTS_LABEL = 'حالات جهة الشحن';
export const FOLLOWUP_CARRIER_CONTACTS_LABEL = 'بيانات المندوب';
export const FOLLOWUP_CARRIER_REPEAT_PREFIX = '×';
export const FOLLOWUP_CARRIER_REASON_SEPARATOR = ' — ';

export const repeatsSuffix = (repeats: number): string =>
  repeats > 1 ? ` ${FOLLOWUP_CARRIER_REPEAT_PREFIX}${repeats}` : '';

export const followupCarrierLineKey = (day: string, line: FollowupCarrierText): string =>
  `${day}|${line.at}|${line.text}|${line.reason ?? ''}`;

export const FOLLOWUP_LEGACY_NAME_LABELS: Partial<Record<string, string>> = {
  ATTEMPTED: 'متابعة',
  POSTPONED: 'تأجيل',
  OVERDUE: 'متأخر',
};

export const FOLLOWUP_NOTES_BUTTON_LABEL = 'الملاحظات';
export const FOLLOWUP_ACTION_LOG_BUTTON_LABEL = 'سجل الإجراءات';
export const FOLLOWUP_COURIER_COLUMN_LABEL = 'المندوب';
export const FOLLOWUP_ACTIONS_COLUMN_LABEL = 'المتابعة';

export const CHAT_LIVE_LABEL = 'مباشر';
export const CHAT_RECONNECTING_LABEL = 'جارٍ إعادة الاتصال…';
export const CHAT_OFFLINE_LABEL = 'غير متصل';
export const CHAT_LAST_SYNC_PREFIX = 'آخر تحديث من تيربو';
export const CHAT_REFRESH_LABEL = 'تحديث';
export const CHAT_SEND_LABEL = 'إرسال الرسالة';
export const CHAT_ENTER_HINT = 'Enter للإرسال · Shift+Enter لسطر جديد';
export const CHAT_SENT_BY_PREFIX = 'أرسلها:';
export const CHAT_STORE_ACCOUNT_LABEL = 'من حساب المتجر';
export const CHAT_SENDING_LABEL = 'جارٍ الإرسال';
export const CHAT_SENT_STATE_LABEL = 'أُرسلت';
export const CHAT_NOT_SENT_LABEL = 'لم تُرسل';
export const CHAT_RETRY_LABEL = 'إعادة المحاولة';
export const CHAT_RETRY_ARIA_LABEL = 'إعادة إرسال الرسالة';
export const CHAT_RESENT_LABEL = 'أُعيد إرسالها';
export const CHAT_LOCATION_LABEL = 'عرض الموقع';
export const CHAT_SEND_ERROR_LABELS: Record<CarrierChatSendError, string> = {
  CARRIER_REFUSED: 'تيربو رفضت الإرسال على هذه الشحنة',
  NOT_FOUND: 'الشحنة غير موجودة لدى تيربو',
  AUTH: 'تعذر الدخول إلى حساب تيربو',
  REJECTED: 'رفضت تيربو الرسالة',
  UNREACHABLE: 'تعذر الاتصال بتيربو',
  UNCONFIRMED: 'لم تؤكد تيربو وصول الرسالة',
};

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
  CARRIER_EVENT: 'ملاحظة شركة الشحن',
};

export { ACTION_EVENT_NAME_LABELS } from '@/constants/followupEventLabels';
