'use client';

import clsx from 'clsx';

interface RateBadgeProps {
  label: string;
  /** Null means nothing has finished yet — not a zero rate. */
  rate: number | null;
  part: number;
  total: number;
  tone: 'delivered' | 'returned';
}

/**
 * A percentage always shows the counts behind it: 100% from one order is not
 * the same claim as 100% from two hundred (spec §8 case 6).
 */
export function RateBadge({ label, rate, part, total, tone }: RateBadgeProps) {
  if (rate === null) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-400">
          لا توجد طلبات منتهية بعد
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={clsx(
          'text-sm font-bold',
          tone === 'delivered' ? 'text-green-600' : 'text-amber-600',
        )}
      >
        {rate}%{' '}
        <span className="text-xs font-medium text-gray-500">
          ({part}/{total})
        </span>
      </span>
    </div>
  );
}
