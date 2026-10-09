export function formatCurrency(amount: number): string {
  return `${Math.abs(amount).toLocaleString()} ج.م`;
}

export function formatSupplierBalance(remaining: number): { text: string; color: string } {
  if (remaining === 0) return { text: '0 ج.م', color: 'text-gray-500' };
  if (remaining < 0) {
    return { text: `${formatCurrency(Math.abs(remaining))} عليه`, color: 'text-red-500' };
  }
  return { text: `${formatCurrency(remaining)} له`, color: 'text-green-500' };
}
