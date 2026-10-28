import type { SupplierEmployeeRef } from '@/lib/api/suppliers';

export interface SupplierInvoiceItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  packageCount?: number;
  piecesPerPackage?: number;
  product: { id: number; name: string };
}

export interface SupplierInvoice {
  id: number;
  code: string;
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  totalAmount: number;
  paymentAmount?: number | null;
  externalInvoiceNumber?: string | null;
  createdAt: string;
  createdByEmployee?: SupplierEmployeeRef | null;
  products: SupplierInvoiceItem[];
  images: string[];
}
