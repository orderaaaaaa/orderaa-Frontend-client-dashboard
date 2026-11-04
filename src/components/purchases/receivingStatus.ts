import { INVOICE_LIFECYCLE, type GetSupplierInvoicesParams, type InvoiceLifecycle } from '@/lib/api/suppliers';

export const RECEIVING_STATUSES = ['pending', 'received', 'all'] as const;
export type ReceivingStatus = (typeof RECEIVING_STATUSES)[number];
export const DEFAULT_RECEIVING_STATUS: ReceivingStatus = 'pending';
export const receivingStatusToApproved = (status: ReceivingStatus): boolean | undefined =>
  status === 'all' ? undefined : status === 'received';

export const INVOICE_LIST_TABS = ['pending', 'received', 'open-changed', 'all'] as const;
export type InvoiceListTab = (typeof INVOICE_LIST_TABS)[number];
export const INVOICE_LIST_TAB_OPTIONS: { value: InvoiceListTab; label: string }[] = [
  { value: 'pending', label: 'قيد الاستلام' },
  { value: 'received', label: 'مستلمة' },
  { value: 'open-changed', label: 'مفتوحة بعدد مختلف' },
  { value: 'all', label: 'الكل' },
];
export type InvoiceListQuery = Pick<
  GetSupplierInvoicesParams,
  'approved' | 'receivable' | 'lifecycle' | 'countChanged'
>;
export const invoiceListTabToQuery = (tab: InvoiceListTab): InvoiceListQuery => {
  if (tab === 'open-changed') return { lifecycle: INVOICE_LIFECYCLE.OPEN, countChanged: true };
  return { approved: receivingStatusToApproved(tab), receivable: tab !== 'all' || undefined };
};

export const INVOICE_LIFECYCLE_BADGE: Record<InvoiceLifecycle, { label: string; className: string }> = {
  DRAFT: { label: 'قيد الاستلام', className: 'border-border bg-muted text-muted-foreground' },
  OPEN: { label: 'مفتوحة', className: 'border-warning/30 bg-warning/10 text-foreground' },
  CLOSED: { label: 'مغلقة', className: 'border-primary/30 bg-primary/10 text-primary-text' },
};
