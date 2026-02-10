'use client';

import { PolarAreaChart } from '@/components/ui/charts/PolarAreaChart';
import type { OrderStatusDistributionItem } from '../types';

interface OrderStatusDistributionSectionProps {
  items: OrderStatusDistributionItem[];
  isLoading: boolean;
}

export function OrderStatusDistributionSection({
  items,
  isLoading,
}: OrderStatusDistributionSectionProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">توزيع حالات الطلبات</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-100 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="w-[300px] h-[300px] rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-24 h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
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

  const series = items.map((item) => item.value);
  const labels = items.map((item) => item.label);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">توزيع حالات الطلبات</h2>
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <PolarAreaChart series={series} labels={labels} />
      </div>
    </section>
  );
}
