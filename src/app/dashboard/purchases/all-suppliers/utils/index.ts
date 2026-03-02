export function formatCurrency(amount: number): string {
  return `${Math.abs(amount).toLocaleString()} ج.م`;
}
