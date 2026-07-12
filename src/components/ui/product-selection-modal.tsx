'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import clsx from 'clsx';
import BaseModal from './base-modal';
import Input from './Input';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { useDebounce } from '@/utils/debounce';
import api from '@/lib/api';

export interface VariantOption {
  attribute: string;
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
}

function isValueDisabled(
  attribute: string,
  option: string,
  currentSelection: Record<string, string>,
  addedCombos: SelectedVariant[][],
  allAttributes: string[],
): boolean {
  if (addedCombos.length === 0) return false;

  const hypothetical = { ...currentSelection, [attribute]: option };

  const filledAttributes = allAttributes.filter((l) => hypothetical[l]);
  if (filledAttributes.length < allAttributes.length) return false;

  return addedCombos.some((combo) =>
    allAttributes.every((l) => combo.find((v) => v.attribute === l)?.option === hypothetical[l]),
  );
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  existingProductIds = [],
  existingVariantCombos,
  allowVariants = true,
}: ProductSelectionModalProps) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<SelectableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [addedCombos, setAddedCombos] = useState<Map<number, SelectedVariant[][]>>(new Map());
  const [currentSelection, setCurrentSelection] = useState<Map<number, Record<string, string>>>(new Map());

  const debouncedSearch = useDebounce(search, 300);

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
    (productId: number, attribute: string, option: string) => {
      setCurrentSelection((prev) => {
        const next = new Map(prev);
        const current = { ...(next.get(productId) ?? {}) };
        current[attribute] = current[attribute] === option ? '' : option;
        next.set(productId, current);
        return next;
      });
    },
    [],
  );

  const handleAddCombo = useCallback(
    (productId: number, attributes: string[]) => {
      const selection = currentSelection.get(productId);
      if (!selection) return;

      const product = products.find((p) => p.id === productId);

      const combo: SelectedVariant[] = attributes
        .filter((l) => selection[l])
        .map((l) => {
          const group = product?.variantOptions?.find((o) => o.attribute === l);
          const opt = group?.optionDetails.find((o) => o.name === selection[l]);
          return { attribute: l, option: selection[l], attributeOptionId: opt?.id ?? 0 };
        });

      if (combo.length !== attributes.length) return;

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
    [currentSelection, products],
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
        const allAttributes = (p.variantOptions ?? []).map((o) => o.attribute);
        for (const combo of combos) {
          const isExisting = existingCombosForProduct.some((existing) =>
            allAttributes.every(
              (l) =>
                existing.find((v) => v.attribute === l)?.option ===
                combo.find((v) => v.attribute === l)?.option,
            ),
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
      confirmText={`اضافة (${selectedIds.size})`}
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

        <div className="bg-[#EAEAEA66] p-4 mt-2 rounded-sm flex text-sm font-semibold">
          <div className="w-1/2 text-center">صور المنتج</div>
          <div className="w-1/2 text-center">الاسم</div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {isLoading && products.length === 0 ? (
            <div className="pb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b mb-2 border-gray-100 rounded-sm bg-white"
                >
                  <div className="flex items-center p-3">
                    <div className="w-1/2 flex justify-center">
                      <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse" />
                    </div>
                    <div className="w-1/2 flex justify-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="px-3 py-8 text-[#878A99] text-center">
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
                const selection = currentSelection.get(product.id) ?? {};
                const allAttributes = (product.variantOptions ?? []).map((o) => o.attribute);
                const allAttributesFilled = allAttributes.length > 0 && allAttributes.every((l) => selection[l]);

                return (
                  <div
                    key={product.id}
                    className={clsx(
                      'border-b mb-2 border-gray-100 rounded-sm transition-colors',
                      isAlreadyInTable
                        ? 'bg-primary/5 opacity-60'
                        : isChecked
                          ? 'bg-gray-50'
                          : 'bg-white hover:bg-gray-50',
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
                        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                              لا توجد صورة
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-1/2 text-center font-medium flex flex-col items-center gap-1">
                        <span>{product.name}</span>
                        {isAlreadyInTable && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            في الفاتورة
                          </span>
                        )}
                      </div>
                    </label>

                    {isChecked && hasVariants && (
                      <div className="px-4 pb-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {product.variantOptions!.map((option) => (
                          <div key={option.attribute} className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-16">
                              {option.attribute}:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {option.options.map((value) => {
                                const isSelected = selection[option.attribute] === value;
                                const disabled = isValueDisabled(
                                  option.attribute,
                                  value,
                                  selection,
                                  productCombos,
                                  allAttributes,
                                );
                                return (
                                  <Button
                                    key={value}
                                    type="button"
                                    variant={isSelected ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={disabled}
                                    className={clsx(
                                      'rounded-full text-xs h-7 px-3',
                                      !isSelected && !disabled && 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary',
                                    )}
                                    onClick={() => handleVariantSelect(product.id, option.attribute, value)}
                                  >
                                    {value}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          disabled={!allAttributesFilled}
                          className="rounded-full text-xs h-7 px-4 w-fit self-end"
                          onClick={() => handleAddCombo(product.id, allAttributes)}
                        >
                          <LiaPlusSolid className="w-4 h-4" />
                          اضافة
                        </Button>

                        {productCombos.length > 0 && (() => {
                          const existingCombosForProduct = existingVariantCombos?.get(product.id) ?? [];
                          return (
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
                              {productCombos.map((combo, idx) => {
                                const isPreExisting = existingCombosForProduct.some((existing) =>
                                  allAttributes.every(
                                    (l) =>
                                      existing.find((v) => v.attribute === l)?.option ===
                                      combo.find((v) => v.attribute === l)?.option,
                                  ),
                                );
                                return (
                                  <span
                                    key={idx}
                                    className={clsx(
                                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                                      isPreExisting
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-primary/10 text-primary',
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
