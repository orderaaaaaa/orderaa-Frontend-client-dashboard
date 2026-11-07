export function parsePositiveId(value: string | string[] | undefined | null): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const numericId = Number(value);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;
  return numericId;
}
