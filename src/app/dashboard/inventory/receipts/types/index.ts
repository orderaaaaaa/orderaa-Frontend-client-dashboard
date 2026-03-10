export interface Receipt {
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

export interface ReceiptFilters {
  searchQuery: string;
  supplierName: string;
  itemsCount: string;
  employeeName: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
