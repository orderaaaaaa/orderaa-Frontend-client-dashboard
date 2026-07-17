import http from '@/lib/api/http';
import {
  ProductsResponse,
  UpdateVariantsPayload,
  VariantsCountResponse,
  ProductQueryParams,
  SyncProductsResponse,
  MergeProductsPayload,
  JobAcceptedResponse,
  UpdateAttributesPayload,
  AttributeManual,
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

  getAttributeOptions: async (
    productId: number,
  ): Promise<AttributeManual[]> => {
    const response = await http.get<{ options: AttributeManual[] }>(
      `/products/${productId}/attribute-options`,
    );
    return response.data.options ?? [];
  },

  updateVariantsOptions: async (
    productId: number,
    payload: UpdateVariantsPayload,
  ) => {
    await http.put(`/products/${productId}`, payload);
  },

  updateProductAttributes: async (
    productId: number,
    payload: UpdateAttributesPayload,
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
