'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Product } from '@/types/orders';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProductVariantsOptions, SelectedVariant } from '@/services/orders';
import { Button } from '../ui/button';

interface AddNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, variants: SelectedVariant[], quantity: number) => Promise<void>;
  products: Product[];
}

export default function AddNewProductModal({
  isOpen,
  onClose,
  onSave,
  products,
}: AddNewProductModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const { data: variantOptions = [], isLoading: isLoadingVariants } = useProductVariantsOptions(
    selectedProduct?.id ?? null
  );

  const productOptions = useMemo(() => products.map((p) => p.name), [products]);

  const productsByName = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.name, p));
    return map;
  }, [products]);

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
    return selectedProduct !== null;
  }, [selectedProduct]);

  if (!isOpen) return null;

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
    if (!selectedProduct) return;
    try {
      const variants: SelectedVariant[] = Object.entries(selectedVariants).map(
        ([label, value]) => ({ label, value })
      );

      await onSave(selectedProduct.id, variants, quantity);
      toast.success('تم إضافة المنتج بنجاح');
      onClose();
    } catch (error: any) {
      console.error('Failed to add product:', error);
      const apiErrorMessage = error?.response?.data?.message || 'فشل في إضافة المنتج. يرجى المحاولة مرة أخرى.';
      toast.error(apiErrorMessage);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-[827px] mx-4 md:mx-0 min-h-[450px] bg-white rounded-[20px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="absolute top-0 left-0 right-0 h-[60px] rounded-t-[20px] flex items-center justify-center px-8"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">
            إضافة منتج جديد
          </h2>

          <button
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-[101px] px-8 pb-24">
          <div className="flex flex-col gap-4">
            {/* Product Type Dropdown with Search */}
            <div className="w-full">
              <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                النوع
              </label>
              <SearchableSelect
                value={selectedProduct?.name || ''}
                onValueChange={handleProductChange}
                options={productOptions}
                placeholder="اختر المنتج"
                searchPlaceholder="ابحث عن منتج..."
                emptyMessage="لا توجد منتجات"
                noResultsMessage="لا توجد نتائج للبحث"
                triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                className="rounded-2xl border-[#ECECEC]"
                searchThreshold={5}
                clearable
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  الكمية
                </label>
                <div className="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="cursor-pointer w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-[#ECECEC] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LiaMinusSolid className="w-5 h-5 text-[#5F5E5E]" />
                  </button>
                  <span className="text-xl font-bold text-[#1F1F1F] min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    disabled={quantity >= 99}
                    className="w-10 h-10 rounded-full bg-primary hover:bg-[#4B1BC4] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LiaPlusSolid className="cursor-pointer w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {selectedProduct && (
                isLoadingVariants ? (
                  <div className="flex-1 min-w-[200px] flex items-center justify-center">
                    <span className="text-gray-500">جاري تحميل الخيارات...</span>
                  </div>
                ) : variantOptions.length === 0 ? (
                  <div className="flex-1 min-w-[200px] flex items-center justify-center">
                    <span className="text-gray-500">لا توجد خيارات متاحة لهذا المنتج</span>
                  </div>
                ) : (
                  variantOptions.map((option) => (
                    <div key={option.label} className="flex-1 min-w-[200px]">
                      <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                        {option.label}
                      </label>
                      <SearchableSelect
                        value={selectedVariants[option.label] || ''}
                        onValueChange={(value) => handleVariantChange(option.label, value)}
                        options={option.values}
                        placeholder={`اختر ${option.label}`}
                        searchPlaceholder={`بحث عن ${option.label}...`}
                        emptyMessage="لا توجد خيارات متاحة"
                        noResultsMessage="لا توجد نتائج للبحث"
                        triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                        className="rounded-2xl border-[#ECECEC]"
                        disabled={option.values.length === 0}
                        searchThreshold={5}
                      />
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-[30px] right-8 left-8 flex justify-between">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
            <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-[146px] h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LiaPlusSolid className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white">إضافة</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
