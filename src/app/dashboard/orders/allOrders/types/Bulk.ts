
import type { CarrierSendBlock } from '@/types/carrierSends';
import { FilterOrdersDto } from '@/types/orders';
import type { AvailableStockRefusalLine } from '@/lib/api/stockShortage';

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

export interface BulkRefusedOrder {
  id: number;
  code: string;
  reason: 'NO_COMPANY' | 'NO_SHIPPING_CODE' | 'OUT_OF_WINDOW';
  message: string;
}

export type BulkCarrierResultOutcome =
  | 'SENT'
  | 'REJECTED'
  | 'UNKNOWN'
  | 'HELD'
  | 'DEFERRED'
  | 'SKIPPED';

export type BulkCarrierResultReason =
  | 'STATUS_NOT_ALLOWED'
  | 'SHADOWED'
  | 'PARKED'
  | 'LOCKED_BY_OTHER'
  | 'TARGET_NOT_ACTIVE'
  | 'LOCATION_MISSING'
  | 'LOCATION_UNRESOLVED'
  | 'PHONE_MISSING'
  | 'ADDRESS_MISSING'
  | 'OPEN_MARKER'
  | 'LEDGER_REFUSED'
  | 'CLAIM_FAILED'
  | 'CODE_NOT_ISSUED'
  | 'RETIRED_INTEGRATION'
  | 'REPLACED_PARENT_NO_CARRIER_SYNC'
  | 'CARRIER_ACCEPTED'
  | 'LOCAL_SWITCH'
  | 'LOCAL_SAME'
  | 'UPDATED_ON_CARRIER'
  | 'CARRIER_REJECTED'
  | 'OUTCOME_UNKNOWN'
  | 'STATE_CHANGED'
  | 'HELD_CHECK_REQUIRED'
  | 'CAP_REACHED'
  | 'BUDGET_REACHED';

export interface BulkCarrierResult {
  orderId: number;
  code: string;
  outcome: BulkCarrierResultOutcome;
  reason: BulkCarrierResultReason;
  carrierSend: CarrierSendBlock | null;
  skipRowCode: string | null;
}

export interface BulkStockWarningDto {
  id: number;
  code: string;
  warehouseName: string;
  lines: AvailableStockRefusalLine[];
}

export interface BulkUpdateResponse {
  updatedCount: number;
  message: string;
  refused: BulkRefusedOrder[];
  carrierResults?: BulkCarrierResult[];
  warnings?: BulkStockWarningDto[];
}
