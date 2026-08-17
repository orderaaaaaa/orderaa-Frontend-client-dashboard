'use client';

import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useStockProducts } from '@/services/stock';
import { RULE_SCOPE_OPTIONS } from '../constants';

export type RuleScope = 'GLOBAL' | 'PRODUCT' | 'VARIANT';

export interface ScopeSelection {
  scope: RuleScope;
  productId?: number;
  variantId?: number;
}

interface Props {
  value: ScopeSelection;
  onChange: (next: ScopeSelection) => void;
}

/**
 * T28 — picks which scope's rules the screen is editing.
 *
 * The product and variant lists come from the existing stock endpoint rather
 * than a new lookup: it already returns products with their variants and the
 * variant ids the rules API needs.
 *
 * A variant is always chosen THROUGH its product, because a bare variant list
 * across a merchant's whole catalogue is unusable — and because the rule is
 * scoped to the variant alone, not to the pair.
 */
export function StockRuleScopeSelector({ value, onChange }: Props) {
  const [search, setSearch] = useState('');

  const needsProducts = value.scope !== 'GLOBAL';
  const { data, isLoading } = useStockProducts({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const products = useMemo(
    () => (needsProducts ? (data?.data ?? []) : []),
    [data, needsProducts]
  );

  const productOptions = useMemo(
    () => products.map((product) => ({ key: String(product.id), value: product.name })),
    [products]
  );

  // For VARIANT scope the product picker is a NAVIGATION aid — the rule stores
  // only the variant id, so `selectedProductId` is local state, not scope state.
  const selectedProductId =
    value.scope === 'PRODUCT'
      ? value.productId
      : products.find((product) =>
          product.variants.some((variant) => variant.id === value.variantId)
        )?.id;

  const [variantProductId, setVariantProductId] = useState<number | undefined>(
    undefined
  );
  const activeProductId =
    value.scope === 'VARIANT' ? (variantProductId ?? selectedProductId) : selectedProductId;

  const variantOptions = useMemo(() => {
    const product = products.find((item) => item.id === activeProductId);
    if (!product) return [];
    return product.variants.map((variant) => ({
      key: String(variant.id),
      value:
        variant.options.map((pair) => pair.option.name).join(' / ') ||
        variant.combinationKey,
    }));
  }, [products, activeProductId]);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3" dir="rtl">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            نطاق القواعد
          </label>
          <SearchableSelect
            options={RULE_SCOPE_OPTIONS}
            value={value.scope}
            onValueChange={(next) => {
              setVariantProductId(undefined);
              onChange({ scope: next as RuleScope });
            }}
            placeholder="نطاق القواعد"
          />
        </div>

        {needsProducts && (
          <div className="min-w-[220px]">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              المنتج
            </label>
            <SearchableSelect
              options={productOptions}
              value={activeProductId ? String(activeProductId) : ''}
              onValueChange={(next) => {
                const productId = Number(next);
                if (value.scope === 'PRODUCT') {
                  onChange({ scope: 'PRODUCT', productId });
                } else {
                  // Changing the product clears the variant: the old one belongs
                  // to a different product and would silently keep governing.
                  setVariantProductId(productId);
                  onChange({ scope: 'VARIANT' });
                }
              }}
              onSearch={setSearch}
              placeholder={isLoading ? 'جارٍ التحميل…' : 'اختر المنتج'}
            />
          </div>
        )}

        {value.scope === 'VARIANT' && (
          <div className="min-w-[220px]">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              المتغير
            </label>
            <SearchableSelect
              options={variantOptions}
              value={value.variantId ? String(value.variantId) : ''}
              onValueChange={(next) =>
                onChange({ scope: 'VARIANT', variantId: Number(next) })
              }
              placeholder={
                activeProductId ? 'اختر المتغير' : 'اختر المنتج أولًا'
              }
              disabled={!activeProductId}
            />
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-4 text-gray-500">
        {value.scope === 'GLOBAL'
          ? 'القواعد العامة تُطبق على كل منتج ليس له قواعد خاصة به.'
          : 'بمجرد إضافة قاعدة واحدة لهذا النطاق، لن تُطبق القواعد الأعلى منه على الإطلاق — حتى التحويلات التي لا تغطيها قواعد هذا النطاق.'}
      </p>
    </div>
  );
}
