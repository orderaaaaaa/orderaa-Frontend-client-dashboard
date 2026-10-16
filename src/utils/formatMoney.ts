import { formatNumber } from '@/utils/format';

export function formatMoney(value: string | null): string {
  if (value === null) return '—';
  return `${formatNumber(Number(value), { minFractionDigits: 2, maxFractionDigits: 2 })} ج.م`;
}

export function formatCount(value: number): string {
  return formatNumber(value);
}

export function formatPercent(part: number, whole: number): string | null {
  if (whole === 0) return null;
  return `${Math.round((part / whole) * 100)}%`;
}
