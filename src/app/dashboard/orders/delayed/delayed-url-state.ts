import { ORDER_STATUSES, type OrderStatusKey } from '@/lib/generated/permission-codes';
import type { DelayedMarksMode } from '@/services/delayedOrders';

export const DELAYED_PAGE_SIZES = [10, 25, 50, 100] as const;
export type DelayedPageSize = (typeof DELAYED_PAGE_SIZES)[number];
export const DELAYED_DEFAULT_LIMIT: DelayedPageSize = 10;

export const DELAYED_DAY_OPTIONS = [1440, 2880, 4320, 10080] as const;
export type DelayedDayOption = (typeof DELAYED_DAY_OPTIONS)[number];

export const DELAYED_MARKS_VALUES: readonly DelayedMarksMode[] = [
  'default',
  'followedUp',
  'notFollowedUp',
  'withDone',
];
export const DELAYED_DEFAULT_MARKS: DelayedMarksMode = 'notFollowedUp';

export interface DelayedUrlState {
  status: OrderStatusKey | null;
  minMinutes: DelayedDayOption | null;
  marks: DelayedMarksMode;
  page: number;
  limit: DelayedPageSize;
}

export const toOrderStatusKey = (value: string): OrderStatusKey | null =>
  (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatusKey)
    : null;

export const toDayOption = (value: string): DelayedDayOption | null => {
  const minutes = Number(value);
  return (DELAYED_DAY_OPTIONS as readonly number[]).includes(minutes)
    ? (minutes as DelayedDayOption)
    : null;
};

export const toPageSize = (value: number): DelayedPageSize | null =>
  (DELAYED_PAGE_SIZES as readonly number[]).includes(value)
    ? (value as DelayedPageSize)
    : null;

const toMarksMode = (value: string | null): DelayedMarksMode => {
  const match = DELAYED_MARKS_VALUES.find((mode) => mode === value);
  return match ?? DELAYED_DEFAULT_MARKS;
};

const toPage = (value: string | null): number =>
  value !== null && /^[1-9]\d*$/.test(value) ? Number(value) : 1;

export const parseDelayedUrlState = (params: URLSearchParams): DelayedUrlState => ({
  status: toOrderStatusKey(params.get('status') ?? ''),
  minMinutes: toDayOption(params.get('minMinutes') ?? ''),
  marks: toMarksMode(params.get('marks')),
  page: toPage(params.get('page')),
  limit: toPageSize(Number(params.get('limit'))) ?? DELAYED_DEFAULT_LIMIT,
});

export const serializeDelayedUrlState = (state: DelayedUrlState): string => {
  const params = new URLSearchParams();
  if (state.status !== null) params.set('status', state.status);
  if (state.minMinutes !== null) params.set('minMinutes', String(state.minMinutes));
  if (state.marks !== DELAYED_DEFAULT_MARKS) params.set('marks', state.marks);
  if (state.page !== 1) params.set('page', String(state.page));
  if (state.limit !== DELAYED_DEFAULT_LIMIT) params.set('limit', String(state.limit));
  return params.toString();
};
