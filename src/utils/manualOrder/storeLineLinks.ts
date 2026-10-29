export interface StoreLineLinkable {
  sourceIndex?: number;
}

export interface StoreLinkableRow {
  productId: number | null;
  index: number;
}

export const capturedStoreLineIndexes = (rows: readonly StoreLinkableRow[]): number[] =>
  rows.filter((row) => row.productId === null).map((row) => row.index);

export function blockedStoreLinesOf<T extends StoreLineLinkable>(
  products: readonly T[],
  storeLineIndexes: readonly number[],
): number[] {
  const linkedIndexes = new Set(
    products.flatMap((product) => (product.sourceIndex === undefined ? [] : [product.sourceIndex])),
  );
  const unlinkedLines = storeLineIndexes.filter((index) => !linkedIndexes.has(index));
  const hasUnlinkedPick = products.some((product) => product.sourceIndex === undefined);
  return unlinkedLines.length > 0 && hasUnlinkedPick ? unlinkedLines : [];
}
