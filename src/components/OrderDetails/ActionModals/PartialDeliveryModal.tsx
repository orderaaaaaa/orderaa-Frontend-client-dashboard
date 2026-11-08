'use client';

import React, { useMemo, useState } from 'react';
import { LiaMinusSolid, LiaPlusSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { useI18n } from '@/i18n/I18nProvider';
import { OrderProduct, ShippingType } from '@/types/orders';
import { usePartialDelivery } from '@/services/logistics';
import { isNoEditPartialDeliveryCarrier, type ShippingImplementation } from '@/types/shippingCompanies';
import {
  RETURN_SHIPMENT_CONTENT_MAX_LENGTH,
  isBlankReturnShipmentContent,
  returnShipmentContentOf,
  variantLabelOf,
} from '@/utils/partialDelivery/returnShipmentContent';

interface PartialDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderProducts: OrderProduct[];
  totalCost: number;
  carrierImplementation?: ShippingImplementation;
  shippingType?: ShippingType;
  orderStatus: string;
  hasActiveShippingId: boolean;
  parentReturnContent: string | null;
}

interface VariantGroup {
  key: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  rows: OrderProduct[];
}

const groupKey = (op: OrderProduct) => `v${op.variantId}`;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export default function PartialDeliveryModal({
  isOpen,
  onClose,
  orderId,
  orderProducts,
  totalCost,
  carrierImplementation,
  shippingType,
  orderStatus,
  hasActiveShippingId,
  parentReturnContent,
}: PartialDeliveryModalProps) {
  const [refusedByGroup, setRefusedByGroup] = useState<Record<string, number>>(
    {},
  );
  const [overridePrice, setOverridePrice] = useState<string>('');
  const [contentOverride, setContentOverride] = useState<string | null>(null);
  const partialDelivery = usePartialDelivery();
  const { t } = useI18n();

  const groups = useMemo<VariantGroup[]>(() => {
    const byKey = new Map<string, VariantGroup>();
    orderProducts.forEach((op) => {
      const key = groupKey(op);
      const existing = byKey.get(key);
      if (existing) {
        existing.rows.push(op);
        return;
      }
      byKey.set(key, {
        key,
        name: op.products.name,
        variantLabel: variantLabelOf(op),
        unitPrice: op.price,
        rows: [op],
      });
    });
    return Array.from(byKey.values());
  }, [orderProducts]);

  const selectedIds = useMemo(
    () =>
      groups.flatMap((group) =>
        group.rows
          .slice(0, refusedByGroup[group.key] ?? 0)
          .map((row) => row.id),
      ),
    [groups, refusedByGroup],
  );

  const refusedValue = useMemo(() => {
    const selected = new Set(selectedIds);
    return roundMoney(
      orderProducts
        .filter((op) => selected.has(op.id))
        .reduce((sum, op) => sum + op.price, 0),
    );
  }, [orderProducts, selectedIds]);

  const calculatedPrice =
    shippingType === ShippingType.PARTIAL_RETURN ? totalCost : roundMoney(totalCost - refusedValue);
  const selectedSet = new Set(selectedIds);
  const refusedUnits = orderProducts.filter((op) => selectedSet.has(op.id));
  const prefill = returnShipmentContentOf(refusedUnits);
  const contentValue = contentOverride ?? prefill;
  const sentContent =
    contentOverride === null || isBlankReturnShipmentContent(contentOverride) ? prefill : contentOverride;
  const tooLong = sentContent.length > RETURN_SHIPMENT_CONTENT_MAX_LENGTH;
  const totalUnits = orderProducts.length;
  const refusesAll = totalUnits > 0 && selectedIds.length === totalUnits;
  const overrideValue = overridePrice === '' ? undefined : Number(overridePrice);
  const overrideInvalid =
    overrideValue !== undefined &&
    (!Number.isFinite(overrideValue) || overrideValue < 0);
  const splitSendsCarrierEdit =
    carrierImplementation === 'TURBO' &&
    hasActiveShippingId &&
    orderStatus !== 'DELIVERED' &&
    (shippingType !== ShippingType.PARTIAL_RETURN ||
      (overrideValue ?? calculatedPrice) !== totalCost ||
      sentContent !== (parentReturnContent ?? ''));
  const isNoEditCarrier =
    carrierImplementation !== undefined && isNoEditPartialDeliveryCarrier(carrierImplementation);
  const isPending = partialDelivery.isPending;

  const setRefused = (group: VariantGroup, next: number) => {
    const clamped = Math.max(0, Math.min(group.rows.length, next));
    setRefusedByGroup((prev) => ({ ...prev, [group.key]: clamped }));
    setContentOverride(null);
  };

  const handleReset = () => {
    setRefusedByGroup({});
    setOverridePrice('');
    setContentOverride(null);
  };

  const handleClose = () => {
    if (isPending) return;
    handleReset();
    onClose();
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0 || refusesAll || overrideInvalid || tooLong) return;
    partialDelivery.mutate(
      {
        orderId,
        returnedOrderProductIds: selectedIds,
        adjustedTotalCost: overrideValue,
        returnShipmentContent: sentContent,
      },
      {
        onSuccess: () => {
          handleReset();
          onClose();
        },
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('closure.partial')}
      onConfirm={handleConfirm}
      confirmText={isPending ? 'جاري التنفيذ...' : 'تأكيد'}
      confirmDisabled={
        isPending || selectedIds.length === 0 || refusesAll || overrideInvalid || tooLong
      }
    >
      <div className="space-y-6">
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          {t('partialDelivery.banner.confirmOutcome')}
        </div>

        {(isNoEditCarrier || orderStatus === 'DELIVERED') && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            {t('partialDelivery.banner.noCarrierEdit')}
          </div>
        )}

        {splitSendsCarrierEdit && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            {t('partialDelivery.banner.followsCarrier')}
          </div>
        )}

        {orderStatus === 'DELIVERED' && shippingType !== ShippingType.PARTIAL_RETURN && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            {t('partialDelivery.banner.checkAmount')}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
            حدد القطع المرفوضة
          </label>
          <div className="flex flex-col gap-3">
            {groups.map((group) => {
              const refused = refusedByGroup[group.key] ?? 0;
              return (
                <div
                  key={group.key}
                  className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {group.name}
                    </span>
                    {group.variantLabel && (
                      <span className="text-xs text-muted-foreground">
                        {group.variantLabel}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {group.unitPrice} ج.م • {group.rows.length} قطعة
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      الكمية المرفوضة
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="زيادة"
                        disabled={isPending || refused >= group.rows.length}
                        onClick={() => setRefused(group, refused + 1)}
                        className="flex size-10 md:size-8 items-center justify-center rounded-full border border-border text-primary-text disabled:opacity-40"
                      >
                        <LiaPlusSolid className="size-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {refused}
                      </span>
                      <button
                        type="button"
                        aria-label="إنقاص"
                        disabled={isPending || refused <= 0}
                        onClick={() => setRefused(group, refused - 1)}
                        className="flex size-10 md:size-8 items-center justify-center rounded-full border border-border text-primary-text disabled:opacity-40"
                      >
                        <LiaMinusSolid className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {refusesAll && (
            <p className="text-xs text-red-600">
              لا يمكن رفض كل القطع، استخدم المرتجع الكامل
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الإجمالي الأصلي</span>
            <span className="text-sm font-bold">{totalCost} ج.م</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">قيمة القطع المرفوضة</span>
            <span className="text-sm font-bold">{refusedValue} ج.م</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">السعر بعد الخصم</span>
            <span className="text-sm font-bold text-primary-text">
              {calculatedPrice} ج.م
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
            السعر الجديد للطلب الأصلي (اختياري)
          </label>
          <input
            type="number"
            min={0}
            value={overridePrice}
            disabled={isPending}
            onChange={(e) => setOverridePrice(e.target.value)}
            placeholder={String(calculatedPrice)}
            className="w-full border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {overrideInvalid && (
            <p className="text-xs text-red-600">
              السعر النهائي يجب أن يكون رقمًا غير سالب
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">محتوى شحنة المرتجع</label>
          {shippingType === ShippingType.PARTIAL_RETURN &&
            parentReturnContent !== null &&
            !isBlankReturnShipmentContent(parentReturnContent) && (
              <p className="text-xs text-muted-foreground">
                {t('partialDelivery.returnContent.current', { note: parentReturnContent })}
              </p>
            )}
          <textarea
            rows={3}
            value={contentValue}
            disabled={isPending}
            onChange={(e) => setContentOverride(e.target.value)}
            onBlur={() => {
              if (isBlankReturnShipmentContent(contentOverride)) setContentOverride(null);
            }}
            className="w-full border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 resize-y"
          />
          <p className="text-xs text-muted-foreground">
            {t('partialDelivery.returnContent.counter', {
              count: sentContent.length,
              max: RETURN_SHIPMENT_CONTENT_MAX_LENGTH,
            })}
          </p>
          {tooLong && (
            <p className="text-xs text-red-600">
              {t('partialDelivery.returnContent.tooLong', { max: RETURN_SHIPMENT_CONTENT_MAX_LENGTH })}
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
