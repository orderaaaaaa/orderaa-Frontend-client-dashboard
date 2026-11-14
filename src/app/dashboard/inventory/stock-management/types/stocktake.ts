export type StocktakeStatusWire = 'OPEN' | 'POSTED' | 'CANCELLED';

export const STOCKTAKE_TYPES = ['MAIN', 'RETURNS'] as const;

export type StocktakeType = (typeof STOCKTAKE_TYPES)[number];

export type StocktakeLineFilter = 'ALL' | 'UNCOUNTED' | 'CHANGED';

export type StocktakeWarehouseDto = {
  id: number;
  name: string;
};

export type StocktakeTypeOptionDto = {
  type: StocktakeType;
  warehouse: StocktakeWarehouseDto | null;
  available: boolean;
};

export type StocktakePersonDto = {
  id: number;
  name: string | null;
};

export type StocktakeSummaryDto = {
  id: number;
  status: StocktakeStatusWire;
  type: StocktakeType | null;
  warehouse: StocktakeWarehouseDto;
  note: string | null;
  createdAt: string;
  createdBy: StocktakePersonDto | null;
  postedBy: StocktakePersonDto | null;
  postedAt: string | null;
  lineCount: number;
  countedCount: number;
  changedCount: number;
  netDelta: number | null;
};

export type StocktakeLineDto = {
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  sku: string | null;
  expectedQuantity: number;
  currentQuantity: number;
  countedQuantity: number | null;
  countedAt: string | null;
  postedDelta: number | null;
};

export type StocktakeLinesPageDto = {
  data: StocktakeLineDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StocktakeListDto = {
  data: StocktakeSummaryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PostStocktakeResultDto = {
  stocktake: StocktakeSummaryDto;
  movementCount: number;
};

export type CreateStocktakeDto = {
  type?: StocktakeType;
  warehouseId?: number;
  note?: string | null;
};

export type StocktakeLineInputDto = {
  variantId: number;
  countedQuantity: number | null;
};

export type UpdateStocktakeLinesDto = {
  lines: StocktakeLineInputDto[];
};

export type PostStocktakeDto = {
  note?: string | null;
};

export type AddStocktakeLinesDto = {
  variantIds: number[];
};

export type RemoveStocktakeLinesDto = {
  variantIds: number[];
  discardCounted?: boolean;
};

export type StocktakeSelectionDto = {
  variantIds: number[];
  countedVariantIds: number[];
};

export type ListStocktakesQueryDto = {
  type?: StocktakeType;
  warehouseId?: number;
  status?: StocktakeStatusWire;
  page?: number;
  limit?: number;
};

export type StocktakeLinesQueryDto = {
  search?: string;
  filter?: StocktakeLineFilter;
  page?: number;
  pageSize?: number;
};

export type StocktakeShortageLineDto = {
  variantId: number;
  warehouseId: number;
  warehouseName: string;
  productName: string;
  variantLabel: string;
  sku?: string | null;
  required: number;
  available: number;
};

export type StocktakeRefusedLine = {
  variantId: number;
  productName: string;
  variantLabel: string;
  sku: string | null;
  live: number;
  counted: number | null;
  countedAt: string | null;
  required: number;
  available: number;
};
