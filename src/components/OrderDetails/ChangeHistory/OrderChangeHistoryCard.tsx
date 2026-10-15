'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useOrderChangeHistory } from '@/services/orderChangeHistory';
import type { Order } from '@/types/orders';
import { getApiErrorStatus } from '@/utils/apiError';
import { OrderChangeBatchItem } from './OrderChangeBatchItem';

const HIDDEN_ERROR_STATUSES = new Set([403, 404]);
const HISTORY_ITEM = 'history';

export interface OrderChangeHistoryCardProps {
  order: Order;
}

function OrderChangeHistoryList({
  order,
  onUnavailable,
}: {
  order: Order;
  onUnavailable: () => void;
}) {
  const { getStatusLabel } = useStatusLabel();
  const orderProducts = order.order_products;
  const lineProductNames = useMemo(
    () =>
      new Map(
        (orderProducts ?? []).flatMap((line) =>
          line.products?.name ? [[line.id, line.products.name] as const] : []
        )
      ),
    [orderProducts]
  );
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
  } = useOrderChangeHistory(order.id);

  const errorStatus = isError ? getApiErrorStatus(error) : undefined;
  const isUnavailable = errorStatus !== undefined && HIDDEN_ERROR_STATUSES.has(errorStatus);

  useEffect(() => {
    if (isUnavailable) onUnavailable();
  }, [isUnavailable, onUnavailable]);

  if (isUnavailable) return null;

  if (isError) {
    return (
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
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const batches = [
    ...new Map(data.pages.flatMap((page) => page.data).map((batch) => [batch.id, batch])).values(),
  ];

  return batches.length === 0 ? (
    <p className="text-sm text-gray-400 text-center py-4">لا توجد تعديلات مسجلة</p>
  ) : (
    <div className="flex flex-col gap-3">
      {batches.map((batch) => (
        <OrderChangeBatchItem
          key={batch.id}
          batch={batch}
          getStatusLabel={getStatusLabel}
          lineProductNames={lineProductNames}
        />
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
  );
}

function OrderChangeHistoryCard({ order }: OrderChangeHistoryCardProps) {
  const [open, setOpen] = useState('');
  const [everOpened, setEverOpened] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const markUnavailable = useCallback(() => setUnavailable(true), []);

  if (unavailable) return null;

  return (
    <Accordion
      type="single"
      collapsible
      value={open}
      onValueChange={(next) => {
        setOpen(next);
        if (next) setEverOpened(true);
      }}
    >
      <AccordionItem value={HISTORY_ITEM} className="font-medium p-4 bg-gray-50 mt-8 rounded-xl border-b-0">
        <AccordionTrigger className="py-2 text-start">
          <span className="text-lg text-primary font-bold">سجل التعديلات</span>
        </AccordionTrigger>
        <AccordionContent
          forceMount={everOpened || undefined}
          hidden={open !== HISTORY_ITEM}
          className="pt-4 pb-0"
        >
          {everOpened && <OrderChangeHistoryList order={order} onUnavailable={markUnavailable} />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default OrderChangeHistoryCard;
