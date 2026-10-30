'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';
import { formatStockNumber } from '@/utils/format';

export interface ReturnStockCell {
  warehouseName: string | null;
  available: number;
  requested: number;
}

export function isReturnStockExceeded(cell: ReturnStockCell): boolean {
  return cell.requested > cell.available;
}

export function isReturnStockBlocked(cell: ReturnStockCell): boolean {
  if (cell.requested <= 0) return false;
  return cell.warehouseName === null || isReturnStockExceeded(cell);
}

interface ReturnSourceStockProps {
  cell: ReturnStockCell;
}

export function ReturnSourceStock({ cell }: ReturnSourceStockProps) {
  const { t } = useI18n();

  if (cell.warehouseName === null) {
    return (
      <span className="text-xs font-semibold text-red-600">{t('returnStock.uncovered')}</span>
    );
  }

  const exceeded = isReturnStockExceeded(cell);

  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center gap-1 text-xs',
        exceeded ? 'font-semibold text-red-600' : 'text-gray-600'
      )}
    >
      <span>
        {cell.warehouseName}: <span dir="ltr">{formatStockNumber(cell.available)}</span>
      </span>
      {exceeded && <span>— {t('returnStock.exceedsAvailable')}</span>}
    </span>
  );
}
