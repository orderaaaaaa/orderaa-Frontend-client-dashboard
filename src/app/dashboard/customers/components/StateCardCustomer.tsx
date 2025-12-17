import React from 'react';
import { SvgIcon } from '@/components/ui/svg-icon';
import clsx from 'clsx';

interface StatsCardProps {
  iconSrc: string;
  label: string;
  value: string;
  subtitle?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  iconSrc,
  label,
  value,
  subtitle,
  iconColor = 'text-purple-600',
  iconBgColor = 'bg-purple-50',
}) => (
  <div className="bg-white flex gap-4 rounded-lg p-6 items-start shadow-sm border border-gray-100">
    <div
      className={clsx(
        'flex items-center justify-center rounded-lg p-2',
        iconBgColor
      )}
    >
      <SvgIcon
        src={iconSrc}
        className={clsx('w-6 h-6', iconColor)}
        alt={label}
      />
    </div>
    <div>
      <span className="text-gray-600 text-2xl block mb-2">{label}</span>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  </div>
);
