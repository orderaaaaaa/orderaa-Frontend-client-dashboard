'use client';

import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { useProductAttributeOptionsQuery } from '@/services/products';
import { AttributeOptionGroup, SelectedVariant } from '../types';

const EMPTY_VARIANTS: SelectedVariant[] = [];

function displayGroupName(name: string): string {
  return name.trim().toLowerCase() === 'variant' ? 'متغير' : name;
}

interface AddVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  existingVariants?: SelectedVariant[];
  onSave: (variants: SelectedVariant[]) => void;
}

interface VariantCombo {
  attributeOptionIds: number[];
  attributeLabels: string[];
}

function sortedKey(ids: number[]): string {
  return [...ids].sort((a, b) => a - b).join('-');
}

function buildCombo(
  pickedPerGroup: Record<number, number | null>,
  groups: AttributeOptionGroup[],
): VariantCombo | null {
  if (groups.length === 0) return null;

  const attributeOptionIds: number[] = [];
  const attributeLabels: string[] = [];
  for (const group of groups) {
    const pickedId = pickedPerGroup[group.id];
    if (pickedId == null) return null;
    const option = group.options.find((o) => o.id === pickedId);
    if (!option) return null;
    attributeOptionIds.push(pickedId);
    attributeLabels.push(option.name);
  }

  return { attributeOptionIds, attributeLabels };
}

const AddVariantsModal = memo(
  ({ isOpen, onClose, productId, productName, existingVariants = EMPTY_VARIANTS, onSave }: AddVariantsModalProps) => {
    const { data, isLoading } = useProductAttributeOptionsQuery(isOpen ? productId : undefined);
    const groups = useMemo(
      () =>
        (data?.options ?? [])
          .map((g) => ({ ...g, options: g.options ?? [] }))
          .filter((g) => g.options.length > 0),
      [data],
    );

    const [pickedPerGroup, setPickedPerGroup] = useState<Record<number, number | null>>({});
    const [staged, setStaged] = useState<SelectedVariant[]>([]);
    const [noAttrsQuantity, setNoAttrsQuantity] = useState<number>(1);

    const existingVariantsRef = useRef(existingVariants);
    existingVariantsRef.current = existingVariants;
    const seededRef = useRef(false);

    useEffect(() => {
      if (!isOpen) {
        seededRef.current = false;
        return;
      }
      if (isLoading) return;
      if (seededRef.current) return;
      seededRef.current = true;

      const seedExisting = existingVariantsRef.current;

      if (groups.length === 0) {
        const existing = seedExisting.find((v) => v.attributeOptionIds.length === 0);
        setNoAttrsQuantity(typeof existing?.quantity === 'number' ? existing.quantity : 1);
        return;
      }

      setPickedPerGroup({});
      setStaged([]);
    }, [isOpen, isLoading, groups]);

    const handlePick = useCallback((groupId: number, optionId: number) => {
      setPickedPerGroup((prev) => ({
        ...prev,
        [groupId]: prev[groupId] === optionId ? null : optionId,
      }));
    }, []);

    const combo = useMemo(() => buildCombo(pickedPerGroup, groups), [pickedPerGroup, groups]);

    const existingKeys = useMemo(
      () => new Set(existingVariants.map((v) => sortedKey(v.attributeOptionIds))),
      [existingVariants],
    );

    const isComboAdded = useMemo(() => {
      if (!combo) return false;
      const key = sortedKey(combo.attributeOptionIds);
      return existingKeys.has(key) || staged.some((v) => sortedKey(v.attributeOptionIds) === key);
    }, [combo, staged, existingKeys]);

    const handleAddCombo = useCallback(() => {
      if (!combo || isComboAdded) return;
      setStaged((prev) => [
        ...prev,
        { attributeOptionIds: combo.attributeOptionIds, attributeLabels: combo.attributeLabels, quantity: 1 },
      ]);
      setPickedPerGroup({});
    }, [combo, isComboAdded]);

    const handleRemoveStaged = useCallback((key: string) => {
      setStaged((prev) => prev.filter((v) => sortedKey(v.attributeOptionIds) !== key));
    }, []);

    const totalSelectedCount = groups.length === 0 ? (noAttrsQuantity > 0 ? 1 : 0) : staged.length;

    const handleSave = useCallback(() => {
      if (groups.length === 0) {
        onSave([
          {
            attributeOptionIds: [],
            attributeLabels: [],
            quantity: Math.max(1, noAttrsQuantity),
          },
        ]);
        onClose();
        return;
      }

      if (staged.length === 0) return;
      onSave(staged);
      onClose();
    }, [groups, staged, onSave, onClose, noAttrsQuantity]);

    const handleClose = useCallback(() => {
      setPickedPerGroup({});
      setStaged([]);
      onClose();
    }, [onClose]);

    return (
      <BaseModal isOpen={isOpen} onClose={handleClose} title={`اختر المتغيرات - ${productName}`} showFooter={false}>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <PageLoading size="sm" className="py-10 min-h-0" />
          ) : groups.length === 0 ? (
            <div className="flex flex-col gap-3 py-4">
              <p className="text-sm text-gray-500">
                لا توجد متغيرات لهذا المنتج. أدخل الكمية لإضافته كمتغير واحد.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">الكمية:</span>
                <input
                  type="number"
                  min={1}
                  value={noAttrsQuantity}
                  onChange={(e) => setNoAttrsQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-center text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600 shrink-0">{displayGroupName(group.name)} :</span>
                  {group.options.map((option) => {
                    const isPicked = pickedPerGroup[group.id] === option.id;
                    return (
                      <Button
                        key={option.id}
                        variant="outline"
                        size="sm"
                        className={clsx(
                          'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          isPicked
                            ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary',
                        )}
                        onClick={() => handlePick(group.id, option.id)}
                      >
                        {option.name}
                      </Button>
                    );
                  })}
                </div>
              ))}

              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full font-semibold flex items-center gap-2 px-5 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleAddCombo}
                  disabled={!combo || isComboAdded}
                >
                  <LiaPlusSolid className="w-4 h-4" />
                  {isComboAdded ? 'تمت إضافته' : 'أضف المتغير'}
                </Button>
              </div>

              {staged.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                  <span className="text-sm font-semibold text-gray-600">المتغيرات المختارة:</span>
                  <div className="flex flex-wrap gap-2">
                    {staged.map((variant) => {
                      const key = sortedKey(variant.attributeOptionIds);
                      return (
                        <span
                          key={key}
                          className="flex items-center gap-2 rounded-full bg-primary/10 text-primary text-sm font-medium px-3 py-1.5"
                        >
                          {variant.attributeLabels.join(' / ')}
                          <button
                            type="button"
                            onClick={() => handleRemoveStaged(key)}
                            className="flex items-center justify-center rounded-full hover:bg-primary/20 p-0.5 cursor-pointer"
                          >
                            <LiaTimesSolid className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" className="rounded-full font-semibold px-6" onClick={handleClose}>
              إلغاء
            </Button>
            <Button
              variant="default"
              className="rounded-full font-semibold flex items-center gap-2 px-6"
              onClick={handleSave}
              disabled={isLoading || totalSelectedCount === 0}
            >
              <LiaPlusSolid className="w-4 h-4" />
              إضافة ({totalSelectedCount})
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  },
);

AddVariantsModal.displayName = 'AddVariantsModal';

export default AddVariantsModal;
