const moneyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const countFormatter = new Intl.NumberFormat('en-US');

export function formatMoney(value: string | null): string {
  if (value === null) return '—';
  return `${moneyFormatter.format(Number(value))} ج.م`;
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatPercent(part: number, whole: number): string | null {
  if (whole === 0) return null;
  return `${Math.round((part / whole) * 100)}٪`;
}
