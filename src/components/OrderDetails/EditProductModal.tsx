'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import { useProductVariantsOptions } from '@/services/orders';
import {
  useOrderlessVariantAvailabilityQuery,
  useProductVariantAvailabilityQuery,
} from '@/services/warehouses';
import { NEXT_STOCK_TARGET } from '@/lib/api/warehouses';
import BaseModal from '@/components/ui/base-modal';
import { MissingAttributesHint } from '@/components/ui/missing-attributes-hint';
import { VariantAvailabilitySelector } from '@/components/stock/VariantAvailabilitySelector';
import {
  catalogAttributesOf,
  namesFromSelection,
  selectionFromNames,
  type Selection,
} from '@/components/stock/variantAvailabilityModel';

export type EditProductAvailability =
  | { kind: 'order'; orderId: number }
  | {
      kind: 'orderless';
      targetStatus: 'NEW_ORDER' | 'CONFIRMED';
      quantity: number;
      draft: Record<string, number>;
    };

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    attributeOptionIds: number[],
    selectedValues: Record<string, string>
  ) => Promise<boolean>;
  productId: number;
  productName: string;
  availability: EditProductAvailability;
  currentVariants: Record<string, string>;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSave,
  productId,
  productName,
  availability,
  currentVariants,
}: EditProductModalProps) {
  const [draft, setDraft] = useState<Selection | null>(null);

  const { data: variantOptions = [], isLoading } = useProductVariantsOptions(
    isOpen ? productId : null
  );

  const orderAvailability = useProductVariantAvailabilityQuery(
    productId,
    availability.kind === 'order' ? availability.orderId : undefined,
    NEXT_STOCK_TARGET,
    { quantity: 1 }
  );
  const orderlessAvailability = useOrderlessVariantAvailabilityQuery(
    availability.kind === 'orderless' ? productId : undefined,
    availability.kind === 'orderless' ? availability.targetStatus : 'CONFIRMED',
    availability.kind === 'orderless' ? availability.quantity : 1,
    availability.kind === 'orderless' ? availability.draft : {}
  );
  const variantAvailability =
    (availability.kind === 'order'
      ? orderAvailability.data
      : orderlessAvailability.data) ?? [];

  useEffect(() => {
    if (isOpen) setDraft(null);
  }, [isOpen]);

  const seed = useMemo(
    () => selectionFromNames(variantOptions, currentVariants),
    [variantOptions, currentVariants]
  );
  const selection = draft ?? seed;

  const hasChanges = useMemo(() => {
    const keys = new Set([...Object.keys(selection), ...Object.keys(seed)]);
    return [...keys].some(
      (key) => selection[Number(key)] !== seed[Number(key)]
    );
  }, [selection, seed]);

  const missingAttributes = useMemo(
    () =>
      variantOptions
        .filter((group) => selection[group.attributeId] === undefined)
        .map((group) => group.attribute),
    [variantOptions, selection]
  );

  const handleSave = async () => {
    if (!hasChanges || missingAttributes.length > 0) return;

    const attributeOptionIds = Object.values(selection);

    const applied = await onSave(
      attributeOptionIds,
      namesFromSelection(variantOptions, selection)
    );
    if (applied) onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل المنتج"
      onConfirm={handleSave}
      confirmText="حفظ"
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      confirmDisabled={!hasChanges || missingAttributes.length > 0}
    >
      {isLoading ? (
        <div className="w-full text-center text-gray-500">جاري التحميل...</div>
      ) : variantOptions.length === 0 ? (
        <div className="w-full text-center text-gray-500">لا توجد خيارات متاحة</div>
      ) : (
        <VariantAvailabilitySelector
          productName={productName}
          attributes={catalogAttributesOf(variantOptions)}
          variants={variantAvailability}
          selection={selection}
          onChange={setDraft}
        />
      )}
      {!isLoading && (
        <MissingAttributesHint missing={missingAttributes} className="mt-4" />
      )}
    </BaseModal>
  );
}
