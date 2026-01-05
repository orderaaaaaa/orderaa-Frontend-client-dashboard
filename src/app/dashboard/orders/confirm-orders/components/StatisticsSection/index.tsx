import React from 'react';
import { StatCard } from './StatCard';
import { ConfirmOrderStatistics } from '../../types';
import { CheckCircle2, Truck, XCircle, Clock } from 'lucide-react';

interface StatisticsSectionProps {
  statistics: ConfirmOrderStatistics | null;
  isLoading: boolean;
}

export function StatisticsSection({
  statistics,
  isLoading,
}: StatisticsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg py-5 px-4 shadow-md border border-gray-100 animate-pulse"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex flex-col gap-2">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={<CheckCircle2 className="w-8 h-8 text-green-600" />}
        label="الطلبات المؤكدة"
        value={statistics?.confirmedOrders ?? 0}
      />
      <StatCard
        icon={<Truck className="w-8 h-8 text-blue-600" />}
        label="الطلبات المرسليمها"
        value={statistics?.ordersToDeliver ?? 0}
      />
      <StatCard
        icon={<XCircle className="w-8 h-8 text-red-600" />}
        label="الطلبات المرفوضة"
        value={statistics?.rejectedOrders ?? 0}
      />
      <StatCard
        icon={<Clock className="w-8 h-8 text-orange-600" />}
        label="الطلبات المتبقية"
        value={statistics?.remainingOrders ?? 0}
      />
    </div>
  );
}
