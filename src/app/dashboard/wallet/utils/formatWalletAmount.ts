export function formatWalletAmount(amount: string, currency: string = 'EGP'): string {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
