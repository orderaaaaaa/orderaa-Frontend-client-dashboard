import { InvoiceListTab } from '@/components/purchases/receivingStatus';
import type {
  InvoiceLifecycle,
  InvoicePaymentStatus,
  InvoiceProductApiItem,
  SupplierEmployeeRef,
} from '@/lib/api/suppliers';

export type InvoiceProduct = InvoiceProductApiItem;

export interface Invoice {
  id: number;
  code: string;
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  supplierId: number;
  supplier: { id: number; name: string; nickname: string };
  createdByEmployee?: SupplierEmployeeRef | null;
  approvedByEmployee?: SupplierEmployeeRef | null;
  totalAmount: number;
  paymentAmount: number | null;
  paymentStatus: InvoicePaymentStatus;
  externalInvoiceNumber: string | null;
  products: InvoiceProduct[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  approvedAt: string | null;
  lifecycle: InvoiceLifecycle;
  settlesInvoiceId: number | null;
  reversesInvoiceId: number | null;
  reversedByInvoiceId: number | null;
}

export interface InvoiceFilters {
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
