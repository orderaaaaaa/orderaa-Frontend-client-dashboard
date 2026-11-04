'use client';

import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { Product } from '@/types/orders';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProductVariantsOptions } from '@/services/orders';
import { useDebounce } from '@/utils/debounce';
import {
  useOrderStockAvailabilityQuery,
  useProductVariantAvailabilityQuery,
} from '@/services/warehouses';
import { NEXT_STOCK_TARGET } from '@/lib/api/warehouses';
import { getAvailabilityRefusalMessage } from '@/utils/apiError';
import { VariantAvailabilitySelector } from '@/components/stock/VariantAvailabilitySelector';
import {
  catalogAttributesOf,
  exactVariantFor,
  probeQuantityOf,
  type Selection,
} from '@/components/stock/variantAvailabilityModel';
import { Button } from '../ui/button';
import BaseModal from '@/components/ui/base-modal';
import { MissingAttributesHint } from '@/components/ui/missing-attributes-hint';
import { missingAttributesOf } from '@/utils/variantSelection';

interface AddNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** T27: availability is resolved through THIS order, so the picker's numbers
   *  match the order cards' — same rule, same source warehouse. */
  orderId?: number;
  onSave: (
    productId: number,
    attributeOptionIds: number[],
    quantity: number
  ) => Promise<boolean>;
}

