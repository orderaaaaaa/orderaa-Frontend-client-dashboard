import http from '@/lib/api/http';
import {
  ProductsResponse,
  AttributeCountsResponse,
  ProductQueryParams,
  MergeProductsPayload,
  JobAcceptedResponse,
  UpdateAttributesPayload,
  ProductConfirmOutOfStockMode,
  CreateProductPayload,
  CreateProductResponse,
  ProductDetail,
  ProductSpecification,
  SpecificationInput,
  UpdateProductScalarsPayload,
  UpsertVariantsPayload,
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

  getDetail: async (productId: number): Promise<ProductDetail> => {
    const response = await http.get<ProductDetail>(`/products/${productId}`);
    return response.data;
  },

  patchProduct: async (
    productId: number,
    payload: UpdateProductScalarsPayload,
  ): Promise<ProductDetail> => {
    const response = await http.patch<ProductDetail>(
      `/products/${productId}`,
      payload,
    );
    return response.data;
  },

  upsertVariants: async (
    productId: number,
    payload: UpsertVariantsPayload,
  ): Promise<ProductDetail> => {
    const response = await http.put<ProductDetail>(
      `/products/${productId}/variants`,
      payload,
    );
    return response.data;
  },

  deleteVariant: async (
    productId: number,
    variantId: number,
    confirmStoreLink: boolean,
  ): Promise<ProductDetail> => {
    const response = await http.delete<ProductDetail>(
      `/products/${productId}/variants/${variantId}`,
      confirmStoreLink ? { params: { confirmStoreLink: true } } : undefined,
    );
    return response.data;
  },

  getAttributeCounts: async (
    productId: number,
  ): Promise<AttributeCountsResponse> => {
    const response = await http.get<AttributeCountsResponse>(
      `/products/${productId}/attribute-counts`,
    );
    return response.data;
  },

  replaceSpecifications: async (
    productId: number,
    specifications: SpecificationInput[],
  ): Promise<ProductSpecification[]> => {
    const response = await http.put<ProductSpecification[]>(
      `/products/${productId}/specifications`,
      { specifications },
    );
    return response.data ?? [];
  },

  updateProductAttributes: async (
    productId: number,
    payload: UpdateAttributesPayload,
  ) => {
    await http.put(`/products/${productId}`, payload);
  },

  updateConfirmOutOfStock: async (
    productId: number,
    confirmOutOfStockMode: ProductConfirmOutOfStockMode,
  ) => {
    await http.put(`/products/${productId}`, { confirmOutOfStockMode });
  },

  create: async (
    payload: CreateProductPayload,
  ): Promise<CreateProductResponse> => {
    const response = await http.post<CreateProductResponse>(
      '/products',
      payload,
    );
    return response.data;
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
