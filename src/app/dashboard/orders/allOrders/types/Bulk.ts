
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
  postponedUntil?: string;
  cancelReason?: string;
  cancelNotes?: string;
  ordersIds?: number[];
  filters?: FilterOrdersDto;
  excludeIds?: number[];
}

export interface BulkUpdateResponse {
  updatedCount: number;
  message: string;
}
