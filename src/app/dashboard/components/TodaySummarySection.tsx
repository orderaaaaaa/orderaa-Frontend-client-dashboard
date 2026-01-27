'use client';

import { useMemo } from 'react';
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from '@/components/ui/summary-stat-card';
import type { DashboardSummary } from '../types';
import {
  buildActiveStoppedCards,
  buildOrderStatusCards,
  buildTotalsCards,
} from '../constants';

interface TodaySummarySectionProps {
  summary: DashboardSummary;
  isLoading: boolean;
}

export function TodaySummarySection({
  summary,
  isLoading,
}: TodaySummarySectionProps) {
  const activeStoppedCards = useMemo(
    () => buildActiveStoppedCards(summary),
    [summary],
  );
  const orderStatusCards = useMemo(
    () => buildOrderStatusCards(summary),
    [summary],
  );
  const totalsCards = useMemo(() => buildTotalsCards(summary), [summary]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">ملخص اليوم</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryStatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">ملخص اليوم</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeStoppedCards.map((card) => (
          <SummaryStatCard
            key={card.key}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            label={card.label}
            value={card.value}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStatusCards.map((card) => (
          <SummaryStatCard
            key={card.key}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            label={card.label}
            value={card.value}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {totalsCards.map((card) => (
          <SummaryStatCard
            key={card.key}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            label={card.label}
            value={card.value}
          />
        ))}
      </div>
    </section>
  );
}
