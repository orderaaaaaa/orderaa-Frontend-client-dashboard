import React from 'react';
import { StatsCard } from './StateCardCustomer';
import { statsData } from '../constants/stateItem';

export default function CustomerStates() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 p-6 w-[93%] mb-10">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          iconSrc={stat.iconSrc}
          label={stat.label}
          value={stat.value}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
}
