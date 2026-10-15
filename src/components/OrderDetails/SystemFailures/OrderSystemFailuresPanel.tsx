'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useMarkAllSystemFailuresSeen,
  useMarkSystemFailureSeen,
  useOrderSystemFailures,
} from '@/services/orderSystemFailures';
import type { Order } from '@/types/orders';
import type { OrderSystemFailure } from '@/types/orderSystemFailures';
import { getApiErrorStatus } from '@/utils/apiError';
import { OrderSystemFailureItem } from './OrderSystemFailureItem';

const HIDDEN_ERROR_STATUSES = new Set([403, 404]);
const ALERTS_ITEM = 'alerts';

export interface OrderSystemFailuresPanelProps {
  order: Order;
  renderActions?: (failure: OrderSystemFailure) => React.ReactNode;
}

function PanelCard({
  open,
  onOpenChange,
  unseenTotal,
  action,
  children,
}: {
  open: string;
  onOpenChange: (value: string) => void;
  unseenTotal?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Accordion type="single" collapsible value={open} onValueChange={onOpenChange}>
      <AccordionItem
        value={ALERTS_ITEM}
        className="font-medium p-4 bg-gray-50 mt-8 rounded-xl border-b-0"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
            <AccordionTrigger className="py-2 text-start">
              <span className="flex items-center gap-2">
                <span className="text-lg text-primary font-bold">تنبيهات الطلب</span>
                {!!unseenTotal && (
                  <span
                    className="min-w-6 h-6 px-1.5 text-sm rounded-full bg-red-600 text-white flex items-center justify-center"
                    title="تنبيهات لم يتم الاطلاع عليها"
                  >
                    {unseenTotal}
                  </span>
                )}
              </span>
            </AccordionTrigger>
          </div>
          {action}
        </div>
        <AccordionContent className="pt-4 pb-0">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function OrderSystemFailuresPanel({ order, renderActions }: OrderSystemFailuresPanelProps) {
  const { hasPermission } = usePermissionCheck();
  const canMarkSeen = hasPermission(PERMISSION_CODES.ORDERS_UPDATE);
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
  } = useOrderSystemFailures(order.id);
  const markSeen = useMarkSystemFailureSeen(order.id);
  const markAllSeen = useMarkAllSystemFailuresSeen(order.id);
  const [open, setOpen] = useState('');
  const [autoDecided, setAutoDecided] = useState(false);

  const handleOpenChange = (value: string) => {
    setAutoDecided(true);
    setOpen(value);
  };

  const firstPage = data?.pages[0];
  const unseenTotal = firstPage?.unseenTotal ?? 0;

  if (data && !autoDecided) {
    setAutoDecided(true);
    if (unseenTotal > 0) setOpen(ALERTS_ITEM);
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    if (status !== undefined && HIDDEN_ERROR_STATUSES.has(status)) return null;
    return (
      <PanelCard open={open} onOpenChange={handleOpenChange}>
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-red-600">تعذر تحميل تنبيهات الطلب</p>
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
      </PanelCard>
    );
  }

  if (isLoading || !data) {
    return (
      <PanelCard open={open} onOpenChange={handleOpenChange}>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </PanelCard>
    );
  }

  const failures = data.pages.flatMap((page) => page.data);
  const markingFailureId = markSeen.isPending ? markSeen.variables?.id : undefined;

  const markAllAction =
    canMarkSeen && unseenTotal > 0 && firstPage ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={markAllSeen.isPending}
        onClick={() => markAllSeen.mutate(firstPage.asOf)}
      >
        تعليم الكل كمقروء
      </Button>
    ) : undefined;

  return (
    <PanelCard open={open} onOpenChange={handleOpenChange} unseenTotal={unseenTotal} action={markAllAction}>
      {failures.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">لا توجد تنبيهات لهذا الطلب</p>
      ) : (
        <div className="flex flex-col gap-3">
          {failures.map((failure) => (
            <OrderSystemFailureItem
              key={failure.id}
              failure={failure}
              order={order}
              canMarkSeen={canMarkSeen}
              isMarkingSeen={markingFailureId === failure.id}
              onMarkSeen={(row) => markSeen.mutate(row)}
              renderActions={renderActions}
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
      )}
    </PanelCard>
  );
}

export default OrderSystemFailuresPanel;
