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

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | undefined | null;
  }) => {
    const displayValue = value || '-';
    const isEmpty = !value;

    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <span className="text-[#1F1F1F] font-bold text-sm">{label}:</span>
        <span
          className={`text-sm ${isEmpty ? 'text-red-500' : 'text-[#5F5E5E]'}`}
        >
          {displayValue}
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-[600px] max-h-[90vh] bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Scaled down height */}
        <div
          className="shrink-0 h-[60px] flex items-center justify-center px-6 z-10"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-lg font-bold text-black text-center">
            تفاصيل المنتج
          </h2>

          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute left-6 w-8 h-8 p-0 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-black" strokeWidth={2} />
          </Button>
        </div>

        {/* Content - More compact padding */}
        <div className="overflow-y-auto px-6 py-4">
          <div className="flex flex-col items-center mb-4">
            <img
              src={product.image || '/wireless-headphones.png'}
              alt={product.name}
              className="w-[150px] h-[150px] object-cover rounded-xl border-2 border-[#B8A3EB] mb-3"
            />
            <h3 className="text-xl font-bold text-[#1E1E1E] text-center px-4">
              {product.name}
            </h3>
          </div>

          <div className="w-full">
            <h4 className="text-base font-bold text-primary mb-2 text-center">
              معلومات المنتج
            </h4>
            <div className="bg-gray-50/50 rounded-xl px-4 py-2">
              <DetailRow label="الخامة" value={product.material} />
              <DetailRow label="الوزن" value={product.weight} />
              <DetailRow
                label="شركة التصنيع"
                value={product.manufactureCompany}
              />
            </div>
          </div>
        </div>

        {/* Footer - Reduced padding */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-center">
          <Button
            variant="default"
            onClick={onClose}
            className="w-[120px] h-[36px] bg-primary rounded-[28px] hover:bg-[#4B1BC4] transition-colors"
          >
            <span className="text-sm font-bold text-white">إغلاق</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
