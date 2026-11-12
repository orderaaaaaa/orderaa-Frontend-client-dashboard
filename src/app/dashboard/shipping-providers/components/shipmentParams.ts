import type {
  DeliveredCountFilters,
  DeliveredFilters,
  InProcessCountFilters,
  InProcessFilters,
  OutcomeCountFilters,
  OutcomeView,
  ReturnedFilters,
} from '@/types/shippingProviders';

export const toInProcessParams = (filters: InProcessFilters): InProcessFilters => ({
  from: filters.from,
  to: filters.to,
  status: filters.status,
  lateness: filters.lateness,
  governorate: filters.governorate,
  city: filters.city,
  search: filters.search,
  workState: filters.workState,
  page: filters.page,
  limit: filters.limit,
});

export const toInProcessCountParams = (filters: InProcessCountFilters): InProcessCountFilters => ({
  from: filters.from,
  to: filters.to,
  status: filters.status,
  lateness: filters.lateness,
  governorate: filters.governorate,
  city: filters.city,
  search: filters.search,
});

const outcomeScope = (filters: OutcomeCountFilters) => ({
  from: filters.from,
  to: filters.to,
  governorate: filters.governorate,
  city: filters.city,
  search: filters.search,
});

export const toReturnedParams = (filters: ReturnedFilters): ReturnedFilters => ({
  ...outcomeScope(filters),
  workState: filters.workState,
  page: filters.page,
  limit: filters.limit,
});

export const toDeliveredParams = (filters: DeliveredFilters): DeliveredFilters => ({
  ...outcomeScope(filters),
  status: filters.status,
  workState: filters.workState,
  page: filters.page,
  limit: filters.limit,
});

export function toOutcomeCountParams(view: 'returned', filters: OutcomeCountFilters): OutcomeCountFilters;
export function toOutcomeCountParams(view: 'delivered', filters: DeliveredCountFilters): DeliveredCountFilters;
export function toOutcomeCountParams(view: OutcomeView, filters: DeliveredCountFilters): DeliveredCountFilters {
  const scope = outcomeScope(filters);
  return view === 'delivered' ? { ...scope, status: filters.status } : scope;
}
