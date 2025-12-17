import React from 'react';
import { StatsCard } from './StateCardCustomer';
import { statsData } from '../constants/stateItem';

const StatsDashboard: React.FC = () => {
  return (
    <div className="w-[95%] p-6" dir="rtl">
      <div className="grid grid-cols-5 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsDashboard;
