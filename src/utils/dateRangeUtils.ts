/**
 * Utility functions for handling date range calculations based on time period selection
 */

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | '';

/**
 * Calculate date range based on time period selection
 * @param period - Time period ('day', 'week', 'month', 'quarter', 'year')
 * @returns Object with from and to dates
 */
export function calculateDateRangeFromPeriod(period: TimePeriod): {
  from: Date;
  to: Date;
} | null {
  if (!period) return null;

  const now = new Date();
  const from = new Date();
  const to = new Date(now);

  switch (period) {
    case 'day':
      // Today
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;

    case 'week':
      // Last 7 days
      from.setDate(now.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;

    case 'month':
      // Last 30 days
      from.setDate(now.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;

    case 'quarter':
      // Last 90 days (quarter)
      from.setDate(now.getDate() - 90);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;

    case 'year':
      // Last 365 days
      from.setDate(now.getDate() - 365);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;

    default:
      return null;
  }

  return { from, to };
}

/**
 * Format date to ISO string for API calls
 * @param date - Date object
 * @returns ISO formatted string
 */
export function formatDateToISO(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString();
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
