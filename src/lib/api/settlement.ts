import api from './index';

export interface SettlementRow {
  orderCode?: string;
  shippingCompanyCode?: string;
  settlementAmount: number;
  targetStatus: 'COLLECTED' | 'RETURNED_SETTLED';
}

export interface SettlementSuccessItem {
  orderCode: string;
  shippingCode: string | null;
  amount: number;
  currentStatus: string;
  newStatus: string;
}

export interface SettlementFailedItem {
  row: number;
  orderCode: string | null;
  shippingCode: string | null;
  amount: number | null;
  currentStatus: string | null;
  targetStatus: string | null;
  reason: string;
}

/**
 * T5 — an order already collected is NOT a failure. `sheetAmount` and
 * `collectedAmount` are deliberately separate: comparing them is the point.
 * `batch` is legitimately null for adjust-only and pre-collection rows.
 */
export interface AlreadyCollectedItem {
  row: number;
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
