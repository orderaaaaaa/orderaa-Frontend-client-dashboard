export interface SupplierProduct {
  id: number;
  name: string;
  image: string;
  purchasedQuantity: number;
  totalPurchase: number;
  totalReturned: number;
  totalNet: number;
}

export type SortField =
  | 'name'
  | 'purchasedQuantity'
  | 'totalPurchase'
  | 'totalReturned'
  | 'totalNet';

export type SortOrder = 'asc' | 'desc';

export type TransactionType = 'purchase' | 'return';

export interface ProductTransaction {
  id: number;
  date: string;
  quantity: number;
  totalPrice: number;
  type: TransactionType;
}
