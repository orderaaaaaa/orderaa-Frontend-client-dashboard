'use client';

import { X } from 'lucide-react';
import { OrderProduct } from '@/types/orders';
import { Button } from '../ui/button';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderProduct: OrderProduct | null;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  orderProduct,
}: ProductDetailsModalProps) {
  if (!isOpen || !orderProduct) return null;

  const product = orderProduct.products;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Detail row component for consistent styling
  const DetailRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => {
    const displayValue = value || '-';
    const isEmpty = !value;

    return (
      <div className="flex justify-between items-center py-3 border-b border-gray-100">
        <span className="text-[#1F1F1F] font-bold text-base">{label}:</span>
        <span className={`text-base ${isEmpty ? 'text-red-500' : 'text-[#5F5E5E]'}`}>
          {displayValue}
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-[900px] max-h-[90vh] bg-white rounded-[20px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="sticky top-0 h-[79px] rounded-t-[20px] flex items-center justify-center px-8 z-10"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">
            تفاصيل المنتج
          </h2>

          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6 text-black" strokeWidth={2} />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-79px)] px-8 py-6">
          {/* Product Image and Name */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={product.image || '/wireless-headphones.png'}
              alt={product.name}
              className="w-[200px] h-[200px] object-cover rounded-2xl border-2 border-[#B8A3EB] mb-4"
            />
            <h3 className="text-2xl font-bold text-[#1E1E1E] text-center">
              {product.name}
            </h3>
          </div>

          {/* Product Details */}
          <div className="max-w-2xl mx-auto">
            <h4 className="text-lg font-bold text-[#5D24E1] mb-4 text-center">معلومات المنتج</h4>
            <DetailRow label="الخامة" value={product.material} />
            <DetailRow label="الوزن" value={product.weight} />
            <DetailRow label="شركة التصنيع" value={product.manufactureCompany} />
          </div>
        </div>

        {/* Close Button at Bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-center">
          <Button
            variant="default"
            onClick={onClose}
            className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center hover:bg-[#4B1BC4] transition-colors"
          >
            <span className="text-lg font-bold text-white">إغلاق</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
