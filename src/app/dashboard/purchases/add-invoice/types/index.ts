export type InvoiceMode = 'singular' | 'package';
export type InvoiceType = 'PURCHASE' | 'RETURN';

export interface InvoiceItem {
  id: string;
  productId: number;
  name: string;
  count: number;
  unitPrice: number;
  total: number;
  piecesPerPackage?: number;
  piecePrice?: number;
  variants?: { attribute: string; option: string; attributeOptionId?: number }[];
}
