'use client';

import { useEffect, useState } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Checkbox } from '@/components/ui/checkbox';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { ShippingType } from '@/types/orders';

export interface ReturnDetailsData {
  returnProductIds: number[];
  customerPaymentAmount: number;
  returnShipmentContent: string;
}

interface ReturnProductOption {
  id: number;
  name: string;
  variantText?: string;
}

interface ReturnDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ReturnDetailsData) => Promise<void> | void;
  shippingType: Exclude<ShippingType, ShippingType.DELIVERY>;
  products: ReturnProductOption[];
  isSubmitting?: boolean;
}

const TITLE_BY_TYPE: Record<Exclude<ShippingType, ShippingType.DELIVERY>, string> = {
  [ShippingType.PARTIAL_RETURN]: 'تفاصيل التسليم الجزئي',
  [ShippingType.EXCHANGE]: 'تفاصيل الاستبدال',
  [ShippingType.RETURN]: 'تفاصيل الاسترجاع',
};

export default function ReturnDetailsModal({
  isOpen,
  onClose,
  onConfirm,
  shippingType,
  products,
  isSubmitting = false,
}: ReturnDetailsModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [customerPaymentAmount, setCustomerPaymentAmount] = useState<string>('');
  const [returnShipmentContent, setReturnShipmentContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setCustomerPaymentAmount('');
      setReturnShipmentContent('');
    }
  }, [isOpen]);

  const toggleProduct = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isValid =
    selectedIds.length > 0 &&
    customerPaymentAmount !== '' &&
    !Number.isNaN(Number(customerPaymentAmount)) &&
    returnShipmentContent.trim().length > 0;

  const handleConfirm = async () => {
    if (!isValid) return;
    await onConfirm({
      returnProductIds: selectedIds,
      customerPaymentAmount: Number(customerPaymentAmount),
      returnShipmentContent: returnShipmentContent.trim(),
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={TITLE_BY_TYPE[shippingType]}
      onConfirm={handleConfirm}
      confirmText="تأكيد"
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      confirmDisabled={!isValid}
      isLoading={isSubmitting}
    >
      <div className="flex flex-col gap-5" dir="rtl">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            المنتجات الراجعة <span className="text-red-500">*</span>
          </label>
          {products.length === 0 ? (
            <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
              لا توجد منتجات في هذا الطلب
            </p>
          ) : (
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto border border-[#ECECEC] rounded-lg p-2">
              {products.map((product) => {
                const checked = selectedIds.includes(product.id);
                return (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <span className="flex-1 text-sm text-[#1F1F1F]">
                      {product.name}
                      {product.variantText && (
                        <span className="text-gray-400 mr-1">
                          ({product.variantText})
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            السعر الذي سيدفعه العميل <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={customerPaymentAmount}
            onChange={(e) => setCustomerPaymentAmount(e.target.value)}
            placeholder="0"
            min={0}
            inputClassName="bg-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#1F1F1F]">
            محتوى الطرد الراجع <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="returnShipmentContent"
            value={returnShipmentContent}
            onChange={(e) => setReturnShipmentContent(e.target.value)}
            placeholder="اكتب محتوى الطرد الراجع..."
            className="min-h-[100px] text-sm bg-white"
          />
        </div>
      </div>
    </BaseModal>
  );
}
