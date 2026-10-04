import type {
  ShippingCompanyKind,
  ShippingImplementation,
} from '@/types/shippingCompanies';

/** Mirrors the backend shipping-provider DTOs (T16). */

export type ShippingProviderType = 'COMPANY' | 'DELEGATE';

export interface ShippingProvider {
  id: number;
  shippingCompanyId: number;
  type: ShippingProviderType;
  name: string;
  phone: string | null;
  isActive: boolean;
}

export interface CarrierStats {
  shippingCompanyId: number;
  kind: ShippingCompanyKind;
  implementation: ShippingImplementation;
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
  inProcessNetAmount: string;
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

export type ShipmentStatusFilter = 'IN_PROCESS' | 'DELIVERED' | 'RETURNED' | 'ALL';

export interface ProviderShipmentsPage {
  data: ProviderShipment[];
  page: number;
  limit: number;
  total: number;
}
