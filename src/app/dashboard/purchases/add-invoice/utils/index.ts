import type { CreateInvoiceProductDto } from '@/lib/api/suppliers';
import { roundMoney } from '@/utils/money';
import type { AddInvoiceFormData } from '../schema';
import type { InvoiceMode } from '../types';

export function buildProductsPayload(
  items: AddInvoiceFormData['items'],
  invoiceMode: InvoiceMode,
): CreateInvoiceProductDto[] {
  // Rows left at zero are dropped, never sent: "add all variants"
  // creates a row per variant and the user fills only the ones the
  // supplier actually shipped.
  return items
    .filter((item) => (item.count ?? 0) > 0)
    .map((item) => ({
      productId: item.productId,
      quantity: invoiceMode === 'package' ? (item.count ?? 0) * (item.piecesPerPackage ?? 0) : item.count,
      price: invoiceMode === 'package' ? (item.piecePrice ?? 0) : item.unitPrice,
      packageCount: invoiceMode === 'package' ? item.count : undefined,
      piecesPerPackage: invoiceMode === 'package' ? item.piecesPerPackage : undefined,
      attributeOptionIds: (item.variants ?? []).map((v) => v.attributeOptionId).filter((id): id is number => id !== undefined),
    }));
}

export function payloadTotal(products: CreateInvoiceProductDto[]): number {
  return roundMoney(products.reduce((sum, p) => sum + p.quantity * p.price, 0));
}
