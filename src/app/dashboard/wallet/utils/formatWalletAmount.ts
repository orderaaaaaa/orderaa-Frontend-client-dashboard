import { formatNumber } from '@/utils/format';

export function formatWalletAmount(amount: string, currency: string = 'EGP'): string {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return `${formatNumber(safe, { minFractionDigits: 2, maxFractionDigits: 2 })} ${currency}`;
}
