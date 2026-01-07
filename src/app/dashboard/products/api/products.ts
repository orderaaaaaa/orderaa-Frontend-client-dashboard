import http from '@/lib/api/http';
import {
  ProductsResponse,
  UpdateVariantsPayload,
  VariantsOptionsResponse,
} from '../types/products';

export const productsApi = {
  getAll: async (page: number, limit: number): Promise<ProductsResponse> => {
    const response = await http.get<ProductsResponse>('/products', {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  },

  getVariantOptions: async (
    productId: number
  ): Promise<VariantsOptionsResponse> => {
    const response = await http.get<VariantsOptionsResponse>(
      `/products/${productId}/variants-options`
    );
    return response.data;
  },

  updateVariantsOptions: async (
    productId: number,
    payload: UpdateVariantsPayload
  ) => {
    await http.put(`/products/${productId}`, payload);
  },
};
