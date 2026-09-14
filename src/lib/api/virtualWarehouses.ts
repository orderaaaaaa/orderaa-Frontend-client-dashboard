import api from './index';
import type { OrderStatus } from '@/types/orders';

export const VIRTUAL_WAREHOUSE_TERM_KINDS = {
  WAREHOUSE: 'WAREHOUSE',
  STATUS_RANGE: 'STATUS_RANGE',
} as const;

export type VirtualWarehouseTermKind =
  (typeof VIRTUAL_WAREHOUSE_TERM_KINDS)[keyof typeof VIRTUAL_WAREHOUSE_TERM_KINDS];

export type VirtualWarehouseTermSign = 1 | -1;

export const VIRTUAL_WAREHOUSE_ERROR_CODES = {
  NOT_FOUND: 'VIRTUAL_WAREHOUSE_NOT_FOUND',
  NAME_TAKEN: 'VIRTUAL_WAREHOUSE_NAME_TAKEN',
  TERMS_INVALID: 'VIRTUAL_WAREHOUSE_TERMS_INVALID',
  WAREHOUSE_NOT_FOUND: 'WAREHOUSE_NOT_FOUND',
  VARIANT_NOT_FOUND: 'VARIANT_NOT_FOUND',
} as const;

export type VirtualWarehouseTermInvalidReason =
  | 'EMPTY_TERMS'
  | 'TOO_MANY_TERMS'
  | 'INVALID_SIGN'
  | 'SHAPE'
  | 'RANGE_REVERSED'
  | 'EXCLUSION_OUTSIDE_RANGE'
  | 'DUPLICATE_WAREHOUSE';

export interface VirtualWarehouseTermsInvalidError {
  code: typeof VIRTUAL_WAREHOUSE_ERROR_CODES.TERMS_INVALID;
  message: string;
  position: number | null;
  reason: VirtualWarehouseTermInvalidReason;
}

export interface VirtualWarehouseTermInput {
  sign: VirtualWarehouseTermSign;
  kind: VirtualWarehouseTermKind;
  warehouseId?: number | null;
  rangeStart?: OrderStatus | null;
  rangeEnd?: OrderStatus | null;
  excludedStatuses?: OrderStatus[];
}

export interface VirtualWarehouseTermView {
  position: number;
  sign: VirtualWarehouseTermSign;
  kind: VirtualWarehouseTermKind;
  warehouseId: number | null;
  rangeStart: OrderStatus | null;
  rangeEnd: OrderStatus | null;
  excludedStatuses: OrderStatus[];
  warehouseName?: string;
}

export interface VirtualWarehouse {
  id: number;
  name: string;
  isActive: boolean;
  terms: VirtualWarehouseTermView[];
}

export interface VirtualWarehouseSummaryCard {
  id: number;
  name: string;
  totalQuantity: number;
  outOfStockVariantCount: number;
  shortfallVariantCount: number;
  shortfallUnits: number;
}

export type VirtualWarehousePresetKey = 'CALL_CENTER_DEMAND';

export interface VirtualWarehousePreset {
  key: VirtualWarehousePresetKey;
  name: string;
  terms: Omit<VirtualWarehouseTermView, 'position' | 'warehouseName'>[];
  optionalExclusions: OrderStatus[];
}

export interface VirtualWarehousePreviewTerm {
  position: number;
  value: number;
}

export interface VirtualWarehousePreview {
  variantId: number;
  quantity: number;
  terms: VirtualWarehousePreviewTerm[];
}

export interface GetVirtualWarehousesParams {
  isActive?: boolean;
}

export interface CreateVirtualWarehouseDto {
  name: string;
  isActive?: boolean;
  terms: VirtualWarehouseTermInput[];
}

export interface UpdateVirtualWarehouseDto {
  name?: string;
  isActive?: boolean;
  terms?: VirtualWarehouseTermInput[];
}

export interface PreviewVirtualWarehouseDto {
  terms: VirtualWarehouseTermInput[];
  variantId: number;
}

export async function getVirtualWarehouses(
  params?: GetVirtualWarehousesParams
): Promise<VirtualWarehouse[]> {
  const response = await api.get('/virtual-warehouses', { params });
  return response.data as VirtualWarehouse[];
}

export async function getVirtualWarehouseSummary(): Promise<
  VirtualWarehouseSummaryCard[]
> {
  const response = await api.get('/virtual-warehouses/summary');
  return response.data as VirtualWarehouseSummaryCard[];
}

export async function getVirtualWarehousePresets(): Promise<
  VirtualWarehousePreset[]
> {
  const response = await api.get('/virtual-warehouses/presets');
  return response.data as VirtualWarehousePreset[];
}

export async function previewVirtualWarehouse(
  body: PreviewVirtualWarehouseDto
): Promise<VirtualWarehousePreview> {
  const response = await api.post('/virtual-warehouses/preview', body);
  return response.data as VirtualWarehousePreview;
}

export async function getVirtualWarehouseById(
  id: number
): Promise<VirtualWarehouse> {
  const response = await api.get(`/virtual-warehouses/${id}`);
  return response.data as VirtualWarehouse;
}

export async function createVirtualWarehouse(
  body: CreateVirtualWarehouseDto
): Promise<VirtualWarehouse> {
  const response = await api.post('/virtual-warehouses', body);
  return response.data as VirtualWarehouse;
}

export async function updateVirtualWarehouse(
  id: number,
  body: UpdateVirtualWarehouseDto
): Promise<VirtualWarehouse> {
  const response = await api.patch(`/virtual-warehouses/${id}`, body);
  return response.data as VirtualWarehouse;
}

export async function deleteVirtualWarehouse(
  id: number
): Promise<{ id: number }> {
  const response = await api.delete(`/virtual-warehouses/${id}`);
  return response.data as { id: number };
}
