export interface SupplierProduct {
  productId: number;
  productName: string;
  totalQuantityPurchased: number;
  totalPurchaseAmount: number;
  totalQuantityReturned: number;
  totalReturnAmount: number;
  netAmount: number;
}

export type SortField =
  | 'productName'
  | 'totalQuantityPurchased'
  | 'totalPurchaseAmount'
  | 'totalQuantityReturned'
  | 'netAmount';

export type SortOrder = 'asc' | 'desc';

export type TransactionType = 'PURCHASE' | 'RETURN';

export interface ProductTransaction {
  invoiceId: number;
  invoiceCode: string;
  invoiceType: TransactionType;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
}
