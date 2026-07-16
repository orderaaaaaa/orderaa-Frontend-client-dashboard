import http from '@/lib/api/http';
import {
  ProductsResponse,
  UpdateVariantsPayload,
  VariantsCountResponse,
  ProductQueryParams,
  SyncProductsResponse,
  MergeProductsPayload,
  JobAcceptedResponse,
} from '../types/products';

export const productsApi = {
  getAll: async (params: ProductQueryParams): Promise<ProductsResponse> => {
    const response = await http.get<ProductsResponse>('/products', {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search && { search: params.search }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    });
    return response.data;
  },

  getVariantOptions: async (
    productId: number,
  ): Promise<VariantsCountResponse> => {
    const response = await http.get<VariantsCountResponse>(
      `/products/${productId}/variant-counts`,
    );
    return response.data;
  },

  updateVariantsOptions: async (
    productId: number,
    payload: UpdateVariantsPayload,
  ) => {
    await http.put(`/products/${productId}`, payload);
  },

  sync: async (): Promise<JobAcceptedResponse> => {
    const response = await http.post<JobAcceptedResponse>('/products/sync');
    return response.data;
  },

  merge: async (targetProductId: number, payload: MergeProductsPayload): Promise<JobAcceptedResponse> => {
    const response = await http.post<JobAcceptedResponse>(`/products/${targetProductId}/merge`, payload);
    return response.data;
  },
};
