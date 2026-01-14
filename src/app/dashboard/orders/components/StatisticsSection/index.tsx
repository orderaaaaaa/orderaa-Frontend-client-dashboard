import React, { ReactNode } from 'react';
import { StatCard } from './StatCard';

export interface StatisticsCardConfig {
  key: string;
  label: string;
  desc: string;
  icon: ReactNode;
  value: number;
}

interface StatisticsSectionProps {
  cards: StatisticsCardConfig[];
  isLoading: boolean;
}

export function StatisticsSection({
  cards,
  isLoading,
}: StatisticsSectionProps) {
  const skeletonCount = cards.length || 4;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg py-5 px-4 shadow-md border border-gray-100 animate-pulse"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex flex-col gap-2">
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-6 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          desc={card.desc}
          value={card.value}
        />
      ))}
    </div>
  );
}
