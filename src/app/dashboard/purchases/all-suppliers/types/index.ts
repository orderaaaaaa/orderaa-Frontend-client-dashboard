export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  totalAmount: number;
  invoicesCount: number;
  paidAmount: number;
  remainingAmount: number;
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
