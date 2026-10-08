import { ReceivingStatus } from '@/components/purchases/receivingStatus';
import type { InvoicePaymentStatus } from '@/lib/api/suppliers';

export interface ReceiptProduct {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
  price: number;
  packageCount?: number;
  piecesPerPackage?: number;
  createdAt?: string;
  product: { id: number; name: string };
}

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
}

export interface ReceiptFilters {
  searchQuery: string;
  supplierName: string;
  transactionType: string;
  receivingStatus: ReceivingStatus;
  totalAmountFrom: string;
  totalAmountTo: string;
  employeeName: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
