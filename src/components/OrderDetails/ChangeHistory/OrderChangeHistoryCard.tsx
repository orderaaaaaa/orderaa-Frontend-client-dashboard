'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import type { Order } from '@/types/orders';
import { OrderChangeBatchItem } from './OrderChangeBatchItem';
import {
  OrderChangeHistoryError,
  OrderChangeHistoryLoadMore,
  OrderChangeHistorySkeleton,
} from './OrderChangeHistoryStates';
import { useOrderChangeBatches } from './useOrderChangeBatches';

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
  const { query, batches, lineProductNames, isUnavailable, isFailed, isLoading } =
    useOrderChangeBatches(order, true);

  useEffect(() => {
    if (isUnavailable) onUnavailable();
  }, [isUnavailable, onUnavailable]);

  if (isUnavailable) return null;

  if (isFailed) {
    return <OrderChangeHistoryError isRefetching={query.isRefetching} onRetry={() => query.refetch()} />;
  }

  if (isLoading) return <OrderChangeHistorySkeleton />;

  return batches.length === 0 ? (
    <p className="text-sm text-muted-foreground text-center py-4">لا توجد تعديلات مسجلة</p>
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
      {query.hasNextPage && (
        <OrderChangeHistoryLoadMore
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
        />
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
      <AccordionItem value={HISTORY_ITEM} className="font-medium p-4 bg-card border border-border mt-8 rounded-xl">
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
