'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { PackageSearch } from 'lucide-react';
import { LiaMinusSolid, LiaPlusSolid, LiaSpinnerSolid, LiaTimesSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/state-panels';
import ProductSelectionModal, {
  type SelectableProduct,
  type VariantOption,
} from '@/components/ui/product-selection-modal';
import type {
  FollowupChangeProductInput,
  FollowupChangeProductsBody,
  FollowupChangeProductsResponse,
  FollowupChangeProductVariant,
  FollowupCustomVariant,
} from '@/lib/api/followup';
import { useFollowupChangeProductsMutation } from '@/services/followup';
import {
  orderDetailsQueryOptions,
  useProductsVariantsOptions,
  type VariantOption as CatalogueVariantOption,
} from '@/services/orders';
import { mapOrderProductToVariantInfo, type Order, type OrderProduct } from '@/types/orders';
import { getAvailabilityRefusalMessage, refusalToastOptions } from '@/utils/apiError';
import { formatMoney } from '@/utils/formatMoney';
import { useI18n } from '@/i18n/I18nProvider';
import { OrderlessVariantAvailabilityPanel } from '@/components/stock/OrderlessVariantAvailabilityPanel';
import {
  draftFromLines,
  probeQuantityOf,
  type Selection,
} from '@/components/stock/variantAvailabilityModel';
import { CARRIER_SEND_NOT_SENT_WARNING, carrierSendNeedsAttention } from '@/utils/manualOrder/carrierSend';

const MAX_TOTAL_COST = 9_999_999;

export interface ChangeProductsLine {
  key: string;
  rowId: number;
  productId: number;
  name: string;
  variantOptions: VariantOption[];
  variants: FollowupChangeProductVariant[];
  attributeOptionIds: Selection;
  customVariants: FollowupCustomVariant[];
  quantity: number;
  unavailable: boolean;
}

interface CurrentProductRow {
  key: string;
  name: string;
  labels: string[];
  quantity: number;
}

interface ChangeProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  onDone?: (response: FollowupChangeProductsResponse) => void;
}

export const lineKeyOf = (
  productId: number,
  variants: FollowupChangeProductVariant[],
  customVariants: FollowupCustomVariant[],
): string =>
  JSON.stringify([
    productId,
    variants.map((v) => [v.name, v.optionName]),
    customVariants.map((c) => [c.label, c.value]),
  ]);

