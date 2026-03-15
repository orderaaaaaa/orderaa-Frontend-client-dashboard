export interface Supplier {
  id: number;
  nickname: string;
  name: string;
  phoneNumber: string;
  email: string;
  governorate?: string;
  totalPurchased: number;
  totalReturned: number;
  invoiceCount: number;
  paidAmount: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFilters {
  searchQuery: string;
  supplierName: string;
  remainingAmount: string;
  paidAmount: string;
  invoicesCount: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
