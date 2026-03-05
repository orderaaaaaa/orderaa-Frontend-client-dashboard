import { OrderFilters } from '@/types/orders';
import { TimePeriod } from './dateRangeUtils';

// URL filter state interface
export interface UrlFilterState {
  status: string | null;
  search: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: TimePeriod;
  page: number;
  limit: number;
  localFilters: OrderFilters;
}

// Default filter state
export const DEFAULT_FILTER_STATE: UrlFilterState = {
  status: null,
  search: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
  page: 1,
  limit: 10,
  localFilters: {
    productName: '',
    sizeColor: '',
    governorate: '',
    city: '',
    area: '',
    shipmentCode: '',
    customerName: '',
    phone: '',
    address: '',
    executionDate: '',
    newFirst: undefined,
    orderByDirection: undefined,
    productId: '',
    storeId: '',
    cancellationReasons: [],
  },
};

// All valid TimePeriod values
const TIME_PERIOD_VALUES: TimePeriod[] = ['day', 'week', 'month', 'quarter', 'year', ''];

// Status validation is now dynamic - any non-empty string is valid
// The backend is the source of truth for valid statuses
export function isValidOrderStatus(value: string): boolean {
  return value.length > 0;
}

// Check if a string is a valid TimePeriod
export function isValidTimePeriod(value: string): value is TimePeriod {
  return TIME_PERIOD_VALUES.includes(value as TimePeriod);
}

// Format Date to YYYY-MM-DD for URL
export function formatDateForUrl(date: Date | null): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD string to Date
export function parseDateFromUrl(dateStr: string | null): Date | null {
  if (!dateStr) return null;

  // Validate format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return null;

  const date = new Date(dateStr + 'T00:00:00');

  // Check if date is valid
  if (isNaN(date.getTime())) return null;

  return date;
}

// Parse a number from URL with default value
function parseNumber(value: string | null, defaultValue: number, minValue: number = 1): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < minValue) return defaultValue;
  return parsed;
}

// Serialize filter state to URLSearchParams
export function serializeFiltersToUrl(state: UrlFilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Status
  if (state.status) {
    params.set('status', state.status);
  }

  // Search
  if (state.search) {
    params.set('search', state.search);
  }

  // Date range (only if executionDate is not set - mutual exclusivity)
  if (!state.localFilters.executionDate) {
    const fromStr = formatDateForUrl(state.fromDate);
    if (fromStr) params.set('from', fromStr);

    const toStr = formatDateForUrl(state.toDate);
    if (toStr) params.set('to', toStr);
  }

  // Time period
  if (state.timePeriod) {
    params.set('period', state.timePeriod);
  }

  // Pagination (only if not default)
  if (state.page !== 1) {
    params.set('page', String(state.page));
  }
  if (state.limit !== 10) {
    params.set('limit', String(state.limit));
  }

  // Local filters
  const { localFilters } = state;

  if (localFilters.customerName) {
    params.set('customerName', localFilters.customerName);
  }
  if (localFilters.phone) {
    params.set('phone', localFilters.phone);
  }
  if (localFilters.governorate) {
    params.set('governorate', localFilters.governorate);
  }
  if (localFilters.city) {
    params.set('city', localFilters.city);
  }
  if (localFilters.area) {
    params.set('area', localFilters.area);
  }
  if (localFilters.productName) {
    params.set('productName', localFilters.productName);
  }
  if (localFilters.sizeColor) {
    params.set('sizeColor', localFilters.sizeColor);
  }
  if (localFilters.shipmentCode) {
    params.set('shipmentCode', localFilters.shipmentCode);
  }
  if (localFilters.address) {
    params.set('address', localFilters.address);
  }
  if (localFilters.executionDate) {
    params.set('executionDate', localFilters.executionDate);
  }
  if (localFilters.newFirst !== undefined) {
    params.set('newFirst', String(localFilters.newFirst));
  }
  if (localFilters.orderByDirection) {
    params.set('orderByDirection', localFilters.orderByDirection);
  }
  if (localFilters.productId) {
    params.set('productId', localFilters.productId);
  }
  if (localFilters.storeId) {
    params.set('storeId', localFilters.storeId);
  }
  if (localFilters.cancellationReasons?.length) {
    params.set('cancellationReasons', localFilters.cancellationReasons.join(','));
  }

  return params;
}

