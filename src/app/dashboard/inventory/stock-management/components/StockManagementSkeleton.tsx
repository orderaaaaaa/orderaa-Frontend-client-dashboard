'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <Skeleton className="size-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ProductStockTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function ProductStockTableSkeleton({
  rows = 4,
  columns = 3,
}: ProductStockTableSkeletonProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4">
        <Skeleton className="size-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="px-4 py-3 bg-[#f1eefa] flex items-center gap-3">
        <Skeleton className="h-4 w-16" />
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-7 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StockListSkeletonProps {
  count?: number;
}

export function StockListSkeleton({ count = 4 }: StockListSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductStockTableSkeleton key={i} />
      ))}
    </div>
  );
}
