import type { InvoicePaymentStatus } from '@/lib/api/suppliers';
import { formatMoney } from '@/utils/formatMoney';

export const INVOICE_TYPE_LABEL: Record<string, string> = {
  PURCHASE: 'مشتريات',
  RETURN: 'مرتجع',
  PAID: 'مدفوع',
};

export const isNegativeInvoiceAmount = (type: string): boolean => type === 'RETURN' || type === 'PAID';

export const invoiceTypeLabel = (invoice: { type: string; reversesInvoiceId?: number | null }): string =>
  invoice.type === 'PAID' && invoice.reversesInvoiceId != null
    ? 'عكس دفعة'
    : INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type;

export const signedInvoiceAmount = (invoice: { type: string; totalAmount: number }): string =>
  `${isNegativeInvoiceAmount(invoice.type) ? '-' : '+'}${formatMoney(String(Math.abs(invoice.totalAmount)))}`;

export const INVOICE_PAYMENT_STATUS_LABEL: Record<InvoicePaymentStatus, string> = {
  NOT_PAID: 'غير مدفوع',
  PARTIALLY_PAID: 'مدفوع جزئياً',
  PAID: 'مدفوع بالكامل',
};
