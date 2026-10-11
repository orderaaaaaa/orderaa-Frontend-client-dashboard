'use client';

import { useMemo } from 'react';
import { PolarAreaChart } from '@/components/ui/charts/PolarAreaChart';
import type { OrderStatusDistributionItem } from '../types';
import { ErrorState } from '@/components/ui/state-panels';
import type { QuerySectionState } from '../hooks';

interface OrderStatusDistributionSectionProps {
  items: OrderStatusDistributionItem[];
  isLoading: boolean;
  error?: QuerySectionState;
}

export function OrderStatusDistributionSection({
  items,
  isLoading,
  error,
}: OrderStatusDistributionSectionProps) {
  const series = useMemo(() => items.map((item) => item.value), [items]);
  const labels = useMemo(() => items.map((item) => item.label), [items]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">توزيع حالات الطلبات</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-100 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[300px] aspect-square rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-20 sm:w-24 h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error?.isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">توزيع حالات الطلبات</h2>
        <ErrorState
          error={error.error}
          fallback="تعذّر تحميل توزيع حالات الطلبات"
          onRetry={error.refetch}
        />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">توزيع حالات الطلبات</h2>
        <p className="py-12 text-center text-gray-500">لا توجد بيانات</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">توزيع حالات الطلبات</h2>
      <div className="bg-white rounded-lg p-3 border border-gray-100 min-h-[500px]">
        <PolarAreaChart series={series} labels={labels} />
      </div>
    </section>
  );
}
