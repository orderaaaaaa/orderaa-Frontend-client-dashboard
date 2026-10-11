'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function StockScopeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex min-h-14 items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
          aria-hidden="true"
        >
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
        </li>
      ))}
    </>
  );
}
