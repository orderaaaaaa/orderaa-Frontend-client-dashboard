'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import clsx from 'clsx';
import BaseModal from './base-modal';
import Input from './Input';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { ErrorState } from './state-panels';
import { useDebounce } from '@/utils/debounce';
import api from '@/lib/api';
import { useI18n } from '@/i18n/I18nProvider';
import { useProductVariantsOptions } from '@/services/orders';
import {
  productAttributeOptionsQueryOptions,
  useProductCards,
  useProductCardsFailed,
} from '@/services/products';
import { OrderlessVariantAvailabilityPanel } from '@/components/stock/OrderlessVariantAvailabilityPanel';
import { CARD_SCROLL_CLASS, VariantCards } from '@/components/stock/VariantCards';
import {
  comboKeyOf,
  isCardSelected,
  selectionOfCard,
  type Selection,
  type DraftSummary,
} from '@/components/stock/variantAvailabilityModel';
import type { VariantCard } from '@/lib/api/products';

export interface ProductSelectionAvailability {
  targetStatus: 'NEW_ORDER' | 'CONFIRMED';
  quantity: number;
  draftFor: (productId: number) => DraftSummary;
}

export interface VariantOption {
  attribute: string;
  attributeId: number;
  options: string[];
  optionDetails: { id: number; name: string }[];
}

export interface SelectedVariant {
  attribute: string;
  option: string;
  attributeOptionId?: number;
}

export interface SelectableProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
  variantOptions?: VariantOption[];
  selectedVariants?: SelectedVariant[];
}

interface ProductAttribute {
  id: number;
  name: string;
  options: { id: number; name: string }[];
}

interface RawApiProduct extends SelectableProduct {
  attributes?: ProductAttribute[];
}

interface ProductsApiResponse {
  data: RawApiProduct[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

function mapProductVariantOptions(product: RawApiProduct): SelectableProduct {
  return {
    ...product,
    variantOptions: (product.attributes ?? []).map((attribute) => ({
      attribute: attribute.name,
      attributeId: attribute.id,
      options: (attribute.options ?? []).map((option) => option.name),
      optionDetails: (attribute.options ?? []).map((option) => ({ id: option.id, name: option.name })),
    })),
  };
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (products: SelectableProduct[]) => void;
  existingProductIds?: string[];
  existingVariantCombos?: Map<number, SelectedVariant[][]>;
  allowVariants?: boolean;
  availability?: ProductSelectionAvailability;
}

function resolveCombo(
  product: SelectableProduct | undefined,
  attributeIds: number[],
  selection: Selection,
): SelectedVariant[] | null {
  if (attributeIds.length === 0) return null;
  const combo: SelectedVariant[] = [];
  for (const attributeId of attributeIds) {
    const optionId = selection[attributeId];
    if (optionId === undefined) return null;
    const group = product?.variantOptions?.find((o) => o.attributeId === attributeId);
    const detail = group?.optionDetails.find((o) => o.id === optionId);
    if (!group || !detail) return null;
    combo.push({ attribute: group.attribute, option: detail.name, attributeOptionId: detail.id });
  }
  return combo;
}

function emitSelectionChanges(
  productId: number,
  groups: readonly { attributeId: number }[],
  previous: Selection,
  next: Selection,
  onVariantSelect: (productId: number, attributeId: number, optionId: number) => void,
) {
  for (const group of groups) {
    const previousId = previous[group.attributeId];
    const nextId = next[group.attributeId];
    if (previousId === nextId) continue;
    const optionId = nextId === undefined ? previousId : nextId;
    if (optionId !== undefined) onVariantSelect(productId, group.attributeId, optionId);
  }
}

function AddAllVariantsButton({
  productId,
  availabilityPath,
  onAdd,
}: {
  productId: number;
  availabilityPath: boolean;
  onAdd: (productId: number) => void;
}) {
  const cardsFailed = useProductCardsFailed(availabilityPath ? [productId] : []);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full text-xs h-7 px-4 max-sm:h-10"
      disabled={cardsFailed}
      onClick={() => onAdd(productId)}
    >
      <LiaPlusSolid className="w-4 h-4" />
      إضافة كل المتغيرات
    </Button>
  );
}

function ProductAvailabilityBlock({
  productId,
  productName,
  availability,
  selection,
  onVariantSelect,
}: {
  productId: number;
  productName: string;
  availability: ProductSelectionAvailability;
  selection: Selection;
  onVariantSelect: (productId: number, attributeId: number, optionId: number) => void;
}) {
  const catalog = useProductVariantsOptions(productId);
  const groups = catalog.data ?? [];

  const handleChange = (next: Selection) => {
    emitSelectionChanges(productId, groups, selection, next, onVariantSelect);
  };

  return (
    <OrderlessVariantAvailabilityPanel
      productId={productId}
      productName={productName}
      targetStatus={availability.targetStatus}
      quantity={availability.quantity}
      draft={availability.draftFor(productId).draft}
      excludedLines={availability.draftFor(productId).excluded}
      selection={selection}
      onChange={handleChange}
    />
  );
}

const comboKeyOfSelected = (combo: SelectedVariant[]) =>
  comboKeyOf(
    combo.flatMap((variant) =>
      variant.attributeOptionId === undefined ? [] : [variant.attributeOptionId]
    )
  );

const sameCombo = (a: SelectedVariant[], b: SelectedVariant[]) =>
  comboKeyOfSelected(a) === comboKeyOfSelected(b);

function ProductCardsBlock({
  product,
  selection,
  stagedCombos,
  onVariantSelect,
}: {
  product: SelectableProduct;
  selection: Selection;
  stagedCombos: SelectedVariant[][];
  onVariantSelect: (productId: number, attributeId: number, optionId: number) => void;
}) {
  const { t } = useI18n();
  const catalog = useProductCards(product.id);
  const cards: VariantCard[] = catalog.cards ?? [];

  if (catalog.isLoading) {
    return <p className="text-sm text-muted-foreground">جاري التحميل...</p>;
  }

  if (catalog.isError) {
    return (
      <ErrorState
        error={catalog.error}
        fallback={t('orderDetails.variants.cardsLoadError')}
        onRetry={() => void catalog.refetch()}
      />
    );
  }

  if (cards.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('orderDetails.variants.noCards')}</p>;
  }

