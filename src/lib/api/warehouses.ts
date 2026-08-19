import api from './index';
import type { OrderStatus } from '@/types/orders';

/**
 * Wire types for the warehouses / stock-workflows / stock-movements domain.
 * Shapes mirror the backend DTOs exactly — do not add fields the API does not send.
 */

export type StockMovementSource =
  | 'INBOUND'
  | 'WORKFLOW'
  | 'ADJUSTMENT'
  | 'TRANSFER';

export type InsufficientStockBehavior = 'THROW' | 'SKIP';

/**
 * T29 — what makes a rule fire.
 *
 * `INBOUND` exists in the enum because the wire carries it; T29's backend
 * REJECTS creating one and the rule builder offers no affordance for it —
 * T30 owns that surface.
 */
export type StockWorkflowEventType = 'CREATION' | 'TRANSITION' | 'INBOUND';

/**
 * T29 — how ONE side (source or target) of a transition rule matches a status.
 *
 * `ANY` and `RANGE` match DYNAMICALLY against the status enum: a status added
 * later inside a range (or anywhere, for ANY) joins the rule automatically.
 * That is the point of storing the type rather than an expanded list — a
 * hand-picked full list stays frozen, and the two are now told apart on reload.
 */
export type StatusSelectionType = 'ANY' | 'RANGE' | 'SPECIFIC';

export interface WarehouseApiItem {
  id: number;
  merchantId: number;
  name: string;
  address: string | null;
  isActive: boolean;
  parentWarehouseId: number | null;
  createdAt: string;
  updatedAt: string;
  children?: WarehouseApiItem[];
  parentWarehouse?: WarehouseApiItem | null;
}

export interface WarehousesPage {
  data: WarehouseApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetWarehousesParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  parentWarehouseId?: number;
}

export interface CreateWarehouseDto {
  name: string;
  address?: string;
  isActive?: boolean;
  parentWarehouseId?: number;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  isActive?: boolean;
  /** null detaches the warehouse from its parent */
  parentWarehouseId?: number | null;
}

export interface WarehouseVariantOptionRef {
  id: number;
  name: string;
}

export interface WarehouseVariantOption {
  attribute: WarehouseVariantOptionRef;
  option: WarehouseVariantOptionRef;
}

export interface WarehouseStockItemApi {
  variantId: number;
  sku?: string;
  barcode?: string;
  combinationKey: string;
  productName: string;
  quantity: number;
  options: WarehouseVariantOption[];
}

