import api from './index';
import { OrderStatus } from '@/types/orders';

export type ShippingMatch = 'MATCH' | 'MISMATCH' | 'UNKNOWN';

export interface SettlementShippingInfo {
  governorate: string | null;
  totalCost: string;
  sheetShippingCost: string;
  expectedShippingCost: string | null;
  shippingMatch: ShippingMatch;
}

export type SettlementRowCode =
  | 'SETTLEMENT_ORDER_NOT_FOUND'
  | 'SETTLEMENT_STATUS_NOT_SETTLEABLE'
  | 'SETTLEMENT_NO_FORWARD_PATH'
  | 'SETTLEMENT_ORDER_SHADOWED'
  | 'SETTLEMENT_ORDER_PARKED'
  | 'SETTLEMENT_FORCE_RULE_REPEATS'
  | 'SETTLEMENT_TRANSITION_FAILED'
  | 'SETTLEMENT_UNEXPECTED'
  | 'SETTLEMENT_BATCH_NOT_FOUND'
  | 'SETTLEMENT_BATCH_CONFIRMED'
  | 'SETTLEMENT_ORDER_NOT_IN_BATCH'
  | 'SETTLEMENT_REMOVAL_MODE_NOT_ALLOWED'
  | 'SETTLEMENT_REVERT_NOT_ALLOWED'
  | 'SETTLEMENT_STATUS_CHANGED'
  | 'SETTLEMENT_REVERT_LEDGER_MISMATCH'
  | 'SETTLEMENT_REVERT_WAREHOUSE_MISSING'
  | 'SETTLEMENT_ORDER_DELETED'
  | 'SETTLEMENT_ORDER_NOT_SETTLED'
  | 'SETTLEMENT_AMOUNT_UNCHANGED'
  | 'SETTLEMENT_BATCH_ALREADY_CONFIRMED'
  | 'SETTLEMENT_BATCH_CREATE_FAILED'
  | 'OUT_OF_STOCK_CONFIRMATION_BLOCKED';

export interface SettlementRow {
  orderCode?: string;
  shippingCompanyCode?: string;
  settlementAmount: number;
  targetStatus: 'COLLECTED' | 'RETURNED_SETTLED';
  force?: boolean;
}

export const SETTLEMENT_DIRECT_SOURCE_STATUSES: Record<
  SettlementRow['targetStatus'],
  readonly OrderStatus[]
> = {
  COLLECTED: [
    OrderStatus.WAITING_FOR_APPROVAL,
    OrderStatus.SHIPPING,
    OrderStatus.WITH_DRIVER,
    OrderStatus.DELIVERED,
  ],
  RETURNED_SETTLED: [OrderStatus.RETURNED_DELIVERED, OrderStatus.RETURNED_COLLECTED],
};

export interface SettlementSuccessItem {
  row: number;
  orderId: number;
  orderCode: string;
  shippingCode: string | null;
  amount: number;
  currentStatus: string;
  newStatus: string;
  forcedPath: string[] | null;
  shipping: SettlementShippingInfo;
}

export interface SettlementFailedItem {
  row: number;
  orderId: number | null;
  orderCode: string | null;
  shippingCode: string | null;
  amount: number | null;
  currentStatus: string | null;
  targetStatus: string | null;
  code: SettlementRowCode;
  params: Record<string, unknown>;
  reason: string;
  bypassable: boolean;
  forcePath: string[] | null;
  shipping: SettlementShippingInfo | null;
}

/**
 * T5 — an order already collected is NOT a failure. `sheetAmount` and
 * `collectedAmount` are deliberately separate: comparing them is the point.
 * `batch` is legitimately null for adjust-only and pre-collection rows.
 */
export interface AlreadyCollectedItem {
  row: number;
  orderId: number;
  orderCode: string;
  shippingCode: string | null;
  sheetAmount: string;
  collectedAmount: string;
  collectedAt: string | null;
  source: string | null;
  batch: {
    id: string;
    code: string;
    createdAt: string;
    actorName: string | null;
  } | null;
  bypassable: boolean;
  sameBatch: boolean;
  shipping: SettlementShippingInfo;
}

export interface UploadSettlementResponse {
  success: SettlementSuccessItem[];
  failed: SettlementFailedItem[];
  alreadyCollected: AlreadyCollectedItem[];
  /** The collection these rows landed in, with its running totals. */
  batch: SettlementBatch;
}

export interface ShortfallSettlement {
  id: number;
  code: string;
  settlementAmount: string;
  status: string;
  settlementResolved: boolean;
}

export interface AdjustSettlementPayload {
  orderId: number;
  amount: number;
}

