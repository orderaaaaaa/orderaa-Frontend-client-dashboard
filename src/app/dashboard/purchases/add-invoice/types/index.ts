export type InvoiceMode = 'singular' | 'package';
export type InvoiceType = 'PURCHASE' | 'RETURN';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  pricePerItem: number;
  total: number;
  pieceCount?: number;
  pricePerPiece?: number;
  variants?: { label: string; value: string }[];
}
