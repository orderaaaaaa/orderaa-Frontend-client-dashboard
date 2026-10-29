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
  switch (supplierInvoiceErrorCode(err)) {
    case SUPPLIER_INVOICE_ERROR_CODES.APPROVED:
      return SUPPLIER_INVOICE_APPROVED_MESSAGE;
    case SUPPLIER_INVOICE_ERROR_CODES.ATTRIBUTE_FORBIDDEN:
      return SUPPLIER_INVOICE_ATTRIBUTE_FORBIDDEN_MESSAGE;
    case SUPPLIER_INVOICE_ERROR_CODES.NOT_FOUND:
      return SUPPLIER_INVOICE_NOT_FOUND_MESSAGE;
    case SUPPLIER_INVOICE_ERROR_CODES.CREATOR_NOT_FOUND:
      return SUPPLIER_INVOICE_CREATOR_NOT_FOUND_MESSAGE;
    default:
      return getApiErrorMessage(err, fallback);
  }
}
