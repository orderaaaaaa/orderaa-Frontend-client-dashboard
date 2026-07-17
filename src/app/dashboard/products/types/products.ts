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
}

export interface AttributeManual {
  id?: number;
  name: string;
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
