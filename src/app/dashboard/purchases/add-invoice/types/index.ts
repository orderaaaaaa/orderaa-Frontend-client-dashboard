export type InvoiceMode = 'singular' | 'package';
export type InvoiceType = 'purchases' | 'returns';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  pricePerItem: number;
  total: number;
  pieceCount?: number;
  pricePerPiece?: number;
}
