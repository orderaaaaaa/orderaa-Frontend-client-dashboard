import { formatMoney } from '@/utils/formatMoney';

export function formatCurrency(amount: number): string {
  return formatMoney(String(Math.abs(amount)));
}

export function formatSupplierBalance(remaining: number): { text: string; color: string } {
  if (remaining === 0) return { text: formatCurrency(0), color: 'text-gray-600' };
  if (remaining < 0) {
    return { text: `${formatCurrency(Math.abs(remaining))} عليه`, color: 'text-red-600' };
  }
  return { text: `${formatCurrency(remaining)} له`, color: 'text-green-600' };
}
