interface CountableVariant {
  quantity: number | '';
}

export function isEveryLineCounted(
  invoiceProductIds: number[],
  productVariants: Record<number, CountableVariant[]>,
): boolean {
  return invoiceProductIds.every((id) => {
    const entries = productVariants[id] ?? [];
    return entries.length > 0 && entries.every((entry) => typeof entry.quantity === 'number');
  });
}
