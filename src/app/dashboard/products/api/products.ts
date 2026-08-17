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

  /**
   * T22 — المواصفات, product-wide key/value facts. This used to PUT
   * /products/:id with a `variants` body, which shared an endpoint with the
   * variants popup and silently overwrote it. It now has its own route and
   * its own table, so the two concepts cannot collide.
   */
  updateProductSpecifications: async (
    productId: number,
    specifications: { name: string; value: string }[],
  ) => {
    await http.put(`/products/${productId}/specifications`, {
      specifications,
    });
  },

  getProductSpecifications: async (productId: number) => {
    const response = await http.get<
      { id: number; name: string; value: string; position: number }[]
    >(`/products/${productId}/specifications`);
    return response.data ?? [];
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
