'use client';

import BaseModal from '@/components/ui/base-modal';
import { Button } from '../ui/button';
import { OrderProduct } from '@/types/orders';

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
  const attributes = (orderProduct?.attributes ?? []).filter(
    (a) => a?.name && a?.options?.name,
  );
  const price = orderProduct?.price ?? product?.price;

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
    <BaseModal
      isOpen={isOpen && !!orderProduct}
      onClose={onClose}
      title="تفاصيل المنتج"
      showFooter={false}
      maxWidth="md:max-w-[600px]"
    >
      {product && (
        <div>
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

          {attributes.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-base font-bold text-primary mb-2 text-center">
                الخصائص
              </h4>
              <div className="bg-gray-50/50 rounded-xl px-4 py-2">
                {attributes.map((attr, idx) => (
                  <DetailRow
                    key={idx}
                    label={attr.name}
                    value={attr.options.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="w-full">
            <h4 className="text-base font-bold text-primary mb-2 text-center">
              معلومات المنتج
            </h4>
            <div className="bg-gray-50/50 rounded-xl px-4 py-2">
              <DetailRow label="SKU" value={orderProduct?.sku || product.sku} />
              <DetailRow
                label="السعر"
                value={price != null ? `${price} جنيه` : undefined}
              />
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

      <div className="flex justify-center pt-4">
        <Button
          variant="default"
          onClick={onClose}
          className="w-[120px] h-[36px] rounded-[28px]"
        >
          <span className="text-sm font-bold text-white">إغلاق</span>
        </Button>
      </div>
    </BaseModal>
  );
}