export default function AddNewProductModal({
  isOpen,
  onClose,
  orderId,
  onSave,
}: AddNewProductModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selection, setSelection] = useState<Selection>({});
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const { t } = useI18n();

  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['add-product-search', debouncedProductSearch],
    queryFn: async () => {
      const response = await http.get<{ data: Product[] }>('/products', {
        params: {
          page: 1,
          limit: 50,
          ...(debouncedProductSearch && { search: debouncedProductSearch }),
        },
      });
      return response.data.data;
    },
    enabled: isOpen,
  });

  const { data: variantOptions = [], isLoading: isLoadingVariants } =
    useProductVariantsOptions(selectedProduct?.id ?? null);

  // T27 — availability beside each size and colour.
  const {
    data: variantAvailability = [],
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
  } = useProductVariantAvailabilityQuery(
    selectedProduct?.id,
    orderId,
    NEXT_STOCK_TARGET,
    { quantity: probeQuantityOf(quantity) }
  );
  const selectedVariantAvailability = useMemo(
    () => exactVariantFor(variantAvailability, selection, variantOptions.length),
    [variantAvailability, selection, variantOptions.length]
  );

  const { data: orderAvailability } = useOrderStockAvailabilityQuery(orderId);
  const availableWarehouseNotSet =
    orderAvailability?.availableWarehouseSet === false ||
    variantAvailability.some((variant) => variant.available === null);

  const productOptions = useMemo(() => productsData.map((p) => p.name), [productsData]);

  const productsByName = useMemo(() => {
    const map = new Map<string, Product>();
    productsData.forEach((p) => map.set(p.name, p));
    return map;
  }, [productsData]);

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setSelection({});
      setQuantity(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelection({});
  }, [selectedProduct?.id]);

  const missingAttributes = useMemo(
    () =>
      missingAttributesOf(
        variantOptions.map((option) => option.attribute),
        variantOptions
          .filter((option) => selection[option.attributeId] !== undefined)
          .map((option) => option.attribute)
      ),
    [variantOptions, selection]
  );

  const isFormValid = useMemo(() => {
    const hasProduct = !!selectedProduct;
    const variantsReady = !isLoadingVariants;
    const allVariantsSelected =
      variantOptions.length === 0 ||
      Object.keys(selection).length === variantOptions.length;

    // T27: a variant the product's settings refuse cannot be added. `!== false`
    // so an unresolved or still-loading match never blocks the form.
    const stockAllows =
      !availableWarehouseNotSet && selectedVariantAvailability?.selectable !== false;

    return (
      hasProduct &&
      variantsReady &&
      allVariantsSelected &&
      stockAllows &&
      quantity > 0
    );
  }, [
    selectedProduct,
    variantOptions,
    selection,
    isLoadingVariants,
    selectedVariantAvailability,
    availableWarehouseNotSet,
    quantity,
  ]);

  const handleProductChange = (productName: string) => {
    const product = productsByName.get(productName) || null;
    setSelectedProduct(product);
  };

  const handleSave = async () => {
    if (!selectedProduct || isSaving) return;
    setIsSaving(true);
    try {
      const attributeOptionIds = Object.values(selection);

      const applied = await onSave(
        selectedProduct.id,
        attributeOptionIds,
        quantity
      );
      if (!applied) return;
      toast.success('تم إضافة المنتج بنجاح');
      onClose();
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(
        getAvailabilityRefusalMessage(error, 'فشل في إضافة المنتج. يرجى المحاولة مرة أخرى.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة منتج جديد"
      onConfirm={handleSave}
      confirmText={isSaving ? 'جاري الإضافة...' : 'إضافة'}
      confirmIcon={<LiaPlusSolid className="w-5 h-5 text-white" />}
      isLoading={isSaving}
      confirmDisabled={!isFormValid}
      height="min-h-[450px]"
    >
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label className="block text-lg font-bold text-foreground mb-3 text-right">
            النوع
          </label>
          <SearchableSelect
            value={selectedProduct?.name || ''}
            onValueChange={handleProductChange}
            onClear={() => {
              setSelectedProduct(null);
              setProductSearch('');
            }}
            options={productOptions}
            placeholder="اختر المنتج"
            searchPlaceholder="ابحث عن منتج..."
            emptyMessage="لا توجد منتجات"
            noResultsMessage="لا توجد نتائج للبحث"
            triggerClassName="h-[44px] md:h-[57px] bg-background border border-border rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-muted-foreground"
            className="rounded-2xl border-border"
            onSearch={setProductSearch}
            loading={isLoadingProducts}
            clearable
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-lg font-bold text-foreground mb-3 text-right">
              الكمية
            </label>
            <div className="h-[44px] md:h-[57px] bg-card border border-border rounded-[38px] px-3 md:px-4 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-muted hover:bg-border p-0"
              >
                <LiaMinusSolid className="w-5 h-5 text-muted-foreground" />
              </Button>
              <span className="text-xl font-bold text-foreground min-w-[40px] text-center">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={incrementQuantity}
                disabled={quantity >= 99}
                className="w-10 h-10 rounded-full bg-primary hover:bg-brand-hover p-0"
              >
                <LiaPlusSolid className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>

          {selectedProduct &&
            (isLoadingVariants ? (
              <div className="flex-1 min-w-[200px] flex items-center justify-center">
                <span className="text-gray-500">
                  جاري تحميل الخيارات...
                </span>
              </div>
            ) : variantOptions.length === 0 ? (
              <div className="flex-1 min-w-[200px] flex items-center justify-center">
                <span className="text-gray-500">
                  لا توجد خيارات متاحة لهذا المنتج
                </span>
              </div>
            ) : (
              null
            ))}
        </div>

        {selectedProduct && !isLoadingVariants && (
          <MissingAttributesHint missing={missingAttributes} />
        )}

        {selectedProduct && !isLoadingVariants && (
          <div className="flex flex-col gap-2">
            {variantOptions.length > 0 && (
              <VariantAvailabilitySelector
                productName={selectedProduct.name}
                attributes={catalogAttributesOf(variantOptions)}
                variants={variantAvailability}
                selection={selection}
                onChange={setSelection}
                isLoading={isLoadingAvailability}
                isError={isErrorAvailability}
              />
            )}
            {availableWarehouseNotSet ? (
              <p className="text-sm font-semibold text-destructive">
                {t('orderDetails.stock.availableWarehouseNotSet')}
              </p>
            ) : (
              selectedVariantAvailability?.selectable === false && (
                <p className="text-sm font-semibold text-destructive">
                  {t('orderDetails.variants.blockedSelection')}
                </p>
              )
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
