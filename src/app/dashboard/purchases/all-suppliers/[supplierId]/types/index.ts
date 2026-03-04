export interface SupplierInvoiceItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SupplierInvoice {
  id: number;
  invoiceNumber: string;
  companyName: string;
  employeeName: string;
  createdByName: string;
  itemsCount: number;
  createdAt: string;
  totalAmount: number;
  transactionType: string;
  items: SupplierInvoiceItem[];
}
