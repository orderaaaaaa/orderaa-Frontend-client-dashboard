import React from 'react';
import { StatCard } from './StatCard';
import { PrintOrderStatistics } from '../../types';
import { LiaBoxOpenSolid, LiaCheckCircleSolid, LiaFileAltSolid, LiaPrintSolid } from 'react-icons/lia';

interface StatisticsSectionProps {
  statistics: PrintOrderStatistics | null;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <StatCard
        icon={<LiaCheckCircleSolid className="w-8 h-8 text-primary" />}
        label="الطلبات المؤكدة"
        desc="جاهزة للطباعة"
        value={statistics?.totalConfirmedOrders ?? 0}
      />
      <StatCard
        icon={<LiaPrintSolid className="w-8 h-8 text-primary" />}
        label="الطلبات الغير مطبوعة"
        desc="بحاجة للطباعة"
        value={statistics?.confirmedNotPrintedOrders ?? 0}
      />
      <StatCard
        icon={<LiaFileAltSolid className="w-8 h-8 text-primary" />}
        label="الطلبات المطبوعة"
        desc="تم الطباعة"
        value={statistics?.confirmedPrintedOrders ?? 0}
      />
      <StatCard
        icon={<LiaBoxOpenSolid className="w-8 h-8 text-primary" />}
        label="الطلبات المحضرة"
        desc="جاهزة للشحن"
        value={statistics?.totalPreparedOrders ?? 0}
      />
    </div>
  );
}
