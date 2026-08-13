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

export interface WarehouseApiItem {
  id: number;
  merchantId: number;
  name: string;
  address: string | null;
  isActive: boolean;
  isDefault: boolean;
  /** whether this warehouse counts towards available-stock totals */
  countsAsAvailable: boolean;
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
  isDefault?: boolean;
  countsAsAvailable?: boolean;
  parentWarehouseId?: number;
}

export interface UpdateWarehouseDto {
  name?: string;
  address?: string;
  isActive?: boolean;
  isDefault?: boolean;
  countsAsAvailable?: boolean;
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
  /** null = the rule applies on order creation */
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  fromWarehouseId: number;
  toWarehouseId: number;
  allowNegative: boolean;
  onInsufficient: InsufficientStockBehavior;
  createdAt: string;
  updatedAt: string;
  fromWarehouse: WarehouseRef;
  toWarehouse: WarehouseRef;
}

export interface GetStockWorkflowsParams {
  toStatus?: OrderStatus;
  warehouseId?: number;
}

export interface CreateStockWorkflowDto {
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  fromWarehouseId: number;
  toWarehouseId: number;
  allowNegative?: boolean;
  onInsufficient?: InsufficientStockBehavior;
}

export type UpdateStockWorkflowDto = Partial<CreateStockWorkflowDto>;

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
