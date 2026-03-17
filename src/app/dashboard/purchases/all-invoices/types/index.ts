export interface InvoiceProduct {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt?: string;
  product: { id: number; name: string };
}

export interface Invoice {
  id: number;
  code: string;
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  supplierId: number;
  supplier: { id: number; name: string; nickname: string };
  createdByEmployee?: { id: number; accessLevel: string; department: string };
  totalAmount: number;
  paymentAmount?: number;
  externalInvoiceNumber?: string;
  products: InvoiceProduct[];
  files: { url?: string }[];
  createdAt: string;
  updatedAt: string;
  acceptanceStatus?: string;
}

export interface InvoiceFilters {
  searchQuery: string;
  supplierName: string;
  transactionType: string;
  acceptanceStatus: string;
  totalAmount: string;
  employeeName: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
