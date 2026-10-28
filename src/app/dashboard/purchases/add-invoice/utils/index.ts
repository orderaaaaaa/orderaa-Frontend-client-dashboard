import type { CreateInvoiceProductDto, InvoiceProductApiItem, SupplierInvoiceApiItem } from '@/lib/api/suppliers';
import { roundMoney } from '@/utils/money';
import type { AddInvoiceFormData } from '../schema';
import type { InvoiceMode } from '../types';
import type { PaymentStatus } from '../components/InvoiceDropdowns';

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

export function variantKeyOf(productId: number, optionIds: (number | undefined)[]): string {
  const ids = optionIds.filter((id): id is number => id !== undefined).sort((a, b) => a - b);
  return `${productId}:${ids.join(',')}`;
}

export function invoiceLinesToItems(
  products: InvoiceProductApiItem[],
  mode: InvoiceMode,
): AddInvoiceFormData['items'] {
  const isPackage = mode === 'package';
  return products.map((line) => {
    const piecesPerPackage = isPackage ? line.piecesPerPackage ?? 0 : 0;
    const count = isPackage
      ? line.packageCount ?? (piecesPerPackage > 0 ? line.quantity / piecesPerPackage : 0)
      : line.quantity;
    const unitPrice = isPackage ? roundMoney(line.price * piecesPerPackage) : line.price;
    const variants = (line.variant?.options ?? []).flatMap((option) =>
      option.attribute_option
        ? [{ attribute: '', option: option.attribute_option.name, attributeOptionId: option.attribute_option.id }]
        : [],
    );
    return {
      id: `line-${line.id}`,
      productId: line.productId,
      name:
        variants.length > 0
          ? `${line.product.name} - ${variants.map((v) => v.option).join(' - ')}`
          : line.product.name,
      count,
      unitPrice,
      total: roundMoney(count * unitPrice),
      piecesPerPackage,
      piecePrice: isPackage ? line.price : 0,
      variants,
    };
  });
}

export function invoiceFormDefaults(invoice: SupplierInvoiceApiItem, mode: InvoiceMode): AddInvoiceFormData {
  return {
    invoiceType: invoice.type === 'RETURN' ? 'RETURN' : 'PURCHASE',
    supplierId: invoice.supplierId,
    createdByEmployeeId: invoice.createdByEmployeeId,
    paymentAmount: undefined,
    externalInvoiceNumber: undefined,
    items: invoiceLinesToItems(invoice.products, mode),
    invoiceImage: undefined,
  };
}

export function paymentStatusOfInvoice(invoice: SupplierInvoiceApiItem | undefined): PaymentStatus {
  if (invoice?.paymentStatus === 'PAID') return 'full';
  if (invoice?.paymentStatus === 'PARTIALLY_PAID') return 'partial';
  return 'unpaid';
}

export function partialAmountOfInvoice(invoice: SupplierInvoiceApiItem | undefined): string {
  if (invoice?.paymentStatus !== 'PARTIALLY_PAID' || invoice.paymentAmount == null) return '';
  return String(invoice.paymentAmount);
}