export const mergeLines = <T extends ChangeProductsLine>(current: T[], incoming: T[]): T[] => {
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

export const isLineComplete = (line: ChangeProductsLine): boolean =>
  !line.unavailable &&
  line.variantOptions.every((option) => line.attributeOptionIds[option.attributeId] !== undefined);

const attributePairsOf = (selection: Selection): string =>
  Object.entries(selection)
    .map(([attributeId, optionId]) => `${attributeId}:${optionId}`)
    .sort()
    .join(',');

const customPairsOf = (customVariants: FollowupCustomVariant[]): string =>
  customVariants
    .map((custom) => `${custom.label.trim()}=${custom.value.trim()}`)
    .sort()
    .join(',');

export const idLineKeyOf = (
  productId: number,
  attributeOptionIds: Selection,
  customVariants: FollowupCustomVariant[],
): string => [productId, attributePairsOf(attributeOptionIds), customPairsOf(customVariants)].join('|');

export const lineSignatureOf = (line: ChangeProductsLine): string =>
  `${idLineKeyOf(line.productId, line.attributeOptionIds, line.customVariants)}|${line.quantity}`;

export const linesSignatureOf = (lines: ChangeProductsLine[]): string =>
  lines.map(lineSignatureOf).sort().join(';');

export const selectionWithin = (variantOptions: VariantOption[], selection: Selection): Selection =>
  Object.fromEntries(
    Object.entries(selection).filter(([attributeId, optionId]) =>
      variantOptions.some(
        (option) =>
          option.attributeId === Number(attributeId) &&
          option.optionDetails.some((detail) => detail.id === optionId),
      ),
    ),
  ) as Selection;

const pickerOptionOf = (option: CatalogueVariantOption): VariantOption => ({
  attribute: option.displayName,
  attributeId: option.attributeId,
  options: option.options.map((detail) => detail.displayName),
  optionDetails: option.options.map((detail) => ({ id: detail.id, name: detail.displayName })),
});

export const missingAttributesOf = (line: ChangeProductsLine): string[] =>
  line.variantOptions
    .filter((option) => line.attributeOptionIds[option.attributeId] === undefined)
    .map((option) => option.attribute);

export const incompleteVariantMessageOf = (missing: string[]): string =>
  missing.length > 1 ? `اختر المتغيرات الناقصة: ${missing.join('، ')}` : `اختر ${missing[0]} لإكمال المنتج`;

const currentProductsFromOrder = (order: Order): CurrentProductRow[] =>
  order.order_products.map((orderProduct, index) => {
    const info = mapOrderProductToVariantInfo(orderProduct);
    return {
      key: `${orderProduct.productId}-${index}`,
      name: info.productName,
      labels: [
        ...info.attributes.map((a) => `${a.name}: ${a.value}`),
        ...(info.customVariants ?? []).map((c) => `${c.label}: ${c.value}`),
      ],
      quantity: info.quantity ?? 1,
    };
  });

export const orderVariants = (
  variantOptions: VariantOption[],
  variants: FollowupChangeProductVariant[],
): FollowupChangeProductVariant[] =>
  variantOptions.flatMap((option) => {
    const variant = variants.find((v) => v.name === option.attribute);
    return variant ? [variant] : [];
  });

export const variantsFromSelection = (
  variantOptions: VariantOption[],
  selection: Selection,
): FollowupChangeProductVariant[] =>
  orderVariants(
    variantOptions,
    variantOptions.flatMap((option) => {
      const optionId = selection[option.attributeId];
      const name = option.optionDetails.find((detail) => detail.id === optionId)?.name;
      return optionId !== undefined && name ? [{ name: option.attribute, optionName: name }] : [];
    }),
  );

export const draftForProductLines = (
  lines: ChangeProductsLine[],
  productId: number,
  excludeKey?: string,
) => {
  const sameProduct = lines.filter((line) => line.productId === productId && line.key !== excludeKey);
  const attributeCount = lines.find((line) => line.productId === productId)?.variantOptions.length ?? 0;
  return draftFromLines(
    sameProduct.map((line) => ({
      optionIds: Object.values(line.attributeOptionIds),
      quantity: line.quantity,
    })),
    attributeCount,
  );
};

const nextLineRowId = (() => {
  let sequence = 0;
  return () => {
    sequence += 1;
    return sequence;
  };
})();

export const linesFromPicker = (products: SelectableProduct[]): ChangeProductsLine[] =>
  products.map((product) => {
    const variantOptions = product.variantOptions ?? [];
    const variants = orderVariants(
      variantOptions,
      (product.selectedVariants ?? []).map((v) => ({ name: v.attribute, optionName: v.option })),
    );
    const attributeOptionIds: Selection = {};
    variantOptions.forEach((option) => {
      const chosen = (product.selectedVariants ?? []).find((v) => v.attribute === option.attribute);
      if (chosen?.attributeOptionId !== undefined) {
        attributeOptionIds[option.attributeId] = chosen.attributeOptionId;
      }
    });
    return {
      key: lineKeyOf(product.id, variants, []),
      rowId: nextLineRowId(),
      productId: product.id,
      name: product.name,
      variantOptions,
      variants,
      attributeOptionIds,
      customVariants: [],
      quantity: 1,
      unavailable: false,
    };
  });

const seedLineOf = (
  orderProduct: OrderProduct,
  catalogue: Map<number, CatalogueVariantOption[]>,
): ChangeProductsLine => {
  const loaded = catalogue.get(orderProduct.productId);
  const variantOptions = (loaded ?? []).map(pickerOptionOf);
  const attributes = orderProduct.attributes ?? [];
  const attributeOptionIds: Selection = {};
  attributes.forEach((attribute) => {
    attributeOptionIds[attribute.id] = attribute.options.id;
  });
  const unavailable =
    loaded === undefined ||
    attributes.some(
      (attribute) =>
        !variantOptions.some(
          (option) =>
            option.attributeId === attribute.id &&
            option.optionDetails.some((detail) => detail.id === attribute.options.id),
        ),
    );
  const variants = variantsFromSelection(variantOptions, attributeOptionIds);
  const customVariants = orderProduct.customVariants ?? [];
  return {
    key: idLineKeyOf(orderProduct.productId, attributeOptionIds, customVariants),
    rowId: nextLineRowId(),
    productId: orderProduct.productId,
    name: orderProduct.products.name,
    variantOptions,
    variants,
    attributeOptionIds,
    customVariants,
    quantity: 1,
    unavailable,
  };
};

export const seedLinesOf = (
  orderProducts: OrderProduct[],
  catalogue: Map<number, CatalogueVariantOption[]>,
): ChangeProductsLine[] =>
  orderProducts.reduce<ChangeProductsLine[]>(
    (lines, orderProduct) => mergeLines(lines, [seedLineOf(orderProduct, catalogue)]),
    [],
  );

export default function ChangeProductsModal({
  isOpen,
  onClose,
  orderId,
  onDone,
}: ChangeProductsModalProps) {
  const orderQuery = useQuery({ ...orderDetailsQueryOptions(orderId), enabled: isOpen });
  const changeProductsMutation = useFollowupChangeProductsMutation();
  const [lines, setLines] = useState<ChangeProductsLine[]>([]);
  const [totalCostInput, setTotalCostInput] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [seedSignature, setSeedSignature] = useState<string | null>(null);
  const seededRef = useRef(false);

  const currentProducts = useMemo(
    () => (orderQuery.data ? currentProductsFromOrder(orderQuery.data) : []),
    [orderQuery.data],
  );

  const orderProductIds = useMemo(
    () => (orderQuery.data?.order_products ?? []).map((orderProduct) => orderProduct.productId),
    [orderQuery.data],
  );
  const catalogueQuery = useProductsVariantsOptions(orderProductIds);

  useEffect(() => {
    if (!isOpen || seededRef.current || !orderQuery.data || catalogueQuery.isPending) return;
    seededRef.current = true;
    const seeded = seedLinesOf(orderQuery.data.order_products, catalogueQuery.byProductId);
    setSeedSignature(linesSignatureOf(seeded));
    setLines((current) => (current.length === 0 ? seeded : mergeLines(seeded, current)));
  }, [isOpen, orderQuery.data, catalogueQuery.isPending, catalogueQuery.byProductId]);

  const isPending = changeProductsMutation.isPending;
  const totalCost = totalCostInput.trim() === '' ? undefined : Number(totalCostInput);
  const isTotalCostInvalid =
    totalCost !== undefined &&
    (!Number.isFinite(totalCost) || totalCost < 0 || totalCost > MAX_TOTAL_COST);
  const isUnchanged =
    seedSignature !== null &&
    linesSignatureOf(lines) === seedSignature &&
    totalCostInput.trim() === '';
  const { t } = useI18n();
  const canConfirm =
    orderQuery.isSuccess &&
    seedSignature !== null &&
    !catalogueQuery.isPending &&
    lines.length > 0 &&
    lines.every(isLineComplete) &&
    !isTotalCostInvalid &&
    !isPending &&
    !isUnchanged;

  const resetForm = () => {
    seededRef.current = false;
    setSeedSignature(null);
    setLines([]);
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
    setLines(mergeLines(lines, linesFromPicker(products)));
  };

  const handleRemoveLine = (key: string) => {
    setLines(lines.filter((line) => line.key !== key));
  };

  const handleUpdateLine = (
    key: string,
    patch: Partial<Pick<ChangeProductsLine, 'variants' | 'quantity' | 'attributeOptionIds' | 'unavailable'>>,
  ) => {
    const target = lines.find((line) => line.key === key);
    if (!target) return;
    const updated = { ...target, ...patch };
    const nextKey = patch.variants
      ? lineKeyOf(updated.productId, updated.variants, updated.customVariants)
      : target.key;
    const others = lines.filter((line) => line.key !== key);
    const next = { ...updated, key: nextKey };
    setLines(
      others.some((line) => line.key === nextKey)
        ? mergeLines(others, [next])
        : lines.map((line) => (line.key === key ? next : line)),
    );
  };

  const handleSelectionChange = (key: string, next: Selection) => {
    const target = lines.find((line) => line.key === key);
    if (!target) return;
    const selection = selectionWithin(target.variantOptions, next);
    handleUpdateLine(key, {
      variants: variantsFromSelection(target.variantOptions, selection),
      attributeOptionIds: selection,
      unavailable: false,
    });
  };

  const draftForProduct = (productId: number, excludeKey?: string) =>
    draftForProductLines(lines, productId, excludeKey);

  const handleChangeQuantity = (key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    handleUpdateLine(key, { quantity });
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    const products: FollowupChangeProductInput[] = lines.map(
      ({ productId, quantity, variants, attributeOptionIds, customVariants }) => ({
        productId,
        quantity,
        variants,
        attributeOptionIds: Object.values(attributeOptionIds),
        customVariants,
      }),
    );
    const body: FollowupChangeProductsBody = { products, totalCost };
    try {
      const response = await changeProductsMutation.mutateAsync({ orderId, ...body });
      toast.success('تم تغيير المنتج بنجاح');
      if (carrierSendNeedsAttention(response.carrierSend)) {
        toast.warning(CARRIER_SEND_NOT_SENT_WARNING);
      }
      resetForm();
      onDone?.(response);
      onClose();
    } catch (err: unknown) {
      toast.error(getAvailabilityRefusalMessage(err, 'تعذر تغيير المنتج'), refusalToastOptions(err));
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
              <LiaSpinnerSolid className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : orderQuery.isError ? (
            <p className="text-sm text-destructive">تعذر تحميل تفاصيل الطلب</p>
          ) : (
            <>
              {currentProducts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-foreground">المنتجات الحالية</span>
                  <div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
                    {currentProducts.map((row) => (
                      <div
                        key={row.key}
                        className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
                      >
                        <span className="truncate">
                          {row.name}
                          {row.labels.length > 0 && ` - ${row.labels.join(' • ')}`}
                        </span>
                        <span className="shrink-0">× {row.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-foreground">المنتجات الجديدة</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 max-sm:h-10"
                    onClick={() => setIsPickerOpen(true)}
                    disabled={isPending}
                  >
                    <LiaPlusSolid className="size-3.5" />
                    إضافة منتج
                  </Button>
                </div>
                {lines.length === 0 && seedSignature === null ? (
                  <div className="flex items-center justify-center py-6">
                    <LiaSpinnerSolid className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : lines.length === 0 ? (
                  <EmptyState
                    icon={
                      <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
                        <PackageSearch className="size-5 text-muted-foreground" />
                      </span>
                    }
                    title="لم يتم اختيار منتجات"
                    className="py-6"
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {lines.map((line) => (
                      <div
                        key={line.rowId}
                        className="flex flex-col gap-3 p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            title={line.name}
                            className="text-sm font-medium text-foreground line-clamp-2 break-words flex-1 min-w-0"
                          >
                            {line.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              className="max-sm:size-10"
                              aria-label="تقليل الكمية"
                              onClick={() => handleChangeQuantity(line.key, line.quantity - 1)}
                              disabled={isPending || line.quantity <= 1}
                            >
                              <LiaMinusSolid className="size-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{line.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              className="max-sm:size-10"
                              aria-label="زيادة الكمية"
                              onClick={() => handleChangeQuantity(line.key, line.quantity + 1)}
                              disabled={isPending}
                            >
                              <LiaPlusSolid className="size-3" />
                            </Button>
                          </div>
                          <button
                            type="button"
                            aria-label="إزالة المنتج"
                            onClick={() => handleRemoveLine(line.key)}
                            disabled={isPending}
                            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            <LiaTimesSolid className="size-4" />
                          </button>
                        </div>

                        {line.variantOptions.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <OrderlessVariantAvailabilityPanel
                              productId={line.productId}
                              productName={line.name}
                              targetStatus="CONFIRMED"
                              quantity={probeQuantityOf(line.quantity)}
                              draft={draftForProduct(line.productId, line.key).draft}
                              excludedLines={draftForProduct(line.productId, line.key).excluded}
                              selection={line.attributeOptionIds}
                              onChange={isPending ? undefined : (next) => handleSelectionChange(line.key, next)}
                            />
                          </div>
                        )}

                        {line.unavailable ? (
                          <p className="text-sm text-destructive">المنتج أو المتغير لم يعد موجودا</p>
                        ) : (
                          !isLineComplete(line) && (
                            <p className="text-sm text-destructive">{incompleteVariantMessageOf(missingAttributesOf(line))}</p>
                          )
                        )}
                      </div>
                    ))}
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
                {orderQuery.data && (
                  <p className="text-xs text-muted-foreground">
                    الإجمالي الحالي {formatMoney(String(orderQuery.data.totalCost))}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  المبلغ يشمل الشحن. اتركه فارغًا لاستخدام سعر المنتجات مع الشحن كما هو.
                </p>
                {isUnchanged && lines.length > 0 && (
                  <p className="text-sm text-muted-foreground">لم يتم تغيير المنتجات</p>
                )}
              </div>
            </>
          )}
        </div>
      </BaseModal>

      <ProductSelectionModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleProductsPicked}
        availability={{
          targetStatus: 'CONFIRMED',
          quantity: 1,
          draftFor: (productId) => draftForProduct(productId),
        }}
      />
    </>
  );
}
