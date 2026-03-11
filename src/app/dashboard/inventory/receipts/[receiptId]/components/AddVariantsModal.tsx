'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { LiaPlusSolid, LiaSearchSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { MOCK_PRODUCT_VARIANTS, MOCK_PRODUCT_VARIANT_MAP } from '../constants';
import { ProductVariant, SelectedVariant } from '../types';

interface AddVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  existingVariants?: SelectedVariant[];
  onSave: (variants: SelectedVariant[]) => void;
}

interface VariantSelection {
  variantId: number;
  color: string | null;
  size: string | null;
}

const AddVariantsModal = memo(
  ({ isOpen, onClose, productId, productName, existingVariants = [], onSave }: AddVariantsModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selections, setSelections] = useState<VariantSelection[]>(() =>
      existingVariants.map((v) => ({
        variantId: v.variantId,
        color: v.color,
        size: v.size,
      }))
    );
    const [expandedVariantId, setExpandedVariantId] = useState<number | null>(null);

    const productVariantIds = MOCK_PRODUCT_VARIANT_MAP[productId] ?? [];
    const productVariants = useMemo(
      () => MOCK_PRODUCT_VARIANTS.filter((v) => productVariantIds.includes(v.id)),
      [productVariantIds]
    );

    const filteredVariants = useMemo(() => {
      if (!searchQuery.trim()) return productVariants;
      const q = searchQuery.trim().toLowerCase();
      return productVariants.filter((v) =>
        v.name.toLowerCase().includes(q)
      );
    }, [searchQuery, productVariants]);

    const isVariantSelected = useCallback(
      (variantId: number, color: string, size: string) =>
        selections.some(
          (s) => s.variantId === variantId && s.color === color && s.size === size
        ),
      [selections]
    );

    const hasAnySelection = useCallback(
      (variantId: number) => selections.some((s) => s.variantId === variantId),
      [selections]
    );

    const getSelectedColor = useCallback(
      (variantId: number) => {
        const sel = selections.find((s) => s.variantId === variantId);
        return sel?.color ?? null;
      },
      [selections]
    );

    const getSelectedSizes = useCallback(
      (variantId: number, color: string) =>
        selections
          .filter((s) => s.variantId === variantId && s.color === color)
          .map((s) => s.size)
          .filter(Boolean) as string[],
      [selections]
    );

    const handleColorSelect = useCallback(
      (variantId: number, color: string) => {
        setSelections((prev) => {
          const withoutVariantColor = prev.filter(
            (s) => !(s.variantId === variantId)
          );
          return [...withoutVariantColor, { variantId, color, size: null }];
        });
      },
      []
    );

    const handleSizeToggle = useCallback(
      (variantId: number, color: string, size: string) => {
        setSelections((prev) => {
          const exists = prev.some(
            (s) => s.variantId === variantId && s.color === color && s.size === size
          );
          if (exists) {
            const filtered = prev.filter(
              (s) => !(s.variantId === variantId && s.color === color && s.size === size)
            );
            const hasOtherSizes = filtered.some(
              (s) => s.variantId === variantId && s.color === color && s.size !== null
            );
            if (!hasOtherSizes) {
              return filtered.filter(
                (s) => !(s.variantId === variantId && s.color === color && s.size === null)
              );
            }
            return filtered;
          }
          const withoutPlaceholder = prev.filter(
            (s) => !(s.variantId === variantId && s.color === color && s.size === null)
          );
          return [...withoutPlaceholder, { variantId, color, size }];
        });
      },
      []
    );

    const handleToggleExpand = useCallback((variantId: number) => {
      setExpandedVariantId((prev) => (prev === variantId ? null : variantId));
    }, []);

    const totalSelectedCount = useMemo(
      () => selections.filter((s) => s.size !== null).length,
      [selections]
    );

    const handleSave = useCallback(() => {
      const validSelections: SelectedVariant[] = selections
        .filter((s): s is VariantSelection & { color: string; size: string } =>
          s.color !== null && s.size !== null
        )
        .map((s) => {
          const variant = productVariants.find((v) => v.id === s.variantId);
          const existing = existingVariants.find(
            (ev) => ev.variantId === s.variantId && ev.color === s.color && ev.size === s.size
          );
          return {
            variantId: s.variantId,
            variantName: variant?.name ?? '',
            color: s.color,
            size: s.size,
            quantity: existing?.quantity ?? 1,
          };
        });
      onSave(validSelections);
      onClose();
    }, [selections, existingVariants, productVariants, onSave, onClose]);

    const handleClose = useCallback(() => {
      setSearchQuery('');
      setSelections(
        existingVariants.map((v) => ({
          variantId: v.variantId,
          color: v.color,
          size: v.size,
        }))
      );
      setExpandedVariantId(null);
      onClose();
    }, [existingVariants, onClose]);

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="اختر المتغيرات"
        showFooter={false}
      >
        <div className="flex flex-col gap-4">
          <Input
            placeholder="ابحث عن المنتج.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={LiaSearchSolid as any}
            clearable
            onClear={() => setSearchQuery('')}
          />

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr] bg-[#f1eefa] px-4 py-3">
              <span className="text-sm font-bold text-gray-700">صور المنتج</span>
              <span className="text-sm font-bold text-gray-700 text-left">الاسم</span>
            </div>

            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {filteredVariants.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-gray-400">لا توجد نتائج</p>
                </div>
              ) : (
                filteredVariants.map((variant) => (
                  <VariantRow
                    key={variant.id}
                    variant={variant}
                    isExpanded={expandedVariantId === variant.id}
                    isSelected={hasAnySelection(variant.id)}
                    selectedColor={getSelectedColor(variant.id)}
                    getSelectedSizes={getSelectedSizes}
                    onToggleExpand={handleToggleExpand}
                    onColorSelect={handleColorSelect}
                    onSizeToggle={handleSizeToggle}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="rounded-full font-semibold px-6"
              onClick={handleClose}
            >
              إلغاء
            </Button>
            <Button
              variant="default"
              className="rounded-full font-semibold flex items-center gap-2 px-6"
              onClick={handleSave}
              disabled={totalSelectedCount === 0}
            >
              <LiaPlusSolid className="w-4 h-4" />
              إضافة ({totalSelectedCount})
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }
);

AddVariantsModal.displayName = 'AddVariantsModal';

interface VariantRowProps {
  variant: ProductVariant;
  isExpanded: boolean;
  isSelected: boolean;
  selectedColor: string | null;
  getSelectedSizes: (variantId: number, color: string) => string[];
  onToggleExpand: (variantId: number) => void;
  onColorSelect: (variantId: number, color: string) => void;
  onSizeToggle: (variantId: number, color: string, size: string) => void;
}

const VariantRow = memo(
  ({
    variant,
    isExpanded,
    isSelected,
    selectedColor,
    getSelectedSizes,
    onToggleExpand,
    onColorSelect,
    onSizeToggle,
  }: VariantRowProps) => {
    const selectedSizes = selectedColor
      ? getSelectedSizes(variant.id, selectedColor)
      : [];

    return (
      <div
        className={clsx(
          'transition-colors',
          isSelected && 'bg-primary/5'
        )}
      >
        <div
          className="grid grid-cols-[auto_1fr] items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onToggleExpand(variant.id)}
        >
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={variant.image}
              alt={variant.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-medium text-gray-800">{variant.name}</span>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-600 shrink-0">الالوان :</span>
              {variant.colors.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className={clsx(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedColor === color
                      ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                  )}
                  onClick={() => onColorSelect(variant.id, color)}
                >
                  {color}
                </Button>
              ))}
            </div>

            {selectedColor && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 shrink-0">المقاسات :</span>
                {variant.sizes.map((size) => {
                  const isSizeSelected = selectedSizes.includes(size);
                  return (
                    <Button
                      key={size}
                      variant="outline"
                      size="icon"
                      className={clsx(
                        'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                        isSizeSelected
                          ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                      )}
                      onClick={() => onSizeToggle(variant.id, selectedColor, size)}
                    >
                      {size}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

VariantRow.displayName = 'VariantRow';

export default AddVariantsModal;
