'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function StockScopeCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
