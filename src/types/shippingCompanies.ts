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

export const isNoEditPartialDeliveryCarrier = (implementation: ShippingImplementation) => implementation !== 'TURBO';

export type CarrierCapabilityReason = 'CARRIER_RESEND_NOT_DOCUMENTED' | 'CARRIER_EXCHANGE_TYPE_NOT_SENT';

export interface CarrierCapability {
  supported: boolean;
  reason: CarrierCapabilityReason | null;
}

export interface CarrierCapabilities {
  resend: CarrierCapability;
  exchangeShipment: CarrierCapability;
}

export interface ShippingCompanyRef {
  id: number;
  code: string | null;
  name: string;
  kind: ShippingCompanyKind;
  implementation: ShippingImplementation;
  isActive: boolean;
  carrierSupportsUpdate?: boolean;
  capabilities?: CarrierCapabilities;
}

export const NO_SHIPPING_COMPANY_FILTER = 'none';

export const NO_SHIPPING_COMPANY_LABEL = 'بدون شركة شحن';

export const SHIPPING_COMPANY_REQUIRED_MESSAGE = 'يرجى اختيار شركة الشحن أولاً';

export const CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE =
  'هذه الشركة لا تدعم تعديل السعر أو تكلفة المرتجع. أنشئ الشحنة من جديد يدوياً.';
