
import { FilterOrdersDto } from '@/types/orders';

/* =========================
   ORDER STATUS (SHARED)
   ========================= */

export type OrderStatusKey =
  | 'NEW_ORDER'
  | 'ATTEMPTED'
  | 'WAITING_FOR_PAYMENT'
  | 'WHATSAPP'
  | 'POSTPONED'
  | 'CALL_AGAIN'
  | 'STOPPED'
  | 'CANCELLED'
  | 'EDIT_REJECTED'
  | 'UNCOMPLETED'
  | 'CONFIRMED'
  | 'PREPARED'
  | 'SHIPPING'
  | 'RETURNED_DELIVERED'
  | 'DELIVERED'
  | 'PARTIAL_DELIVERY'
  | 'MISSING';

export interface OrderStatus {
  key: OrderStatusKey;
  label: string;
}

/* =========================
   BULK (/orders/bulk)
   ========================= */

export interface BulkRequest {
  status: OrderStatusKey;
  eventNote?: string;
  postponedUntil?: string; // ISO 8601
  cancelReason?: string;
  cancelNotes?: string;
  ids?: number[];
  filters?: FilterOrdersDto;
  excludeIds?: number[];
}

export interface BulkUpdateResponse {
  updatedCount: number;
  message: string;
}

/* =========================
   BATCH (/orders/batch)
   ========================= */

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';

export type ShippingCompany = 'TURBO';

export type ShippingStatus = 'NORMAL' | 'URGENT';

/**
 * Mirrors UpdateOrderDto from backend
 */
export interface UpdateOrderDto {
  status?: OrderStatusKey;
  totalCost?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  address?: string;
  governorate?: string;
  city?: string;
  eventNote?: string;
  numberOfTriesToReach?: number;
  notes?: string;
  phoneNumber?: string;
  alternativePhoneNumber?: string;
  postponedUntil?: string;
  shippingCompany?: ShippingCompany;
  shippingCost?: number;
  material?: string;
  weight?: string;
  countryOfManufacture?: string;
  packagingNotes?: string;
  cancelReason?: string;
  cancelNotes?: string;
  urgentDate?: string;
  isPrinted?: boolean;
  availableFrom?: string;
  availableTo?: string;
  canOpenShipment?: boolean;
  shipmentContent?: string;
  returnShippingCost?: number;
  shippingStatus?: ShippingStatus;
  returnShipmentContent?: string;
}

export interface OrdersBatchRequest {
  orders: Array<{
    id: number;
    updates: UpdateOrderDto;
  }>;
}

export interface OrdersBatchResponse {
  updatedCount: number;
  message: string;
}
