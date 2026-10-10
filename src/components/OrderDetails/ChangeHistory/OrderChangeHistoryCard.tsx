'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useOrderChangeHistory } from '@/services/orderChangeHistory';
import { getApiErrorStatus } from '@/utils/apiError';
import { OrderChangeBatchItem } from './OrderChangeBatchItem';

const HIDDEN_ERROR_STATUSES = new Set([403, 404]);

function HistoryCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
      <h2 className="text-lg text-primary font-bold mb-4">سجل التعديلات</h2>
      {children}
    </div>
  );
}

export interface OrderChangeHistoryCardProps {
  orderId: number;
}

function OrderChangeHistoryCard({ orderId }: OrderChangeHistoryCardProps) {
  const { getStatusLabel } = useStatusLabel();
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrderChangeHistory(orderId);

  if (isError) {
    const status = getApiErrorStatus(error);
    if (status !== undefined && HIDDEN_ERROR_STATUSES.has(status)) return null;
    return (
      <HistoryCard>
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-red-600">تعذر تحميل سجل التعديلات</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isRefetching}
            onClick={() => refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      </HistoryCard>
    );
  }

  if (isLoading || !data) {
    return (
      <HistoryCard>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </HistoryCard>
    );
  }

  const batches = [
    ...new Map(data.pages.flatMap((page) => page.data).map((batch) => [batch.id, batch])).values(),
  ];

  return (
    <HistoryCard>
      {batches.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">لا توجد تعديلات مسجلة</p>
      ) : (
        <div className="flex flex-col gap-3">
          {batches.map((batch) => (
            <OrderChangeBatchItem key={batch.id} batch={batch} getStatusLabel={getStatusLabel} />
          ))}
          {hasNextPage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-center text-primary"
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              عرض المزيد
            </Button>
          )}
        </div>
      )}
    </HistoryCard>
  );
}

export default OrderChangeHistoryCard;
