'use client';

import clsx from 'clsx';
import { LiaCheckCircleSolid, LiaExclamationCircleSolid } from 'react-icons/lia';

interface ScanCountChipProps {
  scanned: number;
  expected: number | null;
}

export function ScanCountChip({ scanned, expected }: ScanCountChipProps) {
  const hasExpected = expected !== null && expected > 0;
  const delta = hasExpected ? scanned - (expected as number) : 0;
  const isMatch = hasExpected && delta === 0;
  const isBelow = hasExpected && delta < 0;
  const isAbove = hasExpected && delta > 0;

  const helper =
    !hasExpected
      ? 'أدخل العدد المتوقع من شركة الشحن'
      : isMatch
        ? 'العدد مطابق'
        : isBelow
          ? `ينقص ${Math.abs(delta)} طلب`
          : `يزيد ${delta} طلب — راجع العدد`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
      <div
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold w-full sm:w-auto',
          !hasExpected && 'bg-gray-50 text-gray-600 border-gray-200',
          isMatch && 'bg-emerald-50 text-emerald-700 border-emerald-200',
          (isBelow || isAbove) && 'bg-red-50 text-red-700 border-red-200',
        )}
      >
        {isMatch ? (
          <LiaCheckCircleSolid className="w-5 h-5" />
        ) : (
          <LiaExclamationCircleSolid className="w-5 h-5" />
        )}
        <span>الممسوح: {scanned}</span>
        <span className="text-gray-400">/</span>
        <span>المتوقع: {hasExpected ? expected : '—'}</span>
      </div>
      <span
        className={clsx(
          'text-xs sm:text-sm',
          isMatch && 'text-emerald-600',
          (isBelow || isAbove) && 'text-red-600',
          !hasExpected && 'text-gray-500',
        )}
      >
        {helper}
      </span>
    </div>
  );
}
