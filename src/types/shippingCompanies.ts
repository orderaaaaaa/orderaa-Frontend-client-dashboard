export type ShippingCompanyKind = 'INTEGRATION' | 'COMPANY' | 'DELEGATE';

export type ShippingImplementation =
  | 'TURBO'
  | 'BOSTA'
  | 'HASHTAG'
  | 'QUICK_CONNECT'
  | 'ACCURATE'
  | 'RM_EXPRESS'
  | 'JT_EXPRESS'
  | 'TOROD'
  | 'CARRIER_NOOP';

export interface ShippingCompanyRef {
  id: number;
  code: string | null;
  name: string;
  kind: ShippingCompanyKind;
  implementation: ShippingImplementation;
  isActive: boolean;
}

export const NO_SHIPPING_COMPANY_FILTER = 'none';

export const NO_SHIPPING_COMPANY_LABEL = 'بدون شركة شحن';

export const SHIPPING_COMPANY_REQUIRED_MESSAGE = 'يرجى اختيار شركة الشحن أولاً';
