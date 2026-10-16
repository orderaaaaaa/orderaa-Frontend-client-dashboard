import { formatNumber as formatNumberValue } from '@/utils/format';

export { formatDate } from '@/utils/format';

export function formatNumber(
  value: number | string | null | undefined,
  fractionDigits = 0,
): string {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return formatNumberValue(safe, {
    minFractionDigits: fractionDigits,
    maxFractionDigits: fractionDigits,
  });
}
