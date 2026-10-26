'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LiaPlusSolid, LiaSpinnerSolid, LiaTimesSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import ProductSelectionModal, {
  type SelectableProduct,
} from '@/components/ui/product-selection-modal';
import type {
  FollowupChangeProductInput,
  FollowupChangeProductsBody,
  FollowupChangeProductsResponse,
  FollowupChangeProductVariant,
  FollowupCustomVariant,
} from '@/lib/api/followup';
import { useFollowupChangeProductsMutation } from '@/services/followup';
import { orderDetailsQueryOptions } from '@/services/orders';
import { mapOrderProductToVariantInfo, type Order } from '@/types/orders';
import { getApiErrorMessage } from '@/utils/apiError';
import { CARRIER_SEND_NOT_SENT_WARNING, carrierSendNeedsAttention } from '@/utils/manualOrder/carrierSend';

const MAX_TOTAL_COST = 9_999_999;

interface ChangeProductsLine {
  key: string;
  productId: number;
  name: string;
  variants: FollowupChangeProductVariant[];
  customVariants: FollowupCustomVariant[];
  quantity: number;
}

interface ChangeProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  onDone?: (response: FollowupChangeProductsResponse) => void;
}

const lineKeyOf = (
  productId: number,
  variants: FollowupChangeProductVariant[],
  customVariants: FollowupCustomVariant[],
): string =>
  JSON.stringify([
    productId,
    variants.map((v) => [v.name, v.optionName]),
    customVariants.map((c) => [c.label, c.value]),
  ]);

const mergeLines = (
  current: ChangeProductsLine[],
  incoming: ChangeProductsLine[],
): ChangeProductsLine[] => {
  const merged = new Map(current.map((line) => [line.key, line]));
  incoming.forEach((line) => {
    const existing = merged.get(line.key);
    merged.set(
      line.key,
      existing ? { ...existing, quantity: existing.quantity + line.quantity } : line,
    );
  });
  return Array.from(merged.values());
};

const linesFromOrder = (order: Order): ChangeProductsLine[] =>
  mergeLines(
    [],
    order.order_products.map((orderProduct) => {
      const info = mapOrderProductToVariantInfo(orderProduct);
      const variants = info.attributes.map((a) => ({ name: a.name, optionName: a.value }));
      const customVariants = info.customVariants ?? [];
      return {
        key: lineKeyOf(orderProduct.productId, variants, customVariants),
        productId: orderProduct.productId,
        name: info.productName,
        variants,
        customVariants,
        quantity: 1,
      };
    }),
  );

const linesFromPicker = (products: SelectableProduct[]): ChangeProductsLine[] =>
  products.map((product) => {
    const variants = (product.selectedVariants ?? []).map((v) => ({
      name: v.attribute,
      optionName: v.option,
    }));
    return {
      key: lineKeyOf(product.id, variants, []),
      productId: product.id,
      name: product.name,
      variants,
      customVariants: [],
      quantity: 1,
    };
  });

export default function ChangeProductsModal({
  isOpen,
  onClose,
  orderId,
  onDone,
}: ChangeProductsModalProps) {
  const orderQuery = useQuery({ ...orderDetailsQueryOptions(orderId), enabled: isOpen });
  const changeProductsMutation = useFollowupChangeProductsMutation();
  const [editedLines, setEditedLines] = useState<ChangeProductsLine[] | null>(null);
  const [totalCostInput, setTotalCostInput] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const prefilledLines = useMemo(
    () => (orderQuery.data ? linesFromOrder(orderQuery.data) : []),
    [orderQuery.data],
  );
  const lines = editedLines ?? prefilledLines;

  const isPending = changeProductsMutation.isPending;
  const totalCost = totalCostInput.trim() === '' ? undefined : Number(totalCostInput);
  const isTotalCostInvalid =
    totalCost !== undefined &&
    (!Number.isFinite(totalCost) || totalCost < 0 || totalCost > MAX_TOTAL_COST);
  const canConfirm =
    orderQuery.isSuccess && lines.length > 0 && !isTotalCostInvalid && !isPending;

  const resetForm = () => {
    setEditedLines(null);
    setTotalCostInput('');
    setIsPickerOpen(false);
  };

  const handleClose = () => {
    if (isPending) return;
    resetForm();
    onClose();
  };

  const handleProductsPicked = (products: SelectableProduct[]) => {
    setIsPickerOpen(false);
    if (products.length === 0) return;
    setEditedLines(mergeLines(lines, linesFromPicker(products)));
  };

  const handleRemoveLine = (key: string) => {
    setEditedLines(lines.filter((line) => line.key !== key));
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    const products: FollowupChangeProductInput[] = lines.map(
      ({ productId, quantity, variants, customVariants }) => ({
        productId,
        quantity,
        variants,
        customVariants,
      }),
    );
    const body: FollowupChangeProductsBody = { products, totalCost };
    try {
      const response = await changeProductsMutation.mutateAsync({ orderId, ...body });
      if (carrierSendNeedsAttention(response.carrierSend)) {
        toast.warning(CARRIER_SEND_NOT_SENT_WARNING);
      } else {
        toast.success('تم تغيير المنتج بنجاح');
      }
      resetForm();
      onDone?.(response);
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر تغيير المنتج'));
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="تغيير المنتج"
        onConfirm={handleConfirm}
        confirmText={isPending ? 'جاري التنفيذ...' : 'تأكيد'}
        confirmDisabled={!canConfirm}
        isLoading={isPending}
        maxWidth="md:max-w-2xl"
      >
        <div className="flex flex-col gap-6" dir="rtl">
          {orderQuery.isLoading ? (
            <div className="flex items-center justify-center py-6">
              <LiaSpinnerSolid className="size-5 animate-spin text-gray-400" />
            </div>
          ) : orderQuery.isError ? (
            <p className="text-sm text-red-600">تعذر تحميل تفاصيل الطلب</p>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-[#1F1F1F]">المنتجات</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setIsPickerOpen(true)}
                    disabled={isPending}
                  >
                    <LiaPlusSolid className="size-3.5" />
                    إضافة منتج
                  </Button>
                </div>
                {lines.length === 0 ? (
                  <p className="text-sm text-gray-500">لم يتم اختيار منتجات</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {lines.map((line) => {
                      const variantLabels = [
                        ...line.variants.map((v) => `${v.name}: ${v.optionName}`),
                        ...line.customVariants.map((c) => `${c.label}: ${c.value}`),
                      ];
                      return (
                        <div
                          key={line.key}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[#ECECEC]"
                        >
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span className="text-sm font-medium text-[#1F1F1F] truncate">
                              {line.name}
                            </span>
                            {variantLabels.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {variantLabels.join(' • ')}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">× {line.quantity}</span>
                          <button
                            type="button"
                            aria-label="إزالة المنتج"
                            onClick={() => handleRemoveLine(line.key)}
                            disabled={isPending}
                            className="shrink-0 p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <LiaTimesSolid className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  type="number"
                  label="السعر الإجمالي (اختياري)"
                  value={totalCostInput}
                  onChange={(e) => setTotalCostInput(e.target.value)}
                  min={0}
                  max={MAX_TOTAL_COST}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="اتركه فارغًا لاستخدام سعر المنتجات"
                  error={isTotalCostInvalid ? 'أدخل مبلغًا صحيحًا بين 0 و 9,999,999' : undefined}
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500">
                  المبلغ يشمل الشحن. اتركه فارغًا لاستخدام سعر المنتجات مع الشحن كما هو.
                </p>
              </div>
            </>
          )}
        </div>
      </BaseModal>

      <ProductSelectionModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleProductsPicked}
      />
    </>
  );
}
