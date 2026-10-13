import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  PRODUCT_CREATE_ERROR_CODES,
  PRODUCT_EDIT_ERROR_CODES,
  type ProductApiErrorBody,
  type ProductApiErrorCode,
  type VariantDeleteBlocker,
} from '../types/products';

const KNOWN_CODES: readonly string[] = [
  ...PRODUCT_CREATE_ERROR_CODES,
  ...PRODUCT_EDIT_ERROR_CODES,
];

const isKnownCode = (code: unknown): code is ProductApiErrorCode =>
  typeof code === 'string' && KNOWN_CODES.includes(code);

export const VARIANT_DELETE_REASON_LABELS: Record<VariantDeleteBlocker, string> = {
  HAS_ORDER_LINES: 'عليه طلبات',
  HAS_STOCK: 'له سجل مخزون',
  HAS_MOVEMENTS: 'له حركات مخزون',
  HAS_INVOICE_LINES: 'عليه فواتير شراء',
};

export const isVariantDeleteBlocker = (
  value: unknown,
): value is VariantDeleteBlocker =>
  typeof value === 'string' && value in VARIANT_DELETE_REASON_LABELS;

export function productApiErrorBody(error: unknown): ProductApiErrorBody | null {
  const data = (
    error as { response?: { data?: Partial<ProductApiErrorBody> } }
  )?.response?.data;
  if (!data || !isKnownCode(data.code)) return null;
  return { code: data.code, message: data.message ?? '', details: data.details };
}

const ARABIC_TEXT = /[؀-ۿ]/;

const joinValues = (values?: string[]) =>
  values && values.length > 0 ? `: ${values.join('، ')}` : '';

export function productApiErrorMessage(error: unknown, fallback: string): string {
  const body = productApiErrorBody(error);
  if (!body) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === undefined || status >= 500) return fallback;
    const message = getApiErrorMessage(error, fallback);
    return ARABIC_TEXT.test(message) ? message : fallback;
  }
  const details = body.details ?? {};
  switch (body.code) {
    case 'DUPLICATE_ATTRIBUTE_NAME':
      return `يوجد متغيران بنفس الاسم${joinValues(details.names)}`;
    case 'DUPLICATE_OPTION_NAME':
      return `توجد قيمتان متكررتان في المتغير ${details.attribute ?? ''}${joinValues(details.names)}`;
    case 'VARIANT_OPTIONS_INVALID':
      return ARABIC_TEXT.test(body.message)
        ? body.message
        : 'أحد صفوف المتغيرات لا يطابق قيم المتغيرات، راجع الصفوف وحاول مرة أخرى';
    case 'DUPLICATE_VARIANT_COMBINATION':
      return 'يوجد صفان بنفس مجموعة القيم';
    case 'VARIANT_COMBINATIONS_INCOMPLETE':
      return 'يجب إضافة صف لكل مجموعة من قيم المتغيرات';
    case 'TOO_MANY_VARIANTS':
      return `الحد الأقصى لعدد صفوف المتغيرات هو ${details.limit ?? 100}`;
    case 'TOO_MANY_ATTRIBUTES':
      return `الحد الأقصى لعدد المتغيرات هو ${details.limit ?? 10}`;
    case 'TOO_MANY_OPTIONS':
      return `الحد الأقصى لقيم المتغير ${details.attribute ?? ''} هو ${details.limit ?? 100}`;
    case 'IMAGE_URL_INVALID':
      return 'تعذر استخدام إحدى الصور، أعد رفعها وحاول مرة أخرى';
    case 'DUPLICATE_SKU_IN_REQUEST':
      return `رمز SKU مكرر بين صفوف المتغيرات${joinValues(details.values)}`;
    case 'DUPLICATE_BARCODE_IN_REQUEST':
      return `الباركود مكرر بين صفوف المتغيرات${joinValues(details.values)}`;
    case 'SKU_TAKEN':
      return `رمز SKU مستخدم بالفعل${joinValues(details.values)}`;
    case 'BARCODE_TAKEN':
      return `الباركود مستخدم بالفعل${joinValues(details.values)}`;
    case 'PRODUCT_NOT_FOUND':
      return 'المنتج غير موجود أو تم حذفه';
    case 'VARIANT_NOT_FOUND':
      return 'أحد المتغيرات لم يعد موجوداً، أعد تحميل الصفحة';
    case 'VARIANT_COMBINATION_TAKEN':
      return 'يوجد بالفعل متغير بنفس مجموعة القيم';
    case 'VARIANT_IN_USE':
      return isVariantDeleteBlocker(details.reason)
        ? `لا يمكن حذف المتغير لأنه ${VARIANT_DELETE_REASON_LABELS[details.reason]}`
        : 'لا يمكن حذف المتغير لأنه مستخدم';
    case 'VARIANT_STORE_LINK_CONFIRMATION_REQUIRED':
      return 'هذا المتغير مرتبط بمتجرك، أكّد الحذف أولاً';
    case 'DUPLICATE_VARIANT_IN_REQUEST':
      return 'نفس المتغير مذكور مرتين';
  }
}

export function toastProductError(error: unknown, fallback: string) {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status === 401 || status === 403) return;
  toast.error(productApiErrorMessage(error, fallback));
}
