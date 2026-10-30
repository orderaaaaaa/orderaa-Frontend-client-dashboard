import type { LocationSyncStatus } from '@/types/canonicalNames';

export type ShippingProviderId =
  | 'aramex'
  | 'shipblu'
  | 'mylerz'
  | 'bosta'
  | 'jt_express'
  | 'turbo'
  | 'red'
  | 'hashtag'
  | 'quick_connect'
  | 'rm_express'
  | 'torod';

export type ShippingConfigType = 'WEBHOOK' | 'API_KEY';

export interface ShippingLocationSync {
  status: LocationSyncStatus;
  attempts: number;
  nextRetryAt: string | null;
  lastErrorCode: string | null;
  lastSuccessAt: string | null;
}

export interface ShippingConfigPayload {
  shippingCompany?: string;
  isActive?: boolean;
  authKey?: string;
  clientCode?: string;
}

export interface ShippingConfig {
  id: number;
  merchantId: number;
  shippingCompany?: string;
  shippingCompanyId: number;
  configType: ShippingConfigType;
  hasAuthKey: boolean;
  clientCode?: string;
  webhookUrl?: string; // keeping compatible just in case, though Turbo uses specific keys
  isActive: boolean;
  metadata?: Record<string, any>;
  locationSync?: ShippingLocationSync | null;
}

export interface ShippingProvider {
  id: ShippingProviderId;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}
