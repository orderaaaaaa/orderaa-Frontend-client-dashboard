'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
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
  const product = orderProduct?.products;

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
    <DialogPrimitive.Root
      open={isOpen && !!orderProduct}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] max-h-[90vh] bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col mx-4">
          <div
            className="shrink-0 h-[60px] flex items-center justify-center px-6 z-10 relative"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-lg font-bold text-black text-center">
              تفاصيل المنتج
            </DialogPrimitive.Title>

            <DialogPrimitive.Close className="absolute left-6 w-8 h-8 p-0 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
              <LiaTimesSolid className="w-5 h-5 text-black cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            تفاصيل المنتج
          </DialogPrimitive.Description>

          {product && (
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
          )}

          <div className="shrink-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-center">
            <Button
              variant="default"
              onClick={onClose}
              className="w-[120px] h-[36px] bg-primary rounded-[28px] hover:bg-[#4B1BC4] transition-colors"
            >
              <span className="text-sm font-bold text-white">إغلاق</span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
