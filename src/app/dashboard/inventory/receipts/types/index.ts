import { InvoiceListTab } from '@/components/purchases/receivingStatus';
import type { InvoiceLifecycle, InvoiceProductApiItem, InvoicePaymentStatus } from '@/lib/api/suppliers';

export type ReceiptProduct = InvoiceProductApiItem;

export interface Receipt {
  id: number;
  code: string;
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  supplierId: number;
  supplier: { id: number; name: string; nickname: string };
  createdByEmployee?: { id: number; accessLevel: string; department: string; fullName: string };
  totalAmount: number;
  paymentAmount?: number | null;
  paymentStatus: InvoicePaymentStatus;
  externalInvoiceNumber?: string | null;
  products: ReceiptProduct[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  approvedAt: string | null;
  lifecycle: InvoiceLifecycle;
}

export interface ReceiptFilters {
  searchQuery: string;
  supplierName: string;
  transactionType: string;
  receivingStatus: InvoiceListTab;
  totalAmountFrom: string;
  totalAmountTo: string;
  employeeName: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
