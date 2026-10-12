import { useCallback, useRef, useState } from 'react';

export function usePendingIds<Id extends string | number>() {
  const pendingRef = useRef<Set<Id>>(new Set());
  const [pending, setPending] = useState<ReadonlySet<Id>>(() => new Set());

  const run = useCallback(
    async <Result>(id: Id, task: () => Promise<Result>) => {
      if (pendingRef.current.has(id)) return undefined;
      pendingRef.current.add(id);
      setPending(new Set(pendingRef.current));
      try {
        return await task();
      } finally {
        pendingRef.current.delete(id);
        setPending(new Set(pendingRef.current));
      }
    },
    []
  );

  const isPending = useCallback((id: Id) => pending.has(id), [pending]);

  return { run, isPending };
}
