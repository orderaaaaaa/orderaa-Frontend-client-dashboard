'use client';

import { formatDateTime } from '@/utils/format';
import React, { useState } from 'react';
import { LiaCheckSolid, LiaChevronDownSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import {
  ORDER_SYSTEM_FAILURE_SOURCE_LABELS,
  actorTypeLabelOf,
  isNoticeCode,
  orderSystemFailureLabelOf,
} from '@/constants/orderSystemFailures';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/orders';
import type { OrderSystemFailure } from '@/types/orderSystemFailures';
import { getTimeAgo } from '@/utils/timeAgo';
import { FailureDetails } from './details/FailureDetails';


export interface OrderSystemFailureItemProps {
  failure: OrderSystemFailure;
  order: Order;
  canMarkSeen: boolean;
  isMarkingSeen: boolean;
  onMarkSeen: (failure: OrderSystemFailure) => void;
  renderActions?: (failure: OrderSystemFailure) => React.ReactNode;
}

export function OrderSystemFailureItem({
  failure,
  order,
  canMarkSeen,
  isMarkingSeen,
  onMarkSeen,
  renderActions,
}: OrderSystemFailureItemProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isUnseen = failure.seenAt === null;
  const isNotice = isNoticeCode(failure.code);
  const actorLabel = actorTypeLabelOf(failure.actorType);
  const repeated = failure.occurrenceCount > 1;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3',
        isUnseen && 'border-s-4',
        isUnseen && (isNotice ? 'border-s-gray-400' : 'border-s-red-500'),
        !isUnseen && 'opacity-70'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {isUnseen && (
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isNotice ? 'bg-gray-400' : 'bg-red-500'
                )}
              />
            )}
            <span
              className={cn(
                'text-sm font-bold break-words',
                isNotice ? 'text-gray-700' : 'text-[#1F1F1F]'
              )}
            >
              {orderSystemFailureLabelOf(failure.code)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {ORDER_SYSTEM_FAILURE_SOURCE_LABELS[failure.source] ?? failure.source}
            </span>
            {actorLabel && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                {actorLabel}
              </span>
            )}
            {repeated && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                تكرر {failure.occurrenceCount} مرة
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderActions?.(failure)}
          {isUnseen && canMarkSeen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isMarkingSeen}
              onClick={() => onMarkSeen(failure)}
            >
              <LiaCheckSolid />
              تم الاطلاع
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {repeated ? (
          <>
            <span>أول مرة: {formatDateTime(failure.firstOccurredAt)}</span>
            <span>
              آخر مرة: {formatDateTime(failure.lastOccurredAt)} ({getTimeAgo(failure.lastOccurredAt)})
            </span>
          </>
        ) : (
          <span>
            {formatDateTime(failure.lastOccurredAt)} ({getTimeAgo(failure.lastOccurredAt)})
          </span>
        )}
      </div>

      {!isUnseen && failure.seenAt && (
        <span className="text-xs text-gray-500">
          {failure.seenByName ? `اطّلع عليه ${failure.seenByName}` : 'تم الاطلاع عليه'}{' '}
          {formatDateTime(failure.seenAt)}
        </span>
      )}

      {failure.details && (
        <div>
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="flex items-center gap-1 text-sm font-semibold text-primary"
          >
            التفاصيل
            <LiaChevronDownSolid
              className={cn('w-4 h-4 transition-transform', detailsOpen && 'rotate-180')}
            />
          </button>
          {detailsOpen && (
            <div className="mt-2 rounded-md bg-gray-50 p-3">
              <FailureDetails failure={failure} order={order} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderSystemFailureItem;
