'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function StockScopeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </li>
      ))}
    </>
  );
}
