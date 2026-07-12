export type InvoiceMode = 'singular' | 'package';
export type InvoiceType = 'PURCHASE' | 'RETURN';

export interface InvoiceItem {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  pricePerItem: number;
  total: number;
  pieceCount?: number;
  pricePerPiece?: number;
  variants?: { attribute: string; option: string; attributeOptionId?: number }[];
}
