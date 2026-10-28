import { getApiErrorMessage, getApiErrorStatus } from '@/utils/apiError';

export const STOCKTAKE_ERROR_MESSAGES: Record<string, string> = {
  STOCKTAKE_ALREADY_OPEN: 'توجد جلسة جرد مفتوحة لهذا المخزن بالفعل',
  STOCKTAKE_NOT_OPEN: 'هذه الجلسة لم تعد مفتوحة للتعديل',
  STOCKTAKE_NOT_FOUND: 'جلسة الجرد غير موجودة',
  STOCKTAKE_LINE_UNKNOWN_VARIANT: 'أحد المتغيرات لا ينتمي إلى هذه الجلسة',
  STOCKTAKE_NOTHING_COUNTED: 'لم يتم إدخال أي عدد قبل الترحيل',
  WAREHOUSE_NOT_FOUND: 'المخزن غير موجود',
  ADJUSTMENT_BELOW_ZERO:
    'تعذر الترحيل لأن الرصيد الحالي لا يكفي لأحد الفروقات السالبة، ولم يتم ترحيل أي سطر',
};

export const STOCKTAKE_FORBIDDEN_MESSAGE = 'ليس لديك صلاحية لتنفيذ هذا الإجراء';

export function getStocktakeErrorMessage(err: unknown, fallback: string): string {
  if (getApiErrorStatus(err) === 403) return STOCKTAKE_FORBIDDEN_MESSAGE;
  const code = (err as { response?: { data?: { code?: unknown } } })?.response?.data?.code;
  if (typeof code === 'string' && STOCKTAKE_ERROR_MESSAGES[code]) {
    return STOCKTAKE_ERROR_MESSAGES[code];
  }
  return getApiErrorMessage(err, fallback);
}
