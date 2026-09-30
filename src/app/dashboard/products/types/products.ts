export const PRODUCT_CONFIRM_OUT_OF_STOCK_MODES = {
  INHERIT: 'INHERIT',
  FOLLOW_WORKFLOW: 'FOLLOW_WORKFLOW',
  ALLOW: 'ALLOW',
  FORBID: 'FORBID',
} as const;

export type ProductConfirmOutOfStockMode =
  (typeof PRODUCT_CONFIRM_OUT_OF_STOCK_MODES)[keyof typeof PRODUCT_CONFIRM_OUT_OF_STOCK_MODES];

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string;
  color: string;
  sku: string;
  images: string[];
  image: string;
  totalOrders: number;
  totalSold: number;
  extraDetails: {
    variants?: VariantItem[];
  };
  confirmOutOfStockMode: ProductConfirmOutOfStockMode;
  variantOptions?: VariantOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Product[];
}

export type VariantItem = {
  attribute: string;
  option: string;
};

export interface VariantOption {
  attribute: string;
  options: string[];
}

// Grouped id-aware attribute shape for the Edit Product Attributes modal.
// Mirrors the backend `AttributeManualDto`: attribute/option ids are present
// so the backend can rename/remove by id (no fuzzy merge).
export interface AttributeOptionManual {
  id?: number;
  name: string;
  displayName?: string;
}

export interface AttributeManual {
  id?: number;
  name: string;
  displayName?: string;
  options: AttributeOptionManual[];
}

export interface UpdateAttributesPayload {
  attributes: AttributeManual[];
}

export interface VariantCountItem {
  attribute: string;
  option: string;
  count: number;
}

export interface VariantsCountResponse {
  productId: number;
  productName: string;
  variantCounts: VariantCountItem[];
  totalOrders: number;
}

export interface ProductState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
}

export interface UpdateVariantsPayload {
  variants: VariantItem[];
}

export interface ProductQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SyncFailure {
  storeId: number;
  provider: string;
  error: string;
}

export interface SyncProductsResponse {
  synced: number;
  created: number;
  updated: number;
  failures: SyncFailure[];
}

export interface MergeProductsPayload {
  sourceProductId: number[];
  name?: string;
  sku?: string;
  price?: number;
  image?: string;
  images?: string[];
  variants?: VariantOption[];
}

export interface JobAcceptedResponse {
  message: string;
  jobId: string;
}

export type JobStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';

// NOTE: the Prisma `sequential_jobs` table has `type`/`payload` columns, but the
// backend `GET /jobs/:jobId` response (sequential-job-queue.service.ts getStatus) does
// NOT return them. `type`/`payload` below are optional and will be undefined from the API;
// the job `type` used for toast branching must come from the Zustand store's ActiveJob.type.
export interface JobPollResponse {
  jobId: string;
  status: JobStatus;
  enqueuedAt: number;
  startedAt?: number;
  finishedAt?: number;
  result?: unknown;
  error?: string;
  type?: string;
  payload?: unknown;
}

// Sync job `result` shape. WARNING: path-dependent.
// - Aggregate path (syncAllForMerchant): { synced, created, updated, failures[] }
// - Per-store path (syncProducts):       { synced, created, updated }  (NO failures)
export interface SyncJobResult {
  synced: number;
  created: number;
  updated: number;
  failures?: { storeId: number | null; provider: string; error: string }[];
}

// formatCounts MUST tolerate a missing `failures` (per-store sync returns none).
export const formatCounts = (result: unknown): string => {
  const r = (result ?? {}) as Partial<SyncJobResult>;
  const synced = r.synced ?? 0;
  const created = r.created ?? 0;
  const updated = r.updated ?? 0;
  const failures = r.failures?.length ?? 0;
  let msg = `تمت المزامنة: ${synced} منتج (${created} جديد، ${updated} محدث)`;
  if (failures > 0) msg += ` — ${failures} أخطاء`;
  return msg;
};

export interface CreateProductAttribute {
  name: string;
  options: string[];
}

export interface CreateProductVariantOption {
  attribute: string;
  option: string;
}

export interface CreateProductVariant {
  options: CreateProductVariantOption[];
  sku?: string;
  barcode?: string;
  price?: number;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  sku?: string;
  images?: string[];
  attributes: CreateProductAttribute[];
  variants: CreateProductVariant[];
}

export interface CreatedProductOption {
  id: number;
  name: string;
  displayName: string;
}

export interface CreatedProductAttribute {
  id: number;
  name: string;
  displayName: string;
  options: CreatedProductOption[];
}

export interface CreatedProductVariant {
  id: number;
  combinationKey: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  optionIds: number[];
}

export interface CreateProductResponse {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  image: string | null;
  images: string[];
  storeId: null;
  attributes: CreatedProductAttribute[];
  variants: CreatedProductVariant[];
}

export const PRODUCT_CREATE_LIMITS = {
  attributes: 10,
  optionsPerAttribute: 100,
  variants: 100,
} as const;

export const PRODUCT_CREATE_ERROR_CODES = [
  'DUPLICATE_ATTRIBUTE_NAME',
  'DUPLICATE_OPTION_NAME',
  'VARIANT_OPTIONS_INVALID',
  'DUPLICATE_VARIANT_COMBINATION',
  'VARIANT_COMBINATIONS_INCOMPLETE',
  'TOO_MANY_VARIANTS',
  'TOO_MANY_ATTRIBUTES',
  'TOO_MANY_OPTIONS',
  'IMAGE_URL_INVALID',
  'DUPLICATE_SKU_IN_REQUEST',
  'DUPLICATE_BARCODE_IN_REQUEST',
  'SKU_TAKEN',
  'BARCODE_TAKEN',
] as const;

export type ProductCreateErrorCode = (typeof PRODUCT_CREATE_ERROR_CODES)[number];

export interface ProductCreateErrorBody {
  code: ProductCreateErrorCode;
  message: string;
  details?: {
    names?: string[];
    attribute?: string;
    values?: string[];
    variantIndex?: number;
    variantIndexes?: number[];
    missing?: string[][];
    limit?: number;
  };
}
