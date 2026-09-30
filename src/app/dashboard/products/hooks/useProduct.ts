import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { merchantSettingsApi } from '@/app/dashboard/store-settings/api/storeApi';
import { productsApi } from '../api/products';
import { productKeys } from './queryKeys';
import { useJobStore } from '@/store/useJobStore';
import { useI18n } from '@/i18n/I18nProvider';
import { getApiErrorMessage } from '@/utils/apiError';
import type { StoreConfirmOutOfStock } from '@/utils/storeConfirmMode';
import {
  ProductConfirmOutOfStockMode,
  UpdateVariantsPayload,
  UpdateAttributesPayload,
  ProductQueryParams,
  VariantsCountResponse,
  CreateProductPayload,
  ProductCreateErrorBody,
  PRODUCT_CREATE_ERROR_CODES,
} from '../types/products';

export const useGetProducts = (params: ProductQueryParams, enabled = true) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getAll(params),
    placeholderData: (previousData) => previousData,
    enabled,
  });
};

export const useGetProductVariantCounts = (productId: number) => {
  return useQuery<VariantsCountResponse>({
    queryKey: productKeys.variants(productId),
    queryFn: () => productsApi.getVariantOptions(productId),
    enabled: !!productId,
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
    mutationFn: (payload: UpdateVariantsPayload) =>
      productsApi.updateProductSpecifications(
        productId,
        payload.variants.map((item) => ({
          name: item.attribute,
          value: item.option,
        })),
      ),

    onError: (_err, _payload, context: any) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.all, context.previousProducts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.variants(productId),
      });
    },
  });
};

export const useUpdateProductAttributes = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAttributesPayload) =>
      productsApi.updateProductAttributes(productId, payload),

    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProducts = queryClient.getQueryData(productKeys.all);

      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => {
        if (!old || !old.data) return old;

        const flatVariants = newPayload.attributes.flatMap((attr) =>
          attr.options.map((opt) => ({ attribute: attr.name, option: opt.name })),
        );

        return {
          ...old,
          data: old.data.map((product: any) =>
            product.id === productId
              ? {
                  ...product,
                  extraDetails: {
                    ...product.extraDetails,
                    variants: flatVariants,
                  },
                }
              : product,
          ),
        };
      });

      return { previousProducts };
    },

    onError: (_err, _payload, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.all, context.previousProducts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.variants(productId),
      });
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

export const useUpdateProductConfirmOutOfStock = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({
      productId,
      confirmOutOfStockMode,
    }: UpdateProductConfirmOutOfStockVariables) =>
      productsApi.updateConfirmOutOfStock(productId, confirmOutOfStockMode),
    onSuccess: () => {
      toast.success(t('products.confirmOutOfStock.saved'));
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, t('products.confirmOutOfStock.saveFailed')),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useSyncProducts = () => {
  return useMutation({
    mutationFn: () => productsApi.sync(),
    onSuccess: (data) => {
      toast.info('تم بدء مزامنة المنتجات...', { autoClose: 2000 });
      useJobStore.getState().addJob({ jobId: data.jobId, type: 'SYNC', label: 'مزامنة المنتجات' });
    },
  });
};

const joinValues = (values?: string[]) =>
  values && values.length > 0 ? `: ${values.join('، ')}` : '';

const productCreateErrorBody = (
  error: unknown,
): ProductCreateErrorBody | null => {
  const data = (error as { response?: { data?: Partial<ProductCreateErrorBody> } })
    ?.response?.data;
  const code = data?.code;
  if (!code || !PRODUCT_CREATE_ERROR_CODES.includes(code)) return null;
  return { code, message: data.message ?? '', details: data.details };
};

export const getProductCreateErrorMessage = (error: unknown): string => {
  const body = productCreateErrorBody(error);
  if (!body) return getApiErrorMessage(error, 'تعذر حفظ المنتج، حاول مرة أخرى');
  const details = body.details ?? {};
  switch (body.code) {
    case 'DUPLICATE_ATTRIBUTE_NAME':
      return `يوجد متغيران بنفس الاسم${joinValues(details.names)}`;
    case 'DUPLICATE_OPTION_NAME':
      return `توجد قيمتان متكررتان في المتغير ${details.attribute ?? ''}${joinValues(details.names)}`;
    case 'VARIANT_OPTIONS_INVALID':
      return 'أحد صفوف المتغيرات لا يطابق قيم المتغيرات، راجع الصفوف وحاول مرة أخرى';
    case 'DUPLICATE_VARIANT_COMBINATION':
      return 'يوجد صفان بنفس مجموعة القيم';
    case 'VARIANT_COMBINATIONS_INCOMPLETE':
      return 'يجب إضافة صف لكل مجموعة من قيم المتغيرات';
    case 'TOO_MANY_VARIANTS':
      return `الحد الأقصى لعدد صفوف المتغيرات هو ${details.limit ?? 100}`;
    case 'TOO_MANY_ATTRIBUTES':
      return `الحد الأقصى لعدد المتغيرات هو ${details.limit ?? 10}`;
    case 'TOO_MANY_OPTIONS':
      return `الحد الأقصى لقيم المتغير ${details.attribute ?? ''} هو ${details.limit ?? 100}`;
    case 'IMAGE_URL_INVALID':
      return 'تعذر استخدام إحدى الصور، أعد رفعها وحاول مرة أخرى';
    case 'DUPLICATE_SKU_IN_REQUEST':
      return `رمز SKU مكرر بين صفوف المتغيرات${joinValues(details.values)}`;
    case 'DUPLICATE_BARCODE_IN_REQUEST':
      return `الباركود مكرر بين صفوف المتغيرات${joinValues(details.values)}`;
    case 'SKU_TAKEN':
      return `رمز SKU مستخدم بالفعل${joinValues(details.values)}`;
    case 'BARCODE_TAKEN':
      return `الباركود مستخدم بالفعل${joinValues(details.values)}`;
  }
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      toast.success('تم إضافة المنتج بنجاح');
    },
    onError: (error: unknown) => {
      toast.error(getProductCreateErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
