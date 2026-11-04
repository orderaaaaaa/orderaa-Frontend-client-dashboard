import { getApiErrorMessage } from '@/utils/apiError';

export const SUPPLIER_INVOICE_ERROR_CODES = {
  APPROVED: 'SUPPLIER_INVOICE_APPROVED',
  ATTRIBUTE_FORBIDDEN: 'SUPPLIER_INVOICE_ATTRIBUTE_FORBIDDEN',
  NOT_FOUND: 'SUPPLIER_INVOICE_NOT_FOUND',
  CREATOR_NOT_FOUND: 'SUPPLIER_INVOICE_CREATOR_NOT_FOUND',
} as const;

export const SUPPLIER_INVOICE_APPROVED_MESSAGE = 'الفاتورة معتمدة ولا يمكن تعديلها أو حذفها';
export const SUPPLIER_INVOICE_ATTRIBUTE_FORBIDDEN_MESSAGE =
  'لا تملك صلاحية تغيير منشئ الفاتورة';
export const SUPPLIER_INVOICE_NOT_FOUND_MESSAGE = 'الفاتورة غير موجودة أو تم حذفها';
export const SUPPLIER_INVOICE_CREATOR_NOT_FOUND_MESSAGE =
  'الموظف المختار كمنشئ للفاتورة لا ينتمي إلى هذا المتجر';

const SUPPLIER_INVOICE_PASSTHROUGH_FALLBACKS: Record<string, string> = {
  SUPPLIER_INVOICE_PRODUCT_NOT_OWNED: 'بعض المنتجات لا تخص هذا التاجر',
  SUPPLIER_INVOICE_OPEN_EDIT_STOCK_SHORT: 'الكمية المطلوب خصمها من المخزن غير متوفرة',
  SUPPLIER_PAYMENT_EXCEEDS_INVOICE: 'المبلغ أكبر من المتبقي على الفاتورة',
  SUPPLIER_INVOICE_PRODUCT_REQUIRES_VARIANTS: 'المنتج يتطلب تحديد المتغير قبل اعتماد الفاتورة',
  SUPPLIER_INVOICE_APPROVAL_LINE_UNKNOWN: 'البند غير موجود في هذه الفاتورة',
  SUPPLIER_INVOICE_APPROVAL_LINE_DUPLICATE: 'البند مكرر في طلب الاعتماد',
};

const SUPPLIER_INVOICE_STATIC_MESSAGES: Record<string, string> = {
  SUPPLIER_INVOICE_CLOSED: 'الفاتورة مغلقة ولا يمكن تعديلها أو حذفها',
  SUPPLIER_INVOICE_NOT_APPROVED: 'لا يمكن إغلاق فاتورة لم تُعتمد بعد',
  SUPPLIER_INVOICE_NOT_OPEN: 'الفاتورة ليست مفتوحة للتعديل على البنود',
  SUPPLIER_INVOICE_OPEN_EDIT_REQUIRES_VARIANT: 'يجب إدخال أعداد الأصناف للمنتجات التي لها خصائص',
  SUPPLIER_INVOICE_OPEN_EDIT_LINE_INVALID: 'بند الفاتورة غير صالح لهذه الفاتورة',
  SUPPLIER_PAYMENT_IMMUTABLE: 'الدفعة المسجلة لا تُعدَّل ولا تُحذف، سجّل دفعة عكسية بدلاً من ذلك',
  SUPPLIER_PAYMENT_NOT_APPROVABLE: 'الدفعة تُسجَّل مغلقة مباشرة ولا تحتاج إلى اعتماد',
  SUPPLIER_PAYMENT_ALREADY_REVERSED: 'تم عكس هذه الدفعة من قبل',
  SUPPLIER_PAYMENT_NOT_REVERSIBLE: 'لا يمكن عكس هذا السطر',
  SUPPLIER_PAYMENT_TARGET_INVALID: 'الفاتورة المختارة لا يمكن ربط الدفعة بها',
  SUPPLIER_INVOICE_HAS_SETTLEMENTS: 'لا يمكن حذف الفاتورة لوجود مدفوعات مرتبطة بها، اعكس الدفعات أولاً',
  SUPPLIER_PAYMENT_HAS_PRODUCTS: 'لا يمكن إضافة أصناف إلى دفعة مستقلة',
  SUPPLIER_INVOICE_ALREADY_APPROVED: 'الفاتورة معتمدة بالفعل',
  VARIANT_MERGE_INVOICE_COUNT_WAREHOUSE_CONFLICT:
    'لا يمكن دمج الأصناف لأن فاتورة مورد تحتوي عليهما في مخزنين مختلفين',
};

interface SupplierInvoiceErrorBody {
  status?: number;
  code?: string;
  message?: string | string[];
}

function bodyOf(err: unknown): SupplierInvoiceErrorBody | undefined {
  const response = (err as { response?: { status?: number; data?: SupplierInvoiceErrorBody } })
    ?.response;
  if (!response) return undefined;
  return { status: response.status, ...response.data };
}

export function supplierInvoiceErrorCode(err: unknown): string | undefined {
  return bodyOf(err)?.code;
}

export function supplierInvoiceErrorStatus(err: unknown): number | undefined {
  return bodyOf(err)?.status;
}

export function supplierInvoiceErrorMessage(err: unknown, fallback: string): string {
  const code = supplierInvoiceErrorCode(err);
  switch (code) {
    case SUPPLIER_INVOICE_ERROR_CODES.APPROVED:
      return SUPPLIER_INVOICE_APPROVED_MESSAGE;
    case SUPPLIER_INVOICE_ERROR_CODES.ATTRIBUTE_FORBIDDEN:
      return SUPPLIER_INVOICE_ATTRIBUTE_FORBIDDEN_MESSAGE;
    case SUPPLIER_INVOICE_ERROR_CODES.NOT_FOUND:
      return SUPPLIER_INVOICE_NOT_FOUND_MESSAGE;
    case SUPPLIER_INVOICE_ERROR_CODES.CREATOR_NOT_FOUND:
      return SUPPLIER_INVOICE_CREATOR_NOT_FOUND_MESSAGE;
    default:
      if (code && Object.prototype.hasOwnProperty.call(SUPPLIER_INVOICE_STATIC_MESSAGES, code)) {
        return SUPPLIER_INVOICE_STATIC_MESSAGES[code];
      }
      if (code && Object.prototype.hasOwnProperty.call(SUPPLIER_INVOICE_PASSTHROUGH_FALLBACKS, code)) {
        const serverMessage = getApiErrorMessage(err, '');
        return serverMessage || SUPPLIER_INVOICE_PASSTHROUGH_FALLBACKS[code];
      }
      return getApiErrorMessage(err, fallback);
  }
}