export interface WarehouseStockResponse {
  data: WarehouseStockItemApi[];
  total: number;
  totalAvailable: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetWarehouseStockParams {
  page?: number;
  limit?: number;
  /** matches product name or variant SKU */
  search?: string;
}

export interface WarehouseRef {
  id: number;
  name: string;
}

export interface StockWorkflowApiItem {
  id: number;
  merchantId: number;
  /**
   * T29 — what fires the rule, explicit instead of inferred from an empty
   * `fromStatuses` (T14's marker). Immutable after creation.
   */
  eventType: StockWorkflowEventType;
  /**
   * The per-side match TYPE. Non-null only on `TRANSITION` rules — selection
   * typing is a transition concept, so CREATION and INBOUND send null.
   */
  fromSelection: StatusSelectionType | null;
  toSelection: StatusSelectionType | null;
  /**
   * Non-empty only for a `SPECIFIC` side — with ONE carve-out: a CREATION rule
   * keeps its single target status here (with `toSelection` null), which is
   * what the backend's partial unique index is keyed on.
   */
  fromStatuses: OrderStatus[];
  toStatuses: OrderStatus[];
  /** Inclusive endpoints, set only on a `RANGE` side. */
  fromRangeStart: OrderStatus | null;
  fromRangeEnd: OrderStatus | null;
  toRangeStart: OrderStatus | null;
  toRangeEnd: OrderStatus | null;
  /**
   * T28 — SCOPE, derived from these two rather than sent as an enum:
   * both null = global, productId = product-scoped, variantId = variant-scoped.
   * Both set is impossible (400, plus a database CHECK constraint).
   */
  productId: number | null;
  variantId: number | null;
  /** null ONLY for an INBOUND rule, which has no source warehouse (T30). */
  fromWarehouseId: number | null;
  toWarehouseId: number;
  allowNegative: boolean;
  onInsufficient: InsufficientStockBehavior;
  createdAt: string;
  updatedAt: string;
  /** null exactly when `fromWarehouseId` is. */
  fromWarehouse: WarehouseRef | null;
  toWarehouse: WarehouseRef;
  product: { id: number; name: string } | null;
  variant: {
    id: number;
    combinationKey: string;
    productId: number;
    product?: { id: number; name: string };
  } | null;
}

export interface GetStockWorkflowsParams {
  toStatus?: OrderStatus;
  warehouseId?: number;
  /** T29 — narrow to one kind of rule (creation, transition, inbound). */
  eventType?: StockWorkflowEventType;
  /**
   * EXACT scope filters — asking for a product's rules returns only that
   * product's, never the global ones. That is what lets the screen show whether
   * a scope has rules of its own, which is what decides whether the global
   * rules apply to it at all.
   */
  productId?: number;
  variantId?: number;
}

/**
 * T29 — send ONLY the fields the chosen event and selection types use:
 *
 * - `CREATION`: exactly one status in `toStatuses`, no selections, no ranges.
 * - `TRANSITION`: both selections, and per side either the statuses (SPECIFIC)
 *   or the two endpoints (RANGE) or nothing at all (ANY).
 *
 * Anything else is a 400 — the backend CHECK constraints reject hybrid rows,
 * so a stale range left over from a type switch must never be shipped.
 */
export interface CreateStockWorkflowDto {
  /** Required, no default — explicitness is the point (T29 decision 10). */
  eventType: StockWorkflowEventType;
  fromSelection?: StatusSelectionType;
  toSelection?: StatusSelectionType;
  fromStatuses?: OrderStatus[];
  /** Required for CREATION (single target) and for a SPECIFIC to-side. */
  toStatuses?: OrderStatus[];
  fromRangeStart?: OrderStatus;
  fromRangeEnd?: OrderStatus;
  toRangeStart?: OrderStatus;
  toRangeEnd?: OrderStatus;
  /** T28 scope — send at most one; neither means a global rule. */
  productId?: number;
  variantId?: number;
  /** Omitted ONLY for an INBOUND rule, which has no source warehouse (T30). */
  fromWarehouseId?: number;
  toWarehouseId: number;
  allowNegative?: boolean;
  onInsufficient?: InsufficientStockBehavior;
}

/**
 * Scope AND event type are fixed at creation — delete and recreate to change
 * either. A side is merged wholesale: sending `fromSelection` replaces the
 * whole from-side (selection + statuses + range), so a partial side patch is
 * not a thing the API offers.
 */
export type UpdateStockWorkflowDto = Partial<
  Omit<CreateStockWorkflowDto, 'eventType' | 'productId' | 'variantId'>
>;

export interface StockMovementVariantRef {
  id: number;
  sku: string | null;
  combinationKey: string;
  product: { id: number; name: string };
}

export interface StockMovementApiItem {
  id: number;
  source: StockMovementSource;
  /** signed only for ADJUSTMENT movements */
  quantity: number;
  variantId: number;
  fromWarehouseId: number | null;
  toWarehouseId: number | null;
  merchantId: number;
  referenceType: string;
  referenceId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  variant: StockMovementVariantRef;
  fromWarehouse: WarehouseRef | null;
  toWarehouse: WarehouseRef | null;
}

export interface StockMovementsPage {
  data: StockMovementApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetStockMovementsParams {
  page?: number;
  limit?: number;
  source?: StockMovementSource;
  variantId?: number;
  productId?: number;
  /** matches movements whose source OR destination is this warehouse */
  warehouseId?: number;
  referenceType?: string;
  referenceId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockAdjustmentItemDto {
  variantId: number;
  /** signed, non-zero: positive adds stock, negative removes it */
  delta: number;
}

export interface AdjustStockDto {
  warehouseId: number;
  adjustments: StockAdjustmentItemDto[];
  note?: string;
}

export interface StockTransferItemDto {
  variantId: number;
  quantity: number;
}

export interface TransferStockDto {
  fromWarehouseId: number;
  toWarehouseId: number;
  items: StockTransferItemDto[];
  note?: string;
}

export interface StockBatchResult {
  batchId: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Warehouses
// ---------------------------------------------------------------------------

export async function getWarehouses(
  params?: GetWarehousesParams
): Promise<WarehousesPage> {
  const response = await api.get('/warehouses', { params });
  return response.data as WarehousesPage;
}

export async function getWarehouseById(id: number): Promise<WarehouseApiItem> {
  const response = await api.get(`/warehouses/${id}`);
  return response.data as WarehouseApiItem;
}

export async function createWarehouse(
  body: CreateWarehouseDto
): Promise<WarehouseApiItem> {
  const response = await api.post('/warehouses', body);
  return response.data as WarehouseApiItem;
}

export async function updateWarehouse(
  id: number,
  body: UpdateWarehouseDto
): Promise<WarehouseApiItem> {
  const response = await api.patch(`/warehouses/${id}`, body);
  return response.data as WarehouseApiItem;
}

export async function deleteWarehouse(id: number): Promise<void> {
  await api.delete(`/warehouses/${id}`);
}

export async function getWarehouseStock(
  id: number,
  params?: GetWarehouseStockParams
): Promise<WarehouseStockResponse> {
  const response = await api.get(`/warehouses/${id}/stock`, { params });
  return response.data as WarehouseStockResponse;
}

// ---------------------------------------------------------------------------
// Stock workflow rules
// ---------------------------------------------------------------------------

export async function getStockWorkflows(
  params?: GetStockWorkflowsParams
): Promise<StockWorkflowApiItem[]> {
  const response = await api.get('/stock-workflows', { params });
  return response.data as StockWorkflowApiItem[];
}

export async function createStockWorkflow(
  body: CreateStockWorkflowDto
): Promise<StockWorkflowApiItem> {
  const response = await api.post('/stock-workflows', body);
  return response.data as StockWorkflowApiItem;
}

export async function updateStockWorkflow(
  id: number,
  body: UpdateStockWorkflowDto
): Promise<StockWorkflowApiItem> {
  const response = await api.patch(`/stock-workflows/${id}`, body);
  return response.data as StockWorkflowApiItem;
}

export async function deleteStockWorkflow(id: number): Promise<void> {
  await api.delete(`/stock-workflows/${id}`);
}

// ---------------------------------------------------------------------------
// Stock movements
// ---------------------------------------------------------------------------

export async function getStockMovements(
  params?: GetStockMovementsParams
): Promise<StockMovementsPage> {
  const response = await api.get('/stock-movements', { params });
  return response.data as StockMovementsPage;
}

export async function adjustStock(
  body: AdjustStockDto
): Promise<StockBatchResult> {
  const response = await api.post('/stock-movements/adjustments', body);
  return response.data as StockBatchResult;
}

export async function transferStock(
  body: TransferStockDto
): Promise<StockBatchResult> {
  const response = await api.post('/stock-movements/transfers', body);
  return response.data as StockBatchResult;
}

// ---------------------------------------------------------------------------
// T27 — stock availability
// ---------------------------------------------------------------------------

export interface AvailabilityLine {
  orderProductId: number;
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  /** true when this line resolved a rule, i.e. stock would actually move */
  movesStock: boolean;
  /**
   * The SOURCE warehouse of THIS line's rule. Per line, never per order — two
   * lines can resolve different scopes and therefore different warehouses.
   */
  fromWarehouseId: number | null;
  /** the order's aggregated quantity for this variant, not this line's count */
  required: number;
  available: number;
  shortfall: number;
  /**
   * false only when the move would genuinely fail. A shortage the rule permits
   * (allowNegative, onInsufficient=SKIP) is reported without the warning.
   */
  safe: boolean;
  /** short AND this product's settings forbid confirming — blocks the order */
  blocked: boolean;
}

export interface OrderStockAvailability {
  orderId: number;
  targetStatus: OrderStatus;
  lines: AvailabilityLine[];
  canConfirm: boolean;
  blockingLines: number[];
}

export interface VariantAvailability {
  variantId: number;
  variantLabel: string;
  available: number;
  movesStock: boolean;
  fromWarehouseId: number | null;
  safe: boolean;
  /** false when the product forbids picking an unavailable variant */
  selectable: boolean;
}

/** The 409 body the confirm path returns when the settings refuse. */
export interface OutOfStockConfirmationBlocked {
  code: 'OUT_OF_STOCK_CONFIRMATION_BLOCKED';
  message: string;
  lines: {
    orderProductId: number;
    productName: string;
    variantLabel: string;
    required: number;
    available: number;
  }[];
}

export async function getOrderStockAvailability(
  orderId: number,
  targetStatus?: OrderStatus
): Promise<OrderStockAvailability> {
  const response = await api.get(`/orders/${orderId}/stock-availability`, {
    params: targetStatus ? { targetStatus } : undefined,
  });
  return response.data as OrderStockAvailability;
}

export async function getProductVariantAvailability(
  productId: number,
  orderId: number,
  targetStatus?: OrderStatus
): Promise<VariantAvailability[]> {
  const response = await api.get(
    `/products/${productId}/variants/availability`,
    { params: { orderId, ...(targetStatus ? { targetStatus } : {}) } }
  );
  return response.data as VariantAvailability[];
}
