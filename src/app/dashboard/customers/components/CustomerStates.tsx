'use client';

import React from 'react';
import { StatsCard } from './StateCardCustomer';
import { useCustomerBadgeCounts } from '../hooks/useCustomerBadgeCounts';
import {
  CUSTOMER_BADGE_DISPLAY_ORDER,
  CUSTOMER_BADGE_LABELS,
  PREMIUM_LABEL,
} from '../constants/SearchConst';
import { formatCount } from '@/utils/formatMoney';
import { useScrollEndFade } from '@/hooks/useScrollEndFade';
import { ScrollEndFade } from '@/components/ui/scroll-end-fade';
import type {
  CustomerBadge,
  CustomerBadgeCounts,
  CustomerBadgeFilter,
  CustomerSegment,
} from '../types/customer';

export type CustomerStatSelection =
  | { kind: 'all' }
  | { kind: 'premium' }
  | { kind: 'badge'; badge: CustomerBadge };

interface CustomerStatesProps {
  enabledBadges: readonly CustomerBadge[];
  activeBadge: CustomerBadgeFilter | '';
  activeSegment: CustomerSegment | '';
  onSelect: (selection: CustomerStatSelection) => void;
}

const BADGE_ICONS: Record<CustomerBadge, string> = {
  loyal: '/Icons/customers.svg',
  bulk: '/Icons/wholesale.svg',
  high: '/Icons/high-value.svg',
  ghost: '/Icons/ghost.svg',
  window: '/Icons/online-viewer.svg',
};

const showCount = (
  counts: CustomerBadgeCounts | undefined,
  key: keyof CustomerBadgeCounts
) => (counts ? formatCount(counts[key]) : '—');

export default function CustomerStates({
  enabledBadges,
  activeBadge,
  activeSegment,
  onSelect,
}: CustomerStatesProps) {
  const { data: counts, isError, refetch, isFetching } = useCustomerBadgeCounts();
  const { ref, hasMoreAtEnd } = useScrollEndFade<HTMLDivElement>();

  const noFilter = !activeBadge && activeSegment !== 'premium';
  const premiumActive = !activeBadge && activeSegment === 'premium';
  const hasPremium = enabledBadges.some(
    (badge) => badge === 'loyal' || badge === 'high' || badge === 'bulk'
  );
  const badges = CUSTOMER_BADGE_DISPLAY_ORDER.filter((badge) =>
    enabledBadges.includes(badge)
  );

  return (
    <div className="w-full mb-4 px-4" dir="rtl">
      {isError && (
        <div
          role="alert"
          className="mb-2 flex flex-wrap items-center gap-2 text-sm text-red-600"
        >
          <span>تعذّر تحميل أعداد الشارات</span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-3 rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      <div className="relative">
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin sm:grid sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 sm:overflow-x-visible sm:pb-0"
        >
          <div className="min-w-[160px] sm:min-w-0">
            <StatsCard
              iconSrc="/Icons/orders.svg"
              label="جميع العملاء"
              value={showCount(counts, 'total')}
              isActive={noFilter}
              onClick={() => onSelect({ kind: 'all' })}
            />
          </div>
          {hasPremium && (
            <div className="min-w-[160px] sm:min-w-0">
              <StatsCard
                iconSrc="/Icons/premium.svg"
                label={PREMIUM_LABEL}
                value={showCount(counts, 'premium')}
                isActive={premiumActive}
                onClick={() => onSelect({ kind: 'premium' })}
              />
            </div>
          )}
          {badges.map((badge) => (
            <div key={badge} className="min-w-[160px] sm:min-w-0">
              <StatsCard
                iconSrc={BADGE_ICONS[badge]}
                label={CUSTOMER_BADGE_LABELS[badge]}
                value={showCount(counts, badge)}
                isActive={activeBadge === badge}
                onClick={() => onSelect({ kind: 'badge', badge })}
              />
            </div>
          ))}
        </div>
        <ScrollEndFade visible={hasMoreAtEnd} className="sm:hidden" />
      </div>
    </div>
  );
}
