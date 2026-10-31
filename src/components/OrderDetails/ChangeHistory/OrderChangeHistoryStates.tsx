import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function OrderChangeHistoryError({
  isRefetching,
  onRetry,
}: {
  isRefetching: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-sm text-destructive">تعذر تحميل سجل التعديلات</p>
      <Button type="button" variant="outline" size="sm" loading={isRefetching} onClick={onRetry}>
        إعادة المحاولة
      </Button>
    </div>
  );
}

export function OrderChangeHistorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function OrderChangeHistoryLoadMore({
  isFetchingNextPage,
  onLoadMore,
}: {
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="self-center text-primary"
      loading={isFetchingNextPage}
      onClick={onLoadMore}
    >
      عرض المزيد
    </Button>
  );
}
