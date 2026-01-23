import isEqual from 'lodash/isEqual';
import { OrderStatistics } from '@/types/orders';

export function areStatisticsEqual(
  prev: OrderStatistics | null | undefined,
  next: OrderStatistics | null | undefined
): boolean {
  if (!prev && !next) return true;
  if (!prev || !next) return false;
  return isEqual(prev, next);
}