// Parse URLSearchParams to filter state
export function parseFiltersFromUrl(params: URLSearchParams): UrlFilterState {
  // Status - accept any string, backend is source of truth
  const statusParam = params.get('status');
  const status = statusParam || null;

  // Search
  const search = params.get('search') || '';

  // Execution date (check first for mutual exclusivity)
  const executionDate = params.get('executionDate') || '';

  // Date range (only parse if no executionDate)
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (!executionDate) {
    fromDate = parseDateFromUrl(params.get('from'));
    toDate = parseDateFromUrl(params.get('to'));
  }

  // Time period
  const periodParam = params.get('period');
  const timePeriod = periodParam && isValidTimePeriod(periodParam) ? periodParam : '';

  // Pagination
  const page = parseNumber(params.get('page'), 1, 1);
  const limit = parseNumber(params.get('limit'), 10, 1);

  // Parse newFirst (boolean)
  const newFirstParam = params.get('newFirst');
  const newFirst = newFirstParam === 'true' ? true : newFirstParam === 'false' ? false : undefined;

  // Parse orderByDirection
  const orderByDirectionParam = params.get('orderByDirection');
  const orderByDirection = (orderByDirectionParam === 'asc' || orderByDirectionParam === 'desc')
    ? orderByDirectionParam
    : undefined;

  // Local filters
  const localFilters: OrderFilters = {
    productName: params.get('productName') || '',
    sizeColor: params.get('sizeColor') || '',
    governorate: params.get('governorate') || '',
    city: params.get('city') || '',
    area: params.get('area') || '',
    shipmentCode: params.get('shipmentCode') || '',
    customerName: params.get('customerName') || '',
    phone: params.get('phone') || '',
    address: params.get('address') || '',
    executionDate,
    newFirst,
    orderByDirection,
    productId: params.get('productId') || '',
    storeId: params.get('storeId') || '',
    cancellationReasons: params.get('cancellationReasons')
      ? params.get('cancellationReasons')!.split(',')
      : [],
  };

  return {
    status,
    search,
    fromDate,
    toDate,
    timePeriod,
    page,
    limit,
    localFilters,
  };
}

// Check if two filter states are equal (for avoiding unnecessary URL updates)
export function areFiltersEqual(a: UrlFilterState, b: UrlFilterState): boolean {
  // Compare primitives
  if (a.status !== b.status) return false;
  if (a.search !== b.search) return false;
  if (a.timePeriod !== b.timePeriod) return false;
  if (a.page !== b.page) return false;
  if (a.limit !== b.limit) return false;

  // Compare dates
  const aFromStr = formatDateForUrl(a.fromDate);
  const bFromStr = formatDateForUrl(b.fromDate);
  if (aFromStr !== bFromStr) return false;

  const aToStr = formatDateForUrl(a.toDate);
  const bToStr = formatDateForUrl(b.toDate);
  if (aToStr !== bToStr) return false;

  // Compare local filters
  const aFilters = a.localFilters;
  const bFilters = b.localFilters;

  if (aFilters.productName !== bFilters.productName) return false;
  if (aFilters.sizeColor !== bFilters.sizeColor) return false;
  if (aFilters.governorate !== bFilters.governorate) return false;
  if (aFilters.city !== bFilters.city) return false;
  if (aFilters.area !== bFilters.area) return false;
  if (aFilters.shipmentCode !== bFilters.shipmentCode) return false;
  if (aFilters.customerName !== bFilters.customerName) return false;
  if (aFilters.phone !== bFilters.phone) return false;
  if (aFilters.address !== bFilters.address) return false;
  if (aFilters.executionDate !== bFilters.executionDate) return false;
  if (aFilters.newFirst !== bFilters.newFirst) return false;
  if (aFilters.orderByDirection !== bFilters.orderByDirection) return false;
  if (aFilters.productId !== bFilters.productId) return false;
  if (aFilters.storeId !== bFilters.storeId) return false;
  const aReasons = aFilters.cancellationReasons || [];
  const bReasons = bFilters.cancellationReasons || [];
  if (aReasons.length !== bReasons.length || !aReasons.every((r, i) => r === bReasons[i])) return false;

  return true;
}
