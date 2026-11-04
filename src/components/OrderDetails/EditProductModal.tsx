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
import { useAnyBlockedLine } from '@/components/stock/blockedLinesStore';
import { StockSubmitBlockedHint } from '@/components/stock/StockSubmitBlockedHint';
import {
  catalogAttributesOf,
  namesFromSelection,
  probeQuantityOf,
  selectionFromNames,
  type Selection,
} from '@/components/stock/variantAvailabilityModel';

export type EditProductAvailability =
  | { kind: 'order'; orderId: number; quantity: number }
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

  const {
    data: variantOptions = [],
    isLoading,
    isError: isErrorCatalog,
    error: catalogError,
    refetch: refetchCatalog,
  } = useProductVariantsOptions(isOpen ? productId : null);

  const orderAvailability = useProductVariantAvailabilityQuery(
    productId,
    availability.kind === 'order' ? availability.orderId : undefined,
    NEXT_STOCK_TARGET,
    { quantity: probeQuantityOf(availability.kind === 'order' ? availability.quantity : 1) }
  );
  const orderlessAvailability = useOrderlessVariantAvailabilityQuery(
    availability.kind === 'orderless' ? productId : undefined,
    availability.kind === 'orderless' ? availability.targetStatus : 'CONFIRMED',
    availability.kind === 'orderless' ? probeQuantityOf(availability.quantity) : 1,
    availability.kind === 'orderless' ? availability.draft : {}
  );
  const activeAvailability =
    availability.kind === 'order' ? orderAvailability : orderlessAvailability;
  const variantAvailability = activeAvailability.data ?? [];

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

  const anyStockBlocked = useAnyBlockedLine('edit:');

  const stockBlocked = hasChanges && anyStockBlocked;

  const missingAttributes = useMemo(
    () =>
      variantOptions
        .filter((group) => selection[group.attributeId] === undefined)
        .map((group) => group.attribute),
    [variantOptions, selection]
  );

  const handleSave = async () => {
    if (!hasChanges || missingAttributes.length > 0 || stockBlocked || isErrorCatalog) return;

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
      confirmDisabled={!hasChanges || missingAttributes.length > 0 || stockBlocked || isErrorCatalog}
    >
      {isLoading ? (
        <div className="w-full text-center text-gray-500">جاري التحميل...</div>
      ) : variantOptions.length === 0 && !isErrorCatalog ? (
        <div className="w-full text-center text-gray-500">لا توجد خيارات متاحة</div>
      ) : (
        <VariantAvailabilitySelector
          productName={productName}
          attributes={catalogAttributesOf(variantOptions)}
          variants={variantAvailability}
          selection={selection}
          onChange={setDraft}
          isError={isErrorCatalog}
          catalogError={isErrorCatalog ? catalogError : null}
          onCatalogRetry={() => void refetchCatalog()}
          availabilityLoading={activeAvailability.isLoading}
          availabilityError={activeAvailability.isError ? activeAvailability.error : null}
          onRetry={() => void activeAvailability.refetch()}
          blockKey="edit:modal"
          informationOnly={!hasChanges}
        />
      )}
      <StockSubmitBlockedHint visible={stockBlocked} />
      {!isLoading && (
        <MissingAttributesHint missing={missingAttributes} className="mt-4" />
      )}
    </BaseModal>
  );
}
