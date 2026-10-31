'use client';

import { formatDateTime } from '@/utils/format';
import React, { useState } from 'react';
import { LiaCheckSolid, LiaChevronDownSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import {
  ORDER_SYSTEM_FAILURE_SOURCE_LABELS,
  actorTypeLabelOf,
  isInfoCode,
  orderSystemFailureLabelKeyOf,
} from '@/constants/orderSystemFailures';
import { useI18n } from '@/i18n/I18nProvider';
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
  const { t, locale } = useI18n();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isUnseen = failure.seenAt === null;
  const isInfo = isInfoCode(failure.code);
  const actorLabel = actorTypeLabelOf(failure.actorType);
  const repeated = failure.occurrenceCount > 1;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-gray-200 bg-card p-3',
        isUnseen && 'border-s-4',
        isUnseen && (isInfo ? 'border-s-muted-foreground' : 'border-s-destructive'),
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
                  isInfo ? 'bg-muted-foreground' : 'bg-destructive'
                )}
              />
            )}
            <span
              className={cn(
                'text-sm font-bold break-words',
                isInfo ? 'text-muted-foreground' : 'text-foreground'
              )}
            >
              {t(orderSystemFailureLabelKeyOf(failure.code))}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-text text-xs font-semibold">
              {ORDER_SYSTEM_FAILURE_SOURCE_LABELS[failure.source] ?? failure.source}
            </span>
            {actorLabel && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                {actorLabel}
              </span>
            )}
            {repeated && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {t('orderSystemFailures.item.repeated', { count: failure.occurrenceCount })}
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
              {t('orderSystemFailures.item.seen')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {repeated ? (
          <>
            <span>{t('orderSystemFailures.item.firstOccurred', { time: formatDateTime(failure.firstOccurredAt) })}</span>
            <span>
              {t('orderSystemFailures.item.lastOccurred', {
                time: formatDateTime(failure.lastOccurredAt),
                ago: getTimeAgo(failure.lastOccurredAt, locale),
              })}
            </span>
          </>
        ) : (
          <span>
            {formatDateTime(failure.lastOccurredAt)} ({getTimeAgo(failure.lastOccurredAt, locale)})
          </span>
        )}
      </div>

      {!isUnseen && failure.seenAt && (
        <span className="text-xs text-gray-500">
          {failure.seenByName
            ? t('orderSystemFailures.item.seenBy', { name: failure.seenByName })
            : t('orderSystemFailures.item.seenDone')}{' '}
          {formatDateTime(failure.seenAt)}
        </span>
      )}

      {failure.details && (
        <div>
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="flex items-center gap-1 text-sm font-semibold text-primary-text"
          >
            {t('orderSystemFailures.item.details')}
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
