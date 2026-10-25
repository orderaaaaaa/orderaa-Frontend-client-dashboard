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

export interface ShippingConfig {
  id: number;
  shippingCompany?: string;
  hasAuthKey: boolean;
  clientCode?: string;
  webhookUrl?: string; // keeping compatible just in case, though Turbo uses specific keys
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface ShippingProvider {
  id: ShippingProviderId;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}
