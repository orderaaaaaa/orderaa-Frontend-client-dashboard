export function computeTrend(
  current: string | number | null,
  previous: string | number | null,
): { direction: 'up' | 'down' | 'flat'; percent: number } | null {
  if (current === null || previous === null) return null;
  const c = Number(current);
  const p = Number(previous);
  if (p === 0) return null;
  const change = c - p;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const rounded = Math.round((change / Math.abs(p)) * 100);
  return { direction, percent: Math.abs(rounded) };
}
