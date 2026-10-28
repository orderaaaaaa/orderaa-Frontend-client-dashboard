import type { InvoicePaymentStatus } from '@/lib/api/suppliers';

export const INVOICE_TYPE_LABEL: Record<string, string> = {
  PURCHASE: 'مشتريات',
  RETURN: 'مرتجع',
  PAID: 'مدفوع',
};

export const INVOICE_PAYMENT_STATUS_LABEL: Record<InvoicePaymentStatus, string> = {
  NOT_PAID: 'غير مدفوع',
  PARTIALLY_PAID: 'مدفوع جزئياً',
  PAID: 'مدفوع بالكامل',
};
