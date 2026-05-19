'use client';

import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { LiaPlusSolid } from 'react-icons/lia';
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

function buildCombos(
  pickedPerGroup: Record<number, number | null>,
  toggledLastGroup: number[],
  groups: AttributeOptionGroup[],
): VariantCombo[] {
  if (groups.length === 0) return [];

  if (groups.length === 1) {
    const onlyGroup = groups[0];
    return toggledLastGroup
      .map((optionId) => {
        const option = onlyGroup.options.find((o) => o.id === optionId);
        if (!option) return null;
        return {
          attributeOptionIds: [optionId],
          attributeLabels: [option.name],
        };
      })
      .filter((c): c is VariantCombo => c !== null);
  }

  const priorGroups = groups.slice(0, -1);
  const lastGroup = groups[groups.length - 1];

  const priorIds: number[] = [];
  const priorLabels: string[] = [];
  for (const group of priorGroups) {
    const pickedId = pickedPerGroup[group.id];
    if (pickedId == null) return [];
    const opt = group.options.find((o) => o.id === pickedId);
    if (!opt) return [];
    priorIds.push(pickedId);
    priorLabels.push(opt.name);
  }

  return toggledLastGroup
    .map((optionId) => {
      const option = lastGroup.options.find((o) => o.id === optionId);
      if (!option) return null;
      return {
        attributeOptionIds: [...priorIds, optionId],
        attributeLabels: [...priorLabels, option.name],
      };
    })
    .filter((c): c is VariantCombo => c !== null);
}

const AddVariantsModal = memo(
  ({ isOpen, onClose, productId, productName, existingVariants = EMPTY_VARIANTS, onSave }: AddVariantsModalProps) => {
    const { data, isLoading } = useProductAttributeOptionsQuery(isOpen ? productId : undefined);
    const groups = useMemo(
      () =>
        (data?.attributeOptions ?? [])
          .map((g) => ({ ...g, options: g.options ?? [] }))
          .filter((g) => g.options.length > 0),
      [data],
    );

    const [pickedPerGroup, setPickedPerGroup] = useState<Record<number, number | null>>({});
    const [toggledLastGroup, setToggledLastGroup] = useState<number[]>([]);
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
        setNoAttrsQuantity(existing?.quantity ?? 1);
        return;
      }

      const priorGroups = groups.slice(0, -1);
      const lastGroup = groups[groups.length - 1];

      const picked: Record<number, number | null> = {};
      for (const g of priorGroups) {
        const fromExisting = seedExisting.find((v) =>
          g.options.some((o) => v.attributeOptionIds.includes(o.id)),
        );
        const optionId = fromExisting
          ? g.options.find((o) => fromExisting.attributeOptionIds.includes(o.id))?.id ?? null
          : null;
        picked[g.id] = optionId;
      }
      setPickedPerGroup(picked);

      const toggled = seedExisting
        .map((v) => {
          const lastOption = lastGroup.options.find((o) => v.attributeOptionIds.includes(o.id));
          return lastOption?.id ?? null;
        })
        .filter((id): id is number => id !== null);
      setToggledLastGroup(Array.from(new Set(toggled)));
    }, [isOpen, isLoading, groups]);

    const handlePick = useCallback((groupId: number, optionId: number) => {
      setPickedPerGroup((prev) => ({ ...prev, [groupId]: optionId }));
    }, []);

    const handleToggleLast = useCallback((optionId: number) => {
      setToggledLastGroup((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      );
    }, []);

    const combos = useMemo(
      () => buildCombos(pickedPerGroup, toggledLastGroup, groups),
      [pickedPerGroup, toggledLastGroup, groups],
    );

    const totalSelectedCount = groups.length === 0 ? (noAttrsQuantity > 0 ? 1 : 0) : combos.length;

    const lastGroup = groups[groups.length - 1];
    const priorGroups = groups.slice(0, -1);
    const priorReady = priorGroups.every((g) => pickedPerGroup[g.id] != null);

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

      const existingByKey = new Map<string, SelectedVariant>(
        existingVariants.map((v) => [sortedKey(v.attributeOptionIds), v]),
      );

      const next: SelectedVariant[] = combos.map((c) => {
        const existing = existingByKey.get(sortedKey(c.attributeOptionIds));
        return {
          attributeOptionIds: c.attributeOptionIds,
          attributeLabels: c.attributeLabels,
          quantity: existing?.quantity ?? 1,
        };
      });

      onSave(next);
      onClose();
    }, [groups, combos, existingVariants, onSave, onClose, noAttrsQuantity]);

    const handleClose = useCallback(() => {
      setPickedPerGroup({});
      setToggledLastGroup([]);
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
              {priorGroups.map((group) => (
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

              {lastGroup && priorReady && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600 shrink-0">{displayGroupName(lastGroup.name)} :</span>
                  {lastGroup.options.map((option) => {
                    const isToggled = toggledLastGroup.includes(option.id);
                    return (
                      <Button
                        key={option.id}
                        variant="outline"
                        size="sm"
                        className={clsx(
                          'px-3 h-9 min-w-[2.5rem] rounded-lg text-sm font-medium transition-colors',
                          isToggled
                            ? 'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary',
                        )}
                        onClick={() => handleToggleLast(option.id)}
                      >
                        {option.name}
                      </Button>
                    );
                  })}
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
