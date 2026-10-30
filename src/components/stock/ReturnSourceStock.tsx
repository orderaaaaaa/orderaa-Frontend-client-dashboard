'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';
import { formatStockNumber } from '@/utils/format';
import { Button } from '@/components/ui/button';
import type { ReturnStockLine } from '@/lib/api/suppliers';

export interface ReturnStockCell {
  warehouseName: string | null;
  available: number;
  requested: number;
}

export interface ReturnStockRequest {
  key: string;
  quantity: number;
}

export interface ReturnStockState {
  cells: Record<string, ReturnStockCell>;
  incomplete: boolean;
}

function groupKeyOf(line: Pick<ReturnStockLine, 'warehouseId' | 'variantId'>): string {
  return `${line.warehouseId}:${line.variantId}`;
}

export function buildReturnStockCells(
  requests: ReturnStockRequest[],
  lines: ReturnStockLine[] | undefined,
): ReturnStockState {
  if (lines === undefined) {
    return { cells: {}, incomplete: requests.some((r) => r.quantity > 0) };
  }

  const lineByKey = new Map(lines.map((line) => [line.key, line]));
  const requestedByGroup: Record<string, number> = {};
  let incomplete = false;

  for (const request of requests) {
    const line = lineByKey.get(request.key);
    if (!line) {
      if (request.quantity > 0) incomplete = true;
      continue;
    }
    const group = groupKeyOf(line);
    requestedByGroup[group] = (requestedByGroup[group] ?? 0) + request.quantity;
  }

  const cells: Record<string, ReturnStockCell> = {};
  for (const request of requests) {
    const line = lineByKey.get(request.key);
    if (!line) continue;
    cells[request.key] = {
      warehouseName: line.warehouseName,
      available: line.available,
      requested: requestedByGroup[groupKeyOf(line)] ?? 0,
    };
  }

  return { cells, incomplete };
}

export function isReturnStockExceeded(cell: ReturnStockCell): boolean {
  return cell.requested > cell.available;
}

export function isReturnStockBlocked(cell: ReturnStockCell): boolean {
  if (cell.requested <= 0) return false;
  return cell.warehouseName === null || isReturnStockExceeded(cell);
}

export function isReturnStockBlocking(state: ReturnStockState): boolean {
  return state.incomplete || Object.values(state.cells).some(isReturnStockBlocked);
}

export function returnWarehouseNamesOf(cells: Record<string, ReturnStockCell>): string {
  const names = new Set<string>();
  for (const cell of Object.values(cells)) {
    if (cell.warehouseName !== null) names.add(cell.warehouseName);
  }
  return [...names].join('، ');
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

interface ReturnStockLoadErrorProps {
  onRetry: () => void;
}

export function ReturnStockLoadError({ onRetry }: ReturnStockLoadErrorProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
      <span>{t('returnStock.loadFailed')}</span>
      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onRetry}>
        {t('returnStock.retry')}
      </Button>
    </div>
  );
}