  const stagedKeys = new Set(stagedCombos.map(comboKeyOfSelected));
  const disabledCardIds = new Set(
    cards
      .filter((card) => stagedKeys.has(comboKeyOf(card.options.map((option) => option.optionId))))
      .map((card) => card.id),
  );

  const pick = (card: VariantCard) => {
    const next: Selection = isCardSelected(card, selection) ? {} : selectionOfCard(card);
    emitSelectionChanges(product.id, product.variantOptions ?? [], selection, next, onVariantSelect);
  };

  return (
    <VariantCards
      cards={cards}
      rows={[]}
      selection={selection}
      onSelect={pick}
      disabledCardIds={disabledCardIds}
      scrollClassName={CARD_SCROLL_CLASS}
    />
  );
}

async function stagedCombosOf(
  queryClient: QueryClient,
  productId: number,
  groups: VariantOption[],
  fallbackToEveryCombo: boolean,
): Promise<SelectedVariant[][] | null> {
  const everyCombo = groups.reduce<SelectedVariant[][]>(
    (acc, group) =>
      acc.flatMap((combo) =>
        group.optionDetails.map((option) => [
          ...combo,
          {
            attribute: group.attribute,
            option: option.name,
            attributeOptionId: option.id,
          },
        ]),
      ),
    [[]],
  );
  const withoutCards = fallbackToEveryCombo ? everyCombo : null;
  try {
    const { variants } = await queryClient.fetchQuery(
      productAttributeOptionsQueryOptions(productId),
    );
    const attributeNameById = new Map(groups.map((group) => [group.attributeId, group.attribute]));
    const cardCombos: SelectedVariant[][] = [];
    for (const card of variants) {
      const combo: SelectedVariant[] = [];
      for (const option of card.options) {
        const attribute = attributeNameById.get(option.attributeId);
        if (attribute === undefined) return withoutCards;
        combo.push({ attribute, option: option.name, attributeOptionId: option.optionId });
      }
      cardCombos.push(combo);
    }
    return cardCombos;
  } catch {
    return withoutCards;
  }
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  existingProductIds = [],
  existingVariantCombos,
  allowVariants = true,
  availability,
}: ProductSelectionModalProps) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<SelectableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [addedCombos, setAddedCombos] = useState<Map<number, SelectedVariant[][]>>(new Map());
  const [currentSelection, setCurrentSelection] = useState<Map<number, Selection>>(new Map());

  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const fetchProducts = useCallback(
    async (pageNum: number, searchQuery: string, append = false) => {
      try {
        setIsLoading(true);
        const response = await api.get<ProductsApiResponse>('/products', {
          params: {
            page: pageNum,
            limit: 10,
            ...(searchQuery && { search: searchQuery }),
          },
        });

        const data = response.data;
        const mappedProducts = data.data.map(mapProductVariantOptions);
        if (append) {
          setProducts((prev) => [...prev, ...mappedProducts]);
        } else {
          setProducts(mappedProducts);
        }
        setHasNextPage(data.hasNextPage);
        setPage(data.currentPage);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (existingVariantCombos && existingVariantCombos.size > 0) {
      setSelectedIds(new Set(existingVariantCombos.keys()));
      setAddedCombos(new Map(existingVariantCombos));
    } else {
      setSelectedIds(new Set());
      setAddedCombos(new Map());
    }
    setCurrentSelection(new Map());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    fetchProducts(1, debouncedSearch, false);
  }, [isOpen, debouncedSearch, fetchProducts]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      fetchProducts(page + 1, debouncedSearch, true);
    }
  }, [hasNextPage, isLoading, page, debouncedSearch, fetchProducts]);

  const handleToggle = useCallback((productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        setAddedCombos((p) => { const n = new Map(p); n.delete(productId); return n; });
        setCurrentSelection((p) => { const n = new Map(p); n.delete(productId); return n; });
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const handleVariantSelect = useCallback(
    (productId: number, attributeId: number, optionId: number) => {
      setCurrentSelection((prev) => {
        const next = new Map(prev);
        const current: Selection = { ...(next.get(productId) ?? {}) };
        if (current[attributeId] === optionId) {
          delete current[attributeId];
        } else {
          current[attributeId] = optionId;
        }
        next.set(productId, current);
        return next;
      });
    },
    [],
  );

  const handleAddCombo = useCallback(
    (productId: number, attributeIds: number[]) => {
      const selection = currentSelection.get(productId);
      if (!selection) return;

      const product = products.find((p) => p.id === productId);

      const combo = resolveCombo(product, attributeIds, selection);
      if (!combo) return;
      if ((addedCombos.get(productId) ?? []).some((staged) => sameCombo(staged, combo))) return;

      setAddedCombos((prev) => {
        const next = new Map(prev);
        const existing = next.get(productId) ?? [];
        next.set(productId, [...existing, combo]);
        return next;
      });

      setCurrentSelection((prev) => {
        const next = new Map(prev);
        next.set(productId, {});
        return next;
      });
    },
    [addedCombos, currentSelection, products],
  );

  const handleAddAllVariants = useCallback(
    async (productId: number) => {
      const product = products.find((p) => p.id === productId);
      const groups = product?.variantOptions ?? [];
      if (!groups.length) return;

      const combos = await stagedCombosOf(
        queryClient,
        productId,
        groups,
        availability === undefined,
      );
      if (combos === null) return;

      setAddedCombos((prev) => {
        const next = new Map(prev);
        const existing = next.get(productId) ?? [];
        const missing = combos.filter(
          (combo) => !existing.some((staged) => sameCombo(staged, combo)),
        );
        next.set(productId, [...existing, ...missing]);
        return next;
      });

      setCurrentSelection((prev) => {
        const next = new Map(prev);
        next.set(productId, {});
        return next;
      });
    },
    [availability, products, queryClient],
  );

  const handleRemoveCombo = useCallback(
    (productId: number, comboIndex: number) => {
      setAddedCombos((prev) => {
        const next = new Map(prev);
        const existing = [...(next.get(productId) ?? [])];
        existing.splice(comboIndex, 1);
        next.set(productId, existing);
        return next;
      });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    const expanded: SelectableProduct[] = [];

    products
      .filter((p) => selectedIds.has(p.id))
      .forEach((p) => {
        const combos = addedCombos.get(p.id);
        if (!combos || combos.length === 0) {
          if (!existingProductIds.includes(String(p.id))) {
            expanded.push({ ...p, selectedVariants: [] });
          }
          return;
        }
        const existingCombosForProduct = existingVariantCombos?.get(p.id) ?? [];
        for (const combo of combos) {
          const isExisting = existingCombosForProduct.some((existing) =>
            sameCombo(existing, combo),
          );
          if (!isExisting) {
            expanded.push({ ...p, selectedVariants: combo });
          }
        }
      });

    onConfirm(expanded);
    setSelectedIds(new Set());
    setAddedCombos(new Map());
    setCurrentSelection(new Map());
    setSearch('');
  }, [products, selectedIds, addedCombos, existingProductIds, existingVariantCombos, onConfirm]);

  const handleClose = useCallback(() => {
    setSelectedIds(new Set());
    setAddedCombos(new Map());
    setCurrentSelection(new Map());
    setSearch('');
    onClose();
  }, [onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="اختر المنتجات"
      onConfirm={handleConfirm}
      confirmText={`إضافة (${selectedIds.size})`}
      confirmIcon={<LiaPlusSolid className="w-5 h-5 text-white" />}
      confirmDisabled={selectedIds.size === 0}
      maxWidth="md:max-w-3xl"
    >
      <div className="flex flex-col">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          clearable
          placeholder="ابحث عن المنتج.."
        />

        <div className="bg-muted p-4 mt-2 rounded-sm flex text-sm font-semibold">
          <div className="w-1/2 text-center">صور المنتج</div>
          <div className="w-1/2 text-center">الاسم</div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {isLoading && products.length === 0 ? (
            <div className="pb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b mb-2 border-border rounded-sm bg-card"
                >
                  <div className="flex items-center p-3">
                    <div className="w-1/2 flex justify-center">
                      <div className="h-12 w-12 rounded-md bg-muted animate-pulse" />
                    </div>
                    <div className="w-1/2 flex justify-center">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="px-3 py-8 text-muted-foreground text-center">
              لا توجد نتائج
            </div>
          ) : (
            <div className="pb-4">
              {products.map((product) => {
                const hasVariants =
                  allowVariants && product.variantOptions && product.variantOptions.length > 0;
                const isNoVariantInTable =
                  !hasVariants && existingProductIds.includes(String(product.id));
                const isAlreadyInTable = isNoVariantInTable;
                const isChecked = selectedIds.has(product.id);
                const productCombos = addedCombos.get(product.id) ?? [];
                const selection: Selection = currentSelection.get(product.id) ?? {};
                const allAttributeIds = (product.variantOptions ?? []).map((o) => o.attributeId);
                const readyCombo = resolveCombo(product, allAttributeIds, selection);

                return (
                  <div
                    key={product.id}
                    className={clsx(
                      'border-b mb-2 border-border rounded-sm transition-colors',
                      isAlreadyInTable
                        ? 'bg-primary/5 opacity-60'
                        : isChecked
                          ? 'bg-muted'
                          : 'bg-card hover:bg-muted',
                    )}
                  >
                    <label
                      className={clsx(
                        'flex items-center p-3',
                        isAlreadyInTable ? 'cursor-not-allowed' : 'cursor-pointer',
                      )}
                    >
                      <Checkbox
                        checked={isChecked || isAlreadyInTable}
                        onCheckedChange={() => handleToggle(product.id)}
                        disabled={isAlreadyInTable}
                        className="shrink-0"
                      />

                      <div className="w-1/2 flex justify-center">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                              لا توجد صورة
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-1/2 text-center font-medium flex flex-col items-center gap-1">
                        <span>{product.name}</span>
                        {isAlreadyInTable && (
                          <span className="text-xs text-primary-text bg-primary/10 px-2 py-0.5 rounded-full">
                            في الفاتورة
                          </span>
                        )}
                      </div>
                    </label>

                    {isChecked && hasVariants && (
                      <div className="px-4 pb-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {availability ? (
                          <ProductAvailabilityBlock
                            productId={product.id}
                            productName={product.name}
                            availability={availability}
                            selection={selection}
                            onVariantSelect={handleVariantSelect}
                          />
                        ) : (
                          <ProductCardsBlock
                            product={product}
                            selection={selection}
                            stagedCombos={productCombos}
                            onVariantSelect={handleVariantSelect}
                          />
                        )}

                        <div className="flex items-center gap-2 w-fit self-end">
                          <AddAllVariantsButton
                            productId={product.id}
                            availabilityPath={availability !== undefined}
                            onAdd={(productId) => void handleAddAllVariants(productId)}
                          />

                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={!readyCombo || productCombos.some((staged) => sameCombo(staged, readyCombo))}
                            className="rounded-full text-xs h-7 px-4 max-sm:h-10"
                            onClick={() => handleAddCombo(product.id, allAttributeIds)}
                          >
                            <LiaPlusSolid className="w-4 h-4" />
                            إضافة
                          </Button>
                        </div>

                        {productCombos.length > 0 && (() => {
                          const existingCombosForProduct = existingVariantCombos?.get(product.id) ?? [];
                          return (
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                              {productCombos.map((combo, idx) => {
                                const isPreExisting = existingCombosForProduct.some((existing) =>
                                  sameCombo(existing, combo),
                                );
                                return (
                                  <span
                                    key={idx}
                                    className={clsx(
                                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                                      isPreExisting
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-primary/10 text-primary-text',
                                    )}
                                  >
                                    {combo.map((v) => v.option).join(' - ')}
                                    {!isPreExisting && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="h-4 w-4 p-0 hover:bg-primary/20 rounded-full"
                                        onClick={() => handleRemoveCombo(product.id, idx)}
                                      >
                                        <LiaTimesSolid className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}

              {hasNextPage && (
                <div className="py-4 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
