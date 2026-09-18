export enum IntegrationProvider {
  EASY_ORDERS = 'EASY_ORDERS',
  SHOPIFY = 'SHOPIFY',
}

export enum IntegrationConfigType {
  API = 'API',
  WEBHOOK = 'WEBHOOK',
}

export interface StoreInfoDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateIntegrationRequest {
  storeId: number;
  provider: IntegrationProvider;
  configType: IntegrationConfigType;
  apiKey: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateIntegrationRequest {
  storeId?: number;
  configType?: IntegrationConfigType;
  apiKey?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
}

export interface IntegrationResponse {
  id: number;
  storeId: number;
  merchantId: number;
  provider: IntegrationProvider;
  configType: IntegrationConfigType;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  store?: StoreInfoDto;
  metadata?: Record<string, unknown>;
  stockSyncEnabled: boolean;
  stockSyncWarehouseId: number | null;
  stockSyncLocationId: string | null;
  stockSyncStopSellingEnabled: boolean;
}

export interface StoreResponse {
  id: number;
  name: string;
  description: string;
  merchantId: number;
  createdAt: string;
  updatedAt: string;
}

export const STOCK_PUSH_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export type StockPushStatus =
  (typeof STOCK_PUSH_STATUS)[keyof typeof STOCK_PUSH_STATUS];

export const STOCK_POLICY_STATUS = {
  PENDING: 'PENDING',
  DONE: 'DONE',
  SKIPPED: 'SKIPPED',
  FAILED: 'FAILED',
} as const;

export type StockPolicyStatus =
  (typeof STOCK_POLICY_STATUS)[keyof typeof STOCK_POLICY_STATUS];

export const STOCK_PUSH_ERROR_CODE = {
  SHOPIFY_SCOPES_MISSING: 'SHOPIFY_SCOPES_MISSING',
  SHOPIFY_INVENTORY_ITEM_NOT_FOUND: 'SHOPIFY_INVENTORY_ITEM_NOT_FOUND',
  SHOPIFY_TRACKING_UPDATE_FAILED: 'SHOPIFY_TRACKING_UPDATE_FAILED',
  SHOPIFY_ACTIVATION_FAILED: 'SHOPIFY_ACTIVATION_FAILED',
  SHOPIFY_INVENTORY_POLICY_UPDATE_FAILED:
    'SHOPIFY_INVENTORY_POLICY_UPDATE_FAILED',
  POLICY_ORIGINAL_NOT_SAVED: 'POLICY_ORIGINAL_NOT_SAVED',
  SHOPIFY_VARIANT_NOT_FOUND: 'SHOPIFY_VARIANT_NOT_FOUND',
  SHOPIFY_POLICY_RESTORE_FAILED: 'SHOPIFY_POLICY_RESTORE_FAILED',
  POLICY_CHANGED_IN_SHOPIFY: 'POLICY_CHANGED_IN_SHOPIFY',
  SHOPIFY_SET_QUANTITY_FAILED: 'SHOPIFY_SET_QUANTITY_FAILED',
  PROVIDER_REJECTED: 'PROVIDER_REJECTED',
  PROVIDER_UNREACHABLE: 'PROVIDER_UNREACHABLE',
  MISSING_TAAGER_CODE: 'MISSING_TAAGER_CODE',
  MISSING_INVENTORY_ITEM: 'MISSING_INVENTORY_ITEM',
  INTERRUPTED: 'INTERRUPTED',
} as const;

export type StockPushErrorCode =
  (typeof STOCK_PUSH_ERROR_CODE)[keyof typeof STOCK_PUSH_ERROR_CODE];

export const UNLINKED_REASON = {
  NO_MAPPING: 'NO_MAPPING',
  MISSING_TAAGER_CODE: 'MISSING_TAAGER_CODE',
  MISSING_INVENTORY_ITEM: 'MISSING_INVENTORY_ITEM',
} as const;

export type UnlinkedVariantReason =
  (typeof UNLINKED_REASON)[keyof typeof UNLINKED_REASON];

export interface StockSyncRequest {
  enabled: boolean;
  warehouseId?: number | null;
  locationId?: string | null;
  stopSellingEnabled?: boolean;
}

export interface ShopifyLocation {
  id: string;
  name: string;
}

export interface QueuedResponse {
  queued: number;
}

export interface StockPushLogItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  sku: string | null;
  quantity: number;
  status: StockPushStatus;
  attempts: number;
  lastErrorCode: string | null;
  lastError: string | null;
  updatedAt: string;
  sentAt: string | null;
}

export interface StockPushLogPage {
  data: StockPushLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockPolicyLogItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  sku: string | null;
  status: StockPolicyStatus;
  attempts: number;
  lastErrorCode: string | null;
  lastError: string | null;
  updatedAt: string;
  finishedAt: string | null;
}

export interface StockPolicyLogPage {
  data: StockPolicyLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnlinkedVariant {
  productId: number;
  productName: string;
  variantId: number;
  variantLabel: string;
  sku: string | null;
  reason: UnlinkedVariantReason;
}

export interface UnlinkedVariantPage {
  data: UnlinkedVariant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
