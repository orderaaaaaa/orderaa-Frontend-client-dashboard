import { useCallback, useRef, useState } from 'react';
import {
  useAddStocktakeLinesMutation,
  useRemoveStocktakeLinesMutation,
} from '@/services/stocktake';
import {
  chunkLines,
  STOCKTAKE_LINES_WRITE_LIMIT,
} from '@/app/dashboard/inventory/stock-management/utils/stocktakeSheet';

type SelectionRequest = (chunk: number[]) => Promise<unknown>;

export function useStocktakeSelectionChanges(stocktakeId: number) {
  const { mutateAsync: addLines } = useAddStocktakeLinesMutation(stocktakeId);
  const { mutateAsync: removeLines } = useRemoveStocktakeLinesMutation(stocktakeId);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingCountsRef = useRef(new Map<number, number>());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(() => new Set());

  const enqueue = useCallback(
    (variantIds: number[], request: SelectionRequest): Promise<void> => {
      const ids = Array.from(new Set(variantIds));
      const chunks = chunkLines(ids, STOCKTAKE_LINES_WRITE_LIMIT);
      const counts = pendingCountsRef.current;
      ids.forEach((variantId) => counts.set(variantId, (counts.get(variantId) ?? 0) + 1));
      setPendingIds(new Set(counts.keys()));

      const run = queueRef.current.then(async () => {
        for (const chunk of chunks) {
          await request(chunk);
        }
      });
      queueRef.current = run.catch(() => undefined);

      return run.finally(() => {
        ids.forEach((variantId) => {
          const remaining = (counts.get(variantId) ?? 0) - 1;
          if (remaining > 0) {
            counts.set(variantId, remaining);
          } else {
            counts.delete(variantId);
          }
        });
        setPendingIds(new Set(counts.keys()));
      });
    },
    []
  );

  const add = useCallback(
    (variantIds: number[]) =>
      enqueue(variantIds, (chunk) => addLines({ variantIds: chunk })),
    [enqueue, addLines]
  );

  const remove = useCallback(
    (variantIds: number[], discardCounted = false) =>
      enqueue(variantIds, (chunk) =>
        removeLines({ variantIds: chunk, discardCounted })
      ),
    [enqueue, removeLines]
  );

  return { add, remove, pendingIds };
}
