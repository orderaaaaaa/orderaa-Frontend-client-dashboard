import React from 'react';
import { SvgIcon } from '@/components/ui/svg-icon';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  iconSrc: string;
  label: string;
  value: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  iconSrc,
  label,
  value,
  subtitle,
}) => (
  <div
    className={cn(
      'bg-white flex items-center gap-3 rounded-xl px-3 py-3 border border-gray-100',
      'hover:shadow-sm transition-shadow min-w-0'
    )}
  >
    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#f1eefa] shrink-0">
      <SvgIcon src={iconSrc} className="w-5 h-5" alt={label} />
    </div>
    <div className="min-w-0 flex-1">
      <span className="text-gray-500 text-xs block truncate">{label}</span>
      <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
      {subtitle ? <div className="text-[10px] text-gray-400 truncate">{subtitle}</div> : null}
    </div>
  </div>
);
