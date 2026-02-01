'use client';

import { SplineAreaChart } from '@/components/ui/charts/SplineAreaChart';
import type { CallDurationItem } from '../types';

interface CallDurationSectionProps {
  items: CallDurationItem[];
  isLoading: boolean;
}

export function CallDurationSection({
  items,
  isLoading,
}: CallDurationSectionProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">متوسط مده المكالمات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg py-5 px-4 border border-gray-100 animate-pulse"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-6 bg-gray-200 rounded" />
              </div>
              <div className="mt-4 h-[150px] bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">متوسط مده المكالمات</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="bg-white rounded-lg py-5 px-4 border border-gray-100"
          >
            <div className="text-center">
              <span className="text-[#000000] font-bold text-sm block mb-2">
                {item.label}
              </span>
            </div>
            <SplineAreaChart
              categories={item.chartCategories}
              series={item.chartSeries}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
