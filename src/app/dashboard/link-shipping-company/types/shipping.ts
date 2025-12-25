export type ShippingProviderId =
  | 'aramex'
  | 'shipblu'
  | 'mylerz'
  | 'bosta'
  | 'jt_express';

export interface ShippingConfig {
  id?: string;
  providerId: ShippingProviderId;
  webhookUrl: string;
  webhookSecret: string;
  isEnabled: boolean;
  metadata?: Record<string, any>;
}

export interface ShippingProvider {
  id: ShippingProviderId;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}
