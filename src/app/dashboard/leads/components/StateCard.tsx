import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  valueColor,
}) => {
  return (
    <div
      className={`bg-card rounded-2xl border border-current px-5 py-6 ${iconColor}`}
    >
      <div className="flex gap-5 w-full">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-current ${iconBgColor}`}
        >
          <span style={{ fontSize: '24px' }}>{icon}</span>
        </div>
        <div className="mt-1">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className={`text-4xl font-bold ${valueColor}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