/**
 * T3 — one collection (تحصيل) groups the rows of every sheet in a session.
 * Totals are derived server-side and arrive as decimal STRINGS; never parse
 * them into numbers to add them up.
 */
export interface SettlementBatch {
  id: string;
  code: string;
  status: 'OPEN' | 'CONFIRMED';
  totalAmount: string;
  ordersCount: number;
  createdAt: string;
  confirmedAt: string | null;
}

export async function uploadSettlementRows(
  rows: SettlementRow[],
  batchId?: string,
): Promise<UploadSettlementResponse> {
  const { data } = await api.post<UploadSettlementResponse>(
    '/orders/settlement/upload',
    { rows, ...(batchId ? { batchId } : {}) },
  );
  return data;
}

export interface SettlementBatchListItem extends SettlementBatch {
  actorName: string | null;
}

export interface SettlementBatchOrder {
  orderId: number;
  orderCode: string;
  shippingCode: string | null;
  /** What THIS collection settled — not the order's current amount. */
  amount: string;
  targetStatus: string;
  currentStatus: string;
  settledAt: string;
  customerName: string | null;
  isDeleted: boolean;
  shipping: SettlementShippingInfo;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export async function listSettlementBatches(params: {
  status?: 'OPEN' | 'CONFIRMED';
  page?: number;
  limit?: number;
}): Promise<Paginated<SettlementBatchListItem>> {
  const { data } = await api.get<Paginated<SettlementBatchListItem>>(
    '/orders/settlement/batches',
    { params },
  );
  return data;
}

export async function listSettlementBatchOrders(
  batchId: string,
  params: { page?: number; limit?: number } = {},
): Promise<Paginated<SettlementBatchOrder>> {
  const { data } = await api.get<Paginated<SettlementBatchOrder>>(
    `/orders/settlement/batches/${batchId}/orders`,
    { params },
  );
  return data;
}

/** The caller's open collection, or null. This is what makes it resumable. */
export async function getCurrentSettlementBatch(): Promise<SettlementBatch | null> {
  const { data } = await api.get<SettlementBatch | null>(
    '/orders/settlement/batches/current',
  );
  return data ?? null;
}

/** Final: a confirmed collection is never reopened and takes no more rows. */
export async function confirmSettlementBatch(
  batchId: string,
): Promise<SettlementBatch> {
  const { data } = await api.post<SettlementBatch>(
    `/orders/settlement/batches/${batchId}/confirm`,
  );
  return data;
}

export async function getShortfallSettlements(
  filter: 'pending' | 'finished' | 'all',
): Promise<ShortfallSettlement[]> {
  const { data } = await api.get<ShortfallSettlement[]>(
    '/orders/settlement/shortfall',
    { params: { filter } },
  );
  return data;
}

export async function adjustSettlement(
  orderId: number,
  amount: number,
): Promise<void> {
  await api.patch(`/orders/settlement/${orderId}/adjust`, { amount });
}

export const SETTLEMENT_REMOVAL_MODES = ['REVERT', 'CLEAR', 'DETACH'] as const;

export type SettlementRemovalMode = (typeof SETTLEMENT_REMOVAL_MODES)[number];

export const SETTLEMENT_REMOVAL_MODE_LABELS: Record<SettlementRemovalMode, string> = {
  REVERT: 'إرجاع الحالة',
  CLEAR: 'مسح مبلغ التحصيل مع إبقاء الحالة',
  DETACH: 'إزالة من التحصيل فقط',
};

export interface SettlementEditOrder {
  id: number;
  code: string;
  status: string;
  settlementAmount: string | null;
}

export interface SettlementEditResponse {
  batch: SettlementBatch;
  order: SettlementEditOrder | null;
}

export async function addSettlementBatchOrders(
  batchId: string,
  rows: SettlementRow[],
): Promise<UploadSettlementResponse> {
  const { data } = await api.post<UploadSettlementResponse>(
    `/orders/settlement/batches/${batchId}/orders`,
    { rows },
  );
  return data;
}

export async function removeSettlementBatchOrder(
  batchId: string,
  orderId: number,
  mode: SettlementRemovalMode,
): Promise<SettlementEditResponse> {
  const { data } = await api.delete<SettlementEditResponse>(
    `/orders/settlement/batches/${batchId}/orders/${orderId}`,
    { params: { mode } },
  );
  return data;
}

export async function updateSettlementBatchOrderAmount(
  batchId: string,
  orderId: number,
  amount: number,
): Promise<SettlementEditResponse> {
  const { data } = await api.patch<SettlementEditResponse>(
    `/orders/settlement/batches/${batchId}/orders/${orderId}`,
    { amount },
  );
  return data;
}
