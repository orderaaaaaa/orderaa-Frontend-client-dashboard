'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { Product } from '@/types/orders';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProductVariantsOptions, SelectedVariant } from '@/services/orders';
import { useDebounce } from '@/utils/debounce';
import { Button } from '../ui/button';
import BaseModal from '@/components/ui/base-modal';

interface AddNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productId: number,
    variants: SelectedVariant[],
    quantity: number
  ) => Promise<void>;
}

export default function AddNewProductModal({
  isOpen,
  onClose,
  onSave,
}: AddNewProductModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);

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

  const productOptions = useMemo(() => productsData.map((p) => p.name), [productsData]);

  const productsByName = useMemo(() => {
    const map = new Map<string, Product>();
    productsData.forEach((p) => map.set(p.name, p));
    return map;
  }, [productsData]);

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setSelectedVariants({});
      setQuantity(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedVariants({});
  }, [selectedProduct?.id]);

  const isFormValid = useMemo(() => {
    const hasProduct = !!selectedProduct;
    const variantsReady = !isLoadingVariants;
    const allVariantsSelected =
      variantOptions.length === 0 ||
      Object.keys(selectedVariants).length === variantOptions.length;

    return hasProduct && variantsReady && allVariantsSelected && quantity > 0;
  }, [selectedProduct, variantOptions, selectedVariants, isLoadingVariants, quantity]);

  const handleProductChange = (productName: string) => {
    const product = productsByName.get(productName) || null;
    setSelectedProduct(product);
  };

  const handleVariantChange = (label: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedProduct || isSaving) return;
    setIsSaving(true);
    try {
      const variants: SelectedVariant[] = Object.entries(selectedVariants).map(
        ([label, value]) => ({ label, value })
      );

      await onSave(selectedProduct.id, variants, quantity);
      toast.success('تم إضافة المنتج بنجاح');
      onClose();
    } catch (error: any) {
      console.error('Failed to add product:', error);
      const apiErrorMessage =
        error?.response?.data?.message ||
        'فشل في إضافة المنتج. يرجى المحاولة مرة أخرى.';
      toast.error(apiErrorMessage);
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
          <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
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
            triggerClassName="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-[#5F5E5E]"
            className="rounded-2xl border-[#ECECEC]"
            onSearch={setProductSearch}
            loading={isLoadingProducts}
            clearable
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
              الكمية
            </label>
            <div className="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-3 md:px-4 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-[#ECECEC] p-0"
              >
                <LiaMinusSolid className="w-5 h-5 text-[#5F5E5E]" />
              </Button>
              <span className="text-xl font-bold text-[#1F1F1F] min-w-[40px] text-center">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={incrementQuantity}
                disabled={quantity >= 99}
                className="w-10 h-10 rounded-full bg-primary hover:bg-[#4B1BC4] p-0"
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
              variantOptions.map((option) => (
                <div key={option.label} className="flex-1 min-w-[200px]">
                  <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                    {option.label}
                  </label>
                  <SearchableSelect
                    value={selectedVariants[option.label] || ''}
                    onValueChange={(value) =>
                      handleVariantChange(option.label, value)
                    }
                    options={option.values}
                    placeholder={`اختر ${option.label}`}
                    searchPlaceholder={`بحث عن ${option.label}...`}
                    emptyMessage="لا توجد خيارات متاحة"
                    noResultsMessage="لا توجد نتائج للبحث"
                    triggerClassName="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-[#5F5E5E]"
                    className="rounded-2xl border-[#ECECEC]"
                    disabled={option.values.length === 0}
                    searchThreshold={5}
                  />
                </div>
              ))
            ))}
        </div>
      </div>
    </BaseModal>
  );
}
