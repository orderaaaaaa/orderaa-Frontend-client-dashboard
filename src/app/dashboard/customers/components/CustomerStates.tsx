'use client';

import React, { useMemo } from 'react';
import { StatsCard } from './StateCardCustomer';
import { statsData } from '../constants/stateItem';
import { useGetCustomers } from '../hooks/useGetCustomers';

export default function CustomerStates() {
  const { data: allCustomersData } = useGetCustomers({
    page: 1,
    limit: 1,
  });

  const totalOrdersCount =
    allCustomersData?.meta?.totalItems?.toString() || '0';

  const transformedStatsData = useMemo(() => {
    return statsData.map((stat) => {
      if (stat.label === 'جميع العملاء') {
        return {
          ...stat,
          value: totalOrdersCount,
        };
      }
      return stat;
    });
  }, [totalOrdersCount]);

  return (
    <div className="w-full mb-4 px-4" dir="rtl">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-x-visible sm:pb-0">
        {transformedStatsData.map((stat, index) => (
          <div key={index} className="min-w-[160px] sm:min-w-0">
            <StatsCard
              iconSrc={stat.iconSrc}
              label={stat.label}
              value={stat.value}
              subtitle={stat.subtitle}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
