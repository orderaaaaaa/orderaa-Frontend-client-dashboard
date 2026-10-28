export type StocktakeStatusWire = 'OPEN' | 'POSTED' | 'CANCELLED';

export type StocktakeLineFilter = 'ALL' | 'UNCOUNTED' | 'CHANGED';

export type StocktakeActorRef = {
  id: number;
  name: string | null;
};

export type StocktakeSummaryDto = {
  id: number;
  status: StocktakeStatusWire;
  warehouse: { id: number; name: string };
  note: string | null;
  createdAt: string;
  createdBy: StocktakeActorRef | null;
  postedBy: StocktakeActorRef | null;
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

export type StocktakesPageDto = {
  data: StocktakeSummaryDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StocktakeLinesPageDto = {
  data: StocktakeLineDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PostStocktakeResultDto = {
  stocktake: StocktakeSummaryDto;
  movementCount: number;
};

export type CreateStocktakeDto = {
  warehouseId: number;
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

export type ListStocktakesParams = {
  warehouseId?: number;
  status?: StocktakeStatusWire;
  page?: number;
  limit?: number;
};

export type StocktakeLinesParams = {
  search?: string;
  filter?: StocktakeLineFilter;
  page?: number;
  pageSize?: number;
};
