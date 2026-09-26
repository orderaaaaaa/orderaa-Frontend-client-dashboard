export const LOCATION_OPTION_KINDS = {
  CANONICAL: 'CANONICAL',
  ROW: 'ROW',
} as const;

export type LocationOptionKind =
  (typeof LOCATION_OPTION_KINDS)[keyof typeof LOCATION_OPTION_KINDS];

export interface LocationOption {
  value: string;
  kind: LocationOptionKind;
  label: string;
  canonicalNameId: number | null;
  rowId: number;
  stale: boolean;
}

export interface LocationOptionsResponse {
  sourceHasRows: boolean;
  options: LocationOption[];
}

export const LOCATION_OPTION_ERROR_CODES = {
  LOCATION_OPTION_INVALID: 'LOCATION_OPTION_INVALID',
  LOCATION_PICK_CONFLICT: 'LOCATION_PICK_CONFLICT',
  PROVIDER_NOT_SUPPORTED: 'PROVIDER_NOT_SUPPORTED',
} as const;

export type LocationOptionErrorCode =
  (typeof LOCATION_OPTION_ERROR_CODES)[keyof typeof LOCATION_OPTION_ERROR_CODES];

export const LOCATION_OPTION_ERROR_MESSAGES: Record<LocationOptionErrorCode, string> = {
  LOCATION_OPTION_INVALID:
    'المحافظة أو المدينة المختارة لم تعد متاحة، اخترها من القائمة مرة أخرى',
  LOCATION_PICK_CONFLICT: 'تعذر حفظ الموقع، أعد اختيار المحافظة والمدينة من القائمة',
  PROVIDER_NOT_SUPPORTED: 'شركة الشحن هذه لا تدعم اختيار المحافظة والمدينة من القائمة',
};

const KNOWN_LOCATION_OPTION_ERROR_CODES = new Set<string>(
  Object.values(LOCATION_OPTION_ERROR_CODES)
);

export const locationOptionErrorCodeOf = (
  err: unknown
): LocationOptionErrorCode | null => {
  const code = (err as { response?: { data?: { code?: unknown } } })?.response
    ?.data?.code;
  return typeof code === 'string' && KNOWN_LOCATION_OPTION_ERROR_CODES.has(code)
    ? (code as LocationOptionErrorCode)
    : null;
};

export const OTHERS_SHIPPING_COMPANY = 'OTHERS';

const COURIER_KEY_PREFIX = 'provider:';

export const courierKeyOf = (shippingProviderId: number) =>
  `${COURIER_KEY_PREFIX}${shippingProviderId}`;

export const courierIdOf = (shippingCompanyKey: string): number | null => {
  if (!shippingCompanyKey.startsWith(COURIER_KEY_PREFIX)) return null;
  const id = Number(shippingCompanyKey.slice(COURIER_KEY_PREFIX.length));
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const shippingCompanyKeyOfOrder = (
  shippingCompany: string | null | undefined,
  shippingProviderId: number | null | undefined,
) =>
  shippingProviderId != null
    ? courierKeyOf(shippingProviderId)
    : (shippingCompany ?? undefined);

export const shippingCompanyPayloadOf = (shippingCompanyKey: string) => {
  const courierId = courierIdOf(shippingCompanyKey);
  return courierId !== null
    ? { shippingCompany: OTHERS_SHIPPING_COMPANY, shippingProviderId: courierId }
    : { shippingCompany: shippingCompanyKey, shippingProviderId: null };
};
