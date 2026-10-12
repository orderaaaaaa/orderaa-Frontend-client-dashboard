import {
  useQuery,
  useMutation,
  useMutationState,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { merchantSettingsApi } from '@/app/dashboard/store-settings/api/storeApi';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { productsApi } from '../api/products';
import { productKeys } from './queryKeys';
import { useJobStore } from '@/store/useJobStore';
import { useI18n } from '@/i18n/I18nProvider';
import { getApiErrorMessage } from '@/utils/apiError';
import type { StoreConfirmOutOfStock } from '@/utils/storeConfirmMode';
import {
  ProductConfirmOutOfStockMode,
  UpdateAttributesPayload,
  ProductQueryParams,
  AttributeCountsResponse,
  CreateProductPayload,
  ProductDetail,
  SpecificationInput,
  UpdateProductScalarsPayload,
  UpsertVariantsPayload,
} from '../types/products';
import {
  productApiErrorBody,
  toastProductError,
} from '../utils/productApiError';

export const useGetProducts = (params: ProductQueryParams, enabled = true) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getAll(params),
    placeholderData: (previousData) => previousData,
    enabled,
  });
};

export const useGetProductAttributeCounts = (productId: number) => {
  return useQuery<AttributeCountsResponse>({
    queryKey: productKeys.variants(productId),
    queryFn: () => productsApi.getAttributeCounts(productId),
    enabled: !!productId,
  });
};

export const useProductDetail = (productId: number) => {
  return useQuery<ProductDetail>({
    queryKey: productKeys.detail(productId),
    queryFn: () => productsApi.getDetail(productId),
    enabled: Number.isInteger(productId) && productId > 0,
    retry: (failureCount, error) =>
      productApiErrorBody(error)?.code !== 'PRODUCT_NOT_FOUND' &&
      failureCount < 2,
  });
};

const productEditKeys = (productId: number): QueryKey[] => [
  productKeys.detail(productId),
  productKeys.lists(),
  productKeys.variants(productId),
  [QUERY_KEYS.PRODUCT_ATTRIBUTE_OPTIONS, productId],
  [QUERY_KEYS.PRODUCT_VARIANTS_OPTIONS, productId],
];

const applyDetail = (
  queryClient: QueryClient,
  productId: number,
  detail: ProductDetail,
) => {
  queryClient.setQueryData(productKeys.detail(productId), detail);
  return invalidateAndWait(queryClient, productEditKeys(productId));
};

export const usePatchProduct = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductScalarsPayload) =>
      productsApi.patchProduct(productId, payload),
    onSuccess: (detail) => applyDetail(queryClient, productId, detail),
    onError: (error: unknown) => {
      toastProductError(error, 'تعذر حفظ بيانات المنتج');
    },
  });
};

export const useUpsertVariants = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertVariantsPayload) =>
      productsApi.upsertVariants(productId, payload),
    onSuccess: (detail) => applyDetail(queryClient, productId, detail),
    onError: (error: unknown) => {
      toastProductError(error, 'تعذر حفظ المتغيرات');
    },
  });
};

export interface DeleteVariantVariables {
  variantId: number;
  confirmStoreLink: boolean;
}

export const useDeleteVariant = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, confirmStoreLink }: DeleteVariantVariables) =>
      productsApi.deleteVariant(productId, variantId, confirmStoreLink),
    onSuccess: (detail) => applyDetail(queryClient, productId, detail),
    onError: (error: unknown) => {
      const code = productApiErrorBody(error)?.code;
      if (code === 'VARIANT_STORE_LINK_CONFIRMATION_REQUIRED') return;
      toastProductError(error, 'تعذر حذف المتغير');
      if (code === 'VARIANT_IN_USE' || code === 'VARIANT_NOT_FOUND') {
        return invalidateAndWait(queryClient, [productKeys.detail(productId)]);
      }
    },
  });
};

/**
 * T22 — saves المواصفات (specifications) through their own endpoint.
 *
 * The optimistic patch of `extraDetails.variants` is deliberately gone: that
 * key no longer exists, and writing it was half of the collision that let one
 * popup silently wipe the other. Specifications now round-trip through
 * `product_specifications` instead.
 */
export const useUpdateProductSpecifications = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (specifications: SpecificationInput[]) =>
      productsApi.replaceSpecifications(productId, specifications),
    onSuccess: (saved) => {
      queryClient.setQueryData<ProductDetail>(
        productKeys.detail(productId),
        (current) =>
          current && {
            ...current,
            specifications: saved.map(({ name, value }) => ({ name, value })),
          },
      );
      return invalidateAndWait(queryClient, productEditKeys(productId));
    },
    onError: (error: unknown) => {
      toastProductError(error, 'تعذر حفظ المواصفات');
    },
  });
};

export const useUpdateProductAttributes = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAttributesPayload) =>
      productsApi.updateProductAttributes(productId, payload),
    onSuccess: () => invalidateAndWait(queryClient, productEditKeys(productId)),
    onError: (error: unknown) => {
      toastProductError(error, 'تعذر حفظ الخصائص');
    },
  });
};

export const useStoreConfirmOutOfStock = (): StoreConfirmOutOfStock => {
  const { data } = useQuery({
    queryKey: ['merchantSettings'],
    queryFn: merchantSettingsApi.getSettings,
  });

  return data?.allowConfirmOutOfStock ?? null;
};

export interface UpdateProductConfirmOutOfStockVariables {
  productId: number;
  confirmOutOfStockMode: ProductConfirmOutOfStockMode;
}

const CONFIRM_OUT_OF_STOCK_MUTATION_KEY = [
  ...productKeys.all,
  'confirmOutOfStock',
] as const;

export const useUpdateProductConfirmOutOfStock = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationKey: CONFIRM_OUT_OF_STOCK_MUTATION_KEY,
    mutationFn: ({
      productId,
      confirmOutOfStockMode,
    }: UpdateProductConfirmOutOfStockVariables) =>
      productsApi.updateConfirmOutOfStock(productId, confirmOutOfStockMode),
    onSuccess: async (_data, { productId }) => {
      await invalidateAndWait(queryClient, [
        productKeys.lists(),
        productKeys.detail(productId),
      ]);
      toast.success(t('products.confirmOutOfStock.saved'));
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, t('products.confirmOutOfStock.saveFailed')),
      );
    },
  });
};

export const usePendingConfirmOutOfStockIds = (): number[] =>
  useMutationState({
    filters: { mutationKey: CONFIRM_OUT_OF_STOCK_MUTATION_KEY, status: 'pending' },
    select: (mutation) =>
      (mutation.state.variables as UpdateProductConfirmOutOfStockVariables)
        .productId,
  });

export const useSyncProducts = () => {
  return useMutation({
    mutationFn: () => productsApi.sync(),
    onSuccess: (data) => {
      toast.info('تم بدء مزامنة المنتجات...', { autoClose: 2000 });
      useJobStore.getState().addJob({ jobId: data.jobId, type: 'SYNC', label: 'مزامنة المنتجات' });
    },
    onError: (error: unknown) => {
      toastProductError(error, 'تعذر بدء مزامنة المنتجات، حاول مرة أخرى');
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: async () => {
      await invalidateAndWait(queryClient, [productKeys.lists()]);
      toast.success('تم إضافة المنتج بنجاح');
    },
    onError: (error: unknown) => {
      toastProductError(error, 'تعذر حفظ المنتج، حاول مرة أخرى');
    },
  });
};
