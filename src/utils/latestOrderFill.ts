import type { QueryClient } from '@tanstack/react-query';
import type { OrderLookupSurface } from '@/constants/orderReadScope';
import { shippingCompaniesQueryOptions } from '@/hooks/useShippingCompanies';
import {
  customerOrdersQueryOptions,
} from '@/services/orders';
import {
  locationOptionCitiesQueryOptions,
  locationOptionGovernoratesQueryOptions,
} from '@/services/lookups';
import type { LocationOption } from '@/types/locationOptions';
import type { Order } from '@/types/orders';
import { matchLocationOption } from '@/utils/locationOptionMatch';
import { normalizePhoneNumber } from '@/utils/phone';

export type LocationPresetDropped = 'company' | 'governorate' | 'city';

export const DROPPED_LABELS: Record<LocationPresetDropped, string> = {
  company: 'شركة الشحن',
  governorate: 'المحافظة',
  city: 'المدينة',
};

export const droppedSuffixOf = (dropped: LocationPresetDropped[]): string =>
  dropped.length === 0
    ? ''
    : ` — اختر ${dropped.map((field) => DROPPED_LABELS[field]).join('/')}`;

export interface LocationRef {
  token?: string;
  rowId?: number | null;
  label?: string | null;
}

export interface LocationPresetInput {
  shippingCompanyId?: number | null;
  governorate?: LocationRef;
  city?: LocationRef;
}

export interface LocationPresetResult {
  shippingCompanyId: number | undefined;
  governorateOption: string | undefined;
  cityOption: string | undefined;
  dropped: LocationPresetDropped[];
}

export type LatestOrderMatch = { phone: string } | { customerId: number };

export interface LatestOrderFill extends LocationPresetResult {
  row: Order;
  name: string;
  phones: string[];
  address: string | undefined;
}

const matchLocationRef = (
  options: LocationOption[],
  ref: LocationRef,
): LocationOption | null => {
  const byToken =
    ref.token === undefined
      ? undefined
      : options.find((option) => option.value === ref.token);
  if (byToken) return byToken;
  const rowId = ref.rowId;
  const byRowId =
    rowId === undefined || rowId === null
      ? undefined
      : options.find((option) => option.rowId === rowId);
  return byRowId ?? matchLocationOption(options, ref.label);
};

export const locationRefOf = (
  token: string | null | undefined,
  rowId: number | null | undefined,
  label: string | null | undefined,
): LocationRef | undefined => {
  if (!token && (rowId === undefined || rowId === null) && !label) return undefined;
  return { token: token ?? undefined, rowId, label };
};

export const latestMatchingOrderOf = (
  rows: Order[],
  match: LatestOrderMatch,
): Order | null => {
  const found =
    'phone' in match
      ? rows.find((row) =>
          row.customers.phone_numbers.some(
            (phone) => normalizePhoneNumber(phone) === match.phone,
          ),
        )
      : rows.find((row) => row.customerId === match.customerId);
  return found ?? null;
};

export const validateLocationPreset = async (
  queryClient: QueryClient,
  { shippingCompanyId, governorate, city }: LocationPresetInput,
): Promise<LocationPresetResult> => {
  const dropped: LocationPresetDropped[] = [];

  let companyId: number | undefined;
  if (shippingCompanyId !== undefined && shippingCompanyId !== null) {
    try {
      const companies = await queryClient.fetchQuery(shippingCompaniesQueryOptions);
      companyId = companies.some((company) => company.id === shippingCompanyId)
        ? shippingCompanyId
        : undefined;
    } catch {
      companyId = undefined;
    }
    if (companyId === undefined) dropped.push('company');
  }

  let governorateOption: LocationOption | null = null;
  if (governorate && companyId !== undefined) {
    try {
      const response = await queryClient.fetchQuery(
        locationOptionGovernoratesQueryOptions(companyId),
      );
      governorateOption = matchLocationRef(response.options, governorate);
    } catch {
      governorateOption = null;
    }
  }
  if (governorate && !governorateOption) dropped.push('governorate');

  let cityOption: LocationOption | null = null;
  if (city && governorateOption && companyId !== undefined) {
    try {
      const response = await queryClient.fetchQuery(
        locationOptionCitiesQueryOptions(companyId, governorateOption.value),
      );
      cityOption = matchLocationRef(response.options, city);
    } catch {
      cityOption = null;
    }
  }
  if (city && !cityOption) dropped.push('city');

  return {
    shippingCompanyId: companyId,
    governorateOption: governorateOption?.value,
    cityOption: cityOption?.value,
    dropped,
  };
};

export const resolveLatestOrderFill = async (
  queryClient: QueryClient,
  phone: string,
  match: LatestOrderMatch,
  surface: OrderLookupSurface,
): Promise<LatestOrderFill | null> => {
  try {
    const response = await queryClient.fetchQuery(
      customerOrdersQueryOptions(phone, surface),
    );
    const row = latestMatchingOrderOf(response.data, match);
    if (!row) return null;
    const location = await validateLocationPreset(queryClient, {
      shippingCompanyId: row.shippingCompanyId,
      governorate: locationRefOf(
        row.governorateOption,
        row.governorateSourceRowId,
        row.governorate,
      ),
      city: locationRefOf(row.cityOption, row.citySourceRowId, row.city),
    });
    return {
      row,
      name: row.customers.name,
      phones: row.customers.phone_numbers,
      address: row.address,
      ...location,
    };
  } catch {
    return null;
  }
};
