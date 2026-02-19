export type InvoiceMode = 'singular' | 'package';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  pricePerItem: number;
  total: number;
  pieceCount?: number;
  pricePerPiece?: number;
}
