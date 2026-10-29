export interface StoreLineLinkable {
  sourceIndex?: number;
}

export interface StoreLinkableRow {
  productId: number | null;
  index: number;
}

export interface StoreLineLinkResolution<T extends StoreLineLinkable> {
  products: T[];
  blockedStoreLines: number[];
}

export const capturedStoreLineIndexes = (rows: readonly StoreLinkableRow[]): number[] =>
  rows.filter((row) => row.productId === null).map((row) => row.index);

export function resolveStoreLineLinks<T extends StoreLineLinkable>(
  products: T[],
  storeLineIndexes: readonly number[],
): StoreLineLinkResolution<T> {
  const linkedIndexes = new Set(
    products.flatMap((product) => (product.sourceIndex === undefined ? [] : [product.sourceIndex])),
  );
  const unlinkedLines = storeLineIndexes.filter((index) => !linkedIndexes.has(index));
  const unlinkedPositions = products.flatMap((product, position) =>
    product.sourceIndex === undefined ? [position] : [],
  );

  if (unlinkedLines.length === 1 && unlinkedPositions.length === 1) {
    const [position] = unlinkedPositions;
    const [sourceIndex] = unlinkedLines;
    return {
      products: products.map((product, index) =>
        index === position ? { ...product, sourceIndex } : product,
      ),
      blockedStoreLines: [],
    };
  }

  const blocked = unlinkedLines.length > 0 && unlinkedPositions.length > 0;
  return { products, blockedStoreLines: blocked ? unlinkedLines : [] };
}
