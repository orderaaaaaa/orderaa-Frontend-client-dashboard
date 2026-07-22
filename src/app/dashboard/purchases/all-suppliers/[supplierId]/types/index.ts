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
  paymentAmount?: number;
  externalInvoiceNumber?: string;
  createdAt: string;
  createdByEmployee?: { id: number; accessLevel: string; department: string };
  products: SupplierInvoiceItem[];
  images: string[];
}
