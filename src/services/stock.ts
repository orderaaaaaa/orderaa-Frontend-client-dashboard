import { useQuery, QueryKey, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import http from '@/lib/api/http';

export interface StockAnalysisResponse {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
  totalAvailableCount?: number;
  productsBelowMinStockCount?: number;
  productsAboveMaxStockCount?: number;
}

export interface StockVariantOption {
  variantOptionId: number;
  groupLabel: string;
  value: string;
  code: string;
  availableCount: number;
  reservedCount: number;
  processedCount: number;
  shippedCount: number;
  deliveredCount: number;
}

export interface StockProductApi {
  id: number;
  name: string;
  sku?: string;
  price: number;
  image: string;
  totalAvailableCount: number;
  variants: StockVariantOption[];
}

export interface StockListResponseFlat {
  data: StockProductApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockListResponseMeta {
  data: StockProductApi[];
  meta: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type StockListResponse = StockListResponseFlat | StockListResponseMeta;

export interface NormalizedStockList {
  data: StockProductApi[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StockFiltersDto {
  page?: number;
  limit?: number;
  search?: string;
  color?: string;
  size?: string;
  fromDate?: string;
  toDate?: string;
}

export interface StockFilterOption {
  key: string;
  value: string;
}

export interface StockFilterOptionsResponse {
  colors: StockFilterOption[];
  sizes: StockFilterOption[];
}

const STOCK_BASE_URL = '/products/stock';
const STOCK_ANALYSIS_URL = '/products/stock-analysis';
const STOCK_FILTER_OPTIONS_URL = '/products/stock/filter-options';

function normalizeStockList(payload: StockListResponse): NormalizedStockList {
  if ('meta' in payload) {
    const { data, meta } = payload;
    return {
      data,
      currentPage: meta.currentPage,
      totalPages: meta.totalPages,
      itemsPerPage: meta.itemsPerPage,
      totalItems: meta.totalItems,
      hasNextPage: meta.hasNextPage,
      hasPreviousPage: meta.hasPreviousPage,
    };
  }

  const { data, total, page, limit, totalPages } = payload;
  return {
    data,
    currentPage: page,
    totalPages,
    itemsPerPage: limit,
    totalItems: total,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function buildStockParams(filters: StockFiltersDto) {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.color) params.color = filters.color;
  if (filters.size) params.size = filters.size;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  return params;
}

export const useStockAnalysis = (
  filters?: Pick<StockFiltersDto, 'fromDate' | 'toDate'>
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_ANALYSIS, filters ?? {}] as QueryKey,
    queryFn: async () => {
      const response = await http.get<StockAnalysisResponse>(
        STOCK_ANALYSIS_URL,
        { params: buildStockParams(filters ?? {}) }
      );
      return response.data;
    },
  });
};

export const useStockProducts = (filters: StockFiltersDto) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_PRODUCTS, filters] as QueryKey,
    queryFn: async () => {
      const response = await http.get<StockListResponse>(STOCK_BASE_URL, {
        params: buildStockParams(filters),
      });
      return normalizeStockList(response.data);
    },
    placeholderData: keepPreviousData,
  });
};

export const useStockFilterOptions = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_FILTER_OPTIONS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<StockFilterOptionsResponse>(
        STOCK_FILTER_OPTIONS_URL
      );
      return response.data;
    },
    staleTime: Infinity,
  });
};

export async function fetchAllStockProducts(
  filters: Omit<StockFiltersDto, 'page' | 'limit'>
): Promise<StockProductApi[]> {
  const firstPage = await http.get<StockListResponse>(STOCK_BASE_URL, {
    params: buildStockParams({ ...filters, page: 1, limit: 1 }),
  });
  const normalizedFirst = normalizeStockList(firstPage.data);
  const totalItems = normalizedFirst.totalItems;
  if (totalItems === 0) return [];

  const response = await http.get<StockListResponse>(STOCK_BASE_URL, {
    params: buildStockParams({ ...filters, page: 1, limit: totalItems }),
  });
  return normalizeStockList(response.data).data;
}
