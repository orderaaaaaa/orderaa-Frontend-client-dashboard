export interface Invoice {
  id: number;
  invoiceNumber: string;
  companyName: string;
  itemsCount: number;
  employeeName: string;
  createdAt: string;
  totalAmount: number;
  transactionType: string;
  imageUrl?: string;
}
