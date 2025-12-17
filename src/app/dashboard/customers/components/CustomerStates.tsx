import React from 'react';
import { StatsCard } from './StateCardCustomer';
import { statsData } from '../constants/stateItem';

export default function CustomerStates() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          iconSrc={stat.iconSrc}
          label={stat.label}
          value={stat.value}
          subtitle={stat.subtitle}
          iconColor={stat.iconColor}
          iconBgColor={stat.iconBgColor}
        />
      ))}
    </div>
  );
}
