import type { StockScope, StockStatus } from '../types';

export const STOCK_MANAGEMENT_BASE_PATH = '/dashboard/inventory/stock-management';

export const STOCK_SCOPE_KINDS = {
  ALL: 'all',
  PHYSICAL: 'physical',
  VIRTUAL: 'virtual',
} as const;

export function stockScopeHref(scope: StockScope): string {
  if (scope.kind === STOCK_SCOPE_KINDS.ALL) {
    return `${STOCK_MANAGEMENT_BASE_PATH}/${STOCK_SCOPE_KINDS.ALL}`;
  }
  return `${STOCK_MANAGEMENT_BASE_PATH}/${scope.kind}/${scope.id}`;
}

export const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  high: {
    label: 'مرتفع',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
  },
  medium: {
    label: 'متوسط',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'منخفض',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    dotColor: 'bg-red-500',
  },
  out_of_stock: {
    label: 'غير متوفر',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-red-500',
  },
  shortage: {
    label: 'عجز',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    dotColor: 'bg-red-600',
  },
};

export const LOW_STOCK_THRESHOLD = 10;

