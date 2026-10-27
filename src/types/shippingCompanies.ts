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

export const PARTIAL_DELIVERY_CARRIER_EDITS: Partial<Record<ShippingImplementation, boolean>> = {
  TURBO: true,
  BOSTA: false,
};

export const PARTIAL_DELIVERY_IMPLEMENTATIONS = Object.keys(
  PARTIAL_DELIVERY_CARRIER_EDITS,
) as readonly ShippingImplementation[];

export const isNoEditPartialDeliveryCarrier = (implementation: ShippingImplementation) =>
  PARTIAL_DELIVERY_CARRIER_EDITS[implementation] === false;

export interface ShippingCompanyRef {
  id: number;
  code: string | null;
  name: string;
  kind: ShippingCompanyKind;
  implementation: ShippingImplementation;
  isActive: boolean;
  carrierSupportsUpdate?: boolean;
}

export const NO_SHIPPING_COMPANY_FILTER = 'none';

export const NO_SHIPPING_COMPANY_LABEL = 'بدون شركة شحن';

export const SHIPPING_COMPANY_REQUIRED_MESSAGE = 'يرجى اختيار شركة الشحن أولاً';

export const CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE =
  'هذه الشركة لا تدعم تعديل السعر أو تكلفة المرتجع. أنشئ الشحنة من جديد يدوياً.';
