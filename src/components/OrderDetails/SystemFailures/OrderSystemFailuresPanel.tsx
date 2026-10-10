'use client';

import React from 'react';
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

export interface OrderSystemFailuresPanelProps {
  order: Order;
  renderActions?: (failure: OrderSystemFailure) => React.ReactNode;
}

function PanelCard({
  unseenTotal,
  action,
  children,
}: {
  unseenTotal?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="font-medium p-4 bg-gray-50 mt-8 rounded-xl">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg text-primary font-bold">سجل أعطال النظام</h2>
          {!!unseenTotal && (
            <span
              className="min-w-6 h-6 px-1.5 text-sm rounded-full bg-red-600 text-white flex items-center justify-center"
              title="أعطال لم يتم الاطلاع عليها"
            >
              {unseenTotal}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
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

  if (isError) {
    const status = getApiErrorStatus(error);
    if (status !== undefined && HIDDEN_ERROR_STATUSES.has(status)) return null;
    return (
      <PanelCard>
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-red-600">تعذر تحميل سجل أعطال النظام</p>
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
      <PanelCard>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </PanelCard>
    );
  }

  const firstPage = data.pages[0];
  const failures = data.pages.flatMap((page) => page.data);
  const unseenTotal = firstPage?.unseenTotal ?? 0;
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
    <PanelCard unseenTotal={unseenTotal} action={markAllAction}>
      {failures.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">لا توجد أعطال مسجلة لهذا الطلب</p>
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
