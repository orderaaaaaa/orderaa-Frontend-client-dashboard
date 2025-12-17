import React from 'react';
import { SvgIcon } from '@/components/ui/svg-icon';

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
}) => (
  <div className="bg-white flex gap-4 rounded-lg py-5 px-4 items-start shadow-lg border border-gray-100">
    <div className="flex items-center justify-center rounded-lg p-2">
      <SvgIcon src={iconSrc} className="w-9 h-9" alt={label} />
    </div>
    <div>
      <span className="text-gray-600 text-2xl block mb-2">{label}</span>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  </div>
);
