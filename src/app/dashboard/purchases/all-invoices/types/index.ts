export interface Invoice {
  id: number;
  invoiceNumber: string;
  companyName: string;
  itemsCount: number;
  employeeName: string;
  createdAt: string;
  totalAmount: number;
  transactionType: string;
  acceptanceStatus: string;
  imageUrl?: string;
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
