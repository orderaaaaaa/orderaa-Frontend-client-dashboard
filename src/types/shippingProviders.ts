/** Mirrors the backend shipping-provider DTOs (T16). */

export type ShippingProviderType = 'COMPANY' | 'DELEGATE';

export interface ShippingProvider {
  id: number;
  type: ShippingProviderType;
  name: string;
  phone: string | null;
  isActive: boolean;
}

/**
 * A row covers both key spaces: a merchant-defined provider (`provider:12`)
 * and an integrated carrier (`company:BOSTA`). Integrated carriers come from
 * the enum, not the table, so they have no phone and no type.
 */
export interface CarrierStats {
  key: string;
  type: ShippingProviderType | null;
  name: string;
  phone: string | null;
  isActive: boolean;
  inTransitCount: number;
  deliveredCount: number;
  returnedCount: number;
  totalAssigned: number;
  /** NULL — never 0 — when nothing has finished yet. */
  deliveryRate: number | null;
  returnRate: number | null;
}

export interface LocationStats {
  location: string | null;
  deliveredCount: number;
  returnedCount: number;
  deliveryRate: number | null;
  returnRate: number | null;
}

export interface ProviderShipment {
  id: number;
  code: string;
  status: string;
  governorate: string | null;
  city: string | null;
  totalCost: number | null;
  /** When it went to this carrier — a shipping event, not the order date. */
  takenAt: string | null;
}

export interface StatsRange {
  from?: string;
  to?: string;
}
