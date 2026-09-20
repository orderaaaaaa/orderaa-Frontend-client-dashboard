export function formatNumber(
  value: number | string | null | undefined,
  fractionDigits = 0,
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return (0).toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }
  return n.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatDate(value: string | Date | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-EG-u-nu-latn');
}
