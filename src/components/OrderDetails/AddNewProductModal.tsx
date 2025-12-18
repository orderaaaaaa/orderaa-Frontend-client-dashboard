'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaPlusSolid, LiaMinusSolid, LiaSearchSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Product } from '@/types/orders';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useFilterOptionsQuery } from '@/services/orders';
import { Button } from '../ui/button';

interface AddNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, size: string, color: string, quantity: number) => Promise<void>;
  products: Product[];
}

const defaultSizeOptions = ['37', '38', '39', '40', '41', '42', '43', '44', '45'];
const defaultColorOptions = ['اسود', 'ابيض', 'احمر', 'ازرق', 'اخضر', 'بني', 'رمادي'];

export default function AddNewProductModal({
  isOpen,
  onClose,
  onSave,
  products,
}: AddNewProductModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Fetch filter options using React Query
  const { data: filterOptions, isLoading } = useFilterOptionsQuery();
  const sizeOptions = filterOptions?.data?.productSizes?.length
    ? filterOptions.data.productSizes
    : defaultSizeOptions;
  const colorOptions = filterOptions?.data?.productColors?.length
    ? filterOptions.data.productColors
    : defaultColorOptions;

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setSize('');
      setColor('');
      setQuantity(1);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Check if form is valid (product selected is required)
  const isFormValid = useMemo(() => {
    return selectedProduct !== null;
  }, [selectedProduct]);

  if (!isOpen) return null;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedProduct) return;
    try {
      await onSave(selectedProduct.id, size, color, quantity);
      toast.success('تم إضافة المنتج بنجاح');
      onClose();
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('فشل في إضافة المنتج. يرجى المحاولة مرة أخرى.');
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
          className="absolute top-0 left-0 right-0 h-[79px] rounded-t-[20px] flex items-center justify-center px-8"
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                  className="w-full h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E] flex items-center justify-between"
                  style={{ direction: 'rtl' }}
                >
                  <span>{selectedProduct ? selectedProduct.name : 'اختر المنتج'}</span>
                  <svg
                    width="15"
                    height="30"
                    viewBox="0 0 15 30"
                    fill="none"
                    className="transform rotate-90"
                  >
                    <path
                      d="M13.5 7.5L7.5 13.5L1.5 7.5"
                      stroke="#5F5E5E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {isProductDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#ECECEC] rounded-2xl shadow-lg max-h-80 overflow-hidden z-10">
                    {/* Search Input */}
                    <div className="sticky top-0 bg-white p-4 border-b border-[#ECECEC]">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="ابحث عن منتج..."
                          className="w-full h-[45px] bg-white border border-[#ECECEC] rounded-[25px] px-12 text-right text-base"
                          style={{ direction: 'rtl' }}
                          autoFocus
                        />
                        <LiaSearchSolid className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#5F5E5E]" />
                      </div>
                    </div>
                    {/* Products List */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsProductDropdownOpen(false);
                              setSearchTerm('');
                            }}
                            className="w-full px-6 py-3 text-right text-lg text-[#5F5E5E] hover:bg-purple-50 transition-colors flex justify-end items-center gap-2"
                          >
                            <span>{product.name}</span>
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-6 text-center text-[#5F5E5E]">
                          لا توجد منتجات
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row with 3 dropdowns */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Quantity Controls */}
              <div className="flex-1">
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
                    className="w-10 h-10 rounded-full bg-[#5D24E1] hover:bg-[#4B1BC4] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LiaPlusSolid className="cursor-pointer w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Color Dropdown */}
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  اللون
                </label>
                <SearchableSelect
                  value={color}
                  onValueChange={setColor}
                  options={colorOptions}
                  placeholder="اختر اللون"
                  searchPlaceholder="بحث عن اللون..."
                  emptyMessage="لا توجد ألوان متاحة"
                  noResultsMessage="لا توجد نتائج للبحث"
                  triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                  className="rounded-2xl border-[#ECECEC]"
                  loading={isLoading}
                  searchThreshold={5}
                />
              </div>

              {/* Size Dropdown */}
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  القياس
                </label>
                <SearchableSelect
                  value={size}
                  onValueChange={setSize}
                  options={sizeOptions}
                  placeholder="اختر القياس"
                  searchPlaceholder="بحث عن القياس..."
                  emptyMessage="لا توجد مقاسات متاحة"
                  noResultsMessage="لا توجد نتائج للبحث"
                  triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                  className="rounded-2xl border-[#ECECEC]"
                  loading={isLoading}
                  searchThreshold={5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
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
            className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LiaPlusSolid className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white">إضافة</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
